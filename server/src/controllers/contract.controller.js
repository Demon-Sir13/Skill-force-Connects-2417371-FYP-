const Contract    = require('../models/Contract');
const Application = require('../models/Application');
const Job         = require('../models/Job');
const Notification= require('../models/Notification');

// ── Helpers ───────────────────────────────────────────────────────────────────
const emitTo = (userId, event, data) => {
  try { const { getIO } = require('../socket/socket'); getIO().to(userId.toString()).emit(event, data); } catch {}
};

const notify = async (userId, type, title, message, relatedId) => {
  await Notification.create({ userId, type, title, message, relatedId, referenceUrl: '/contracts' });
  emitTo(userId, 'notification', { type, message });
};

// ── @POST /api/contracts/generate ────────────────────────────────────────────
// STRICT: applicationId is REQUIRED. Contracts cannot be created without a
// valid application from the provider for that specific job.
const generateContract = async (req, res) => {
  try {
    const { applicationId, salary, duration, startDate, endDate, terms } = req.body;

    // ── HARD GATE: applicationId is mandatory ─────────────────────────────
    if (!applicationId) {
      return res.status(400).json({
        message: 'applicationId is required. Contracts can only be created for providers who applied to the job.',
        code: 'APPLICATION_ID_REQUIRED',
      });
    }

    // ── Validate application exists ───────────────────────────────────────
    const app = await Application.findById(applicationId).populate('jobId');
    if (!app) return res.status(404).json({ message: 'Application not found' });

    // ── Application must be approved ──────────────────────────────────────
    if (app.status !== 'approved') {
      return res.status(400).json({
        message: `Application must be approved before generating a contract. Current status: "${app.status}".`,
        code: 'APPLICATION_NOT_APPROVED',
      });
    }

    const job = app.jobId;
    if (!job) return res.status(404).json({ message: 'Job linked to application not found' });

    // ── Only the org that owns the job (or admin) can generate a contract ─
    if (job.organizationId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Not authorized. Only the organization that posted this job can generate a contract.',
        code: 'NOT_JOB_OWNER',
      });
    }

    // ── Verify the application belongs to this org's job ──────────────────
    if (app.organizationId && app.organizationId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'This application does not belong to your organization.',
        code: 'APPLICATION_NOT_YOURS',
      });
    }

    const providerId = app.providerId;
    if (!providerId) return res.status(400).json({ message: 'No provider linked to this application' });

    // ── Prevent duplicate contracts for the same application ─────────────
    const existing = await Contract.findOne({ applicationId });
    if (existing) return res.json(existing);

    const orgUser  = await require('../models/User').findById(job.organizationId).select('name');
    const provUser = await require('../models/User').findById(providerId).select('name');
    const contractAmount = salary || app.expectedSalary || job.budget;
    const contractTerms  = terms ||
      `This contract is between ${orgUser?.name || 'Organization'} and ${provUser?.name || 'Provider'} ` +
      `for "${job.title}". The agreed amount is NPR ${contractAmount.toLocaleString()}. ` +
      `Payment will be released upon satisfactory completion and org approval.`;

    const contract = await Contract.create({
      applicationId: app._id,
      jobId: job._id,
      organizationId: job.organizationId,
      providerId,
      title: job.title,
      description: job.description,
      amount: contractAmount,
      currency: 'NPR',
      duration: duration || '',
      startDate: startDate || new Date(),
      endDate: endDate || job.deadline,
      terms: contractTerms,
      status: 'draft',
      signedByOrg: true,
      orgSignedAt: new Date(),
      orgSignedIp: req.ip || '',
    });

    // Mark application as contracted
    app.status = 'contracted';
    await app.save();

    job.contractGenerated = true;
    await job.save();

    await notify(providerId, 'contract', 'Contract Generated',
      `A contract for "${job.title}" has been generated. Please review and sign.`, contract._id);

    res.status(201).json(contract);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── @GET /api/contracts/:id ───────────────────────────────────────────────────
const getContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('organizationId', 'name email profileImage')
      .populate('providerId',     'name email profileImage')
      .populate('jobId',          'title category budget');
    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    // Lazy overdue check on single fetch
    if (contract.isOverdue()) {
      contract.status = 'overdue';
      await contract.save();
    }
    res.json(contract);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── @GET /api/contracts/my ────────────────────────────────────────────────────
const getMyContracts = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} :
      { $or: [{ organizationId: req.user._id }, { providerId: req.user._id }] };

    // Sweep overdue contracts in-place before fetching
    const now = new Date();
    await Contract.updateMany(
      {
        ...filter,
        endDate: { $lt: now },
        status: { $in: ['active', 'signed'] },
      },
      { $set: { status: 'overdue' } }
    );

    // Single fetch after update — no double round-trip
    const contracts = await Contract.find(filter)
      .populate('organizationId', 'name profileImage')
      .populate('providerId',     'name profileImage')
      .populate('jobId',          'title category status')
      .sort({ createdAt: -1 });

    res.json(contracts);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── @PUT /api/contracts/:id/sign ─────────────────────────────────────────────
// Body: { signatureInput: "Rajesh Shrestha" }
const signContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    if (!['draft', 'signed'].includes(contract.status))
      return res.status(400).json({ message: `Cannot sign a contract with status: ${contract.status}` });

    const isOrg  = contract.organizationId.toString() === req.user._id.toString();
    const isProv = contract.providerId.toString()     === req.user._id.toString();
    if (!isOrg && !isProv) return res.status(403).json({ message: 'Not authorized' });

    const sigInput = (req.body.signatureInput || req.user.name || '').trim();
    const ip       = req.ip || req.headers['x-forwarded-for'] || '';

    if (isOrg && !contract.signedByOrg) {
      contract.signedByOrg          = true;
      contract.orgSignatureInput    = sigInput;
      contract.orgSignedAt          = new Date();
      contract.orgSignedIp          = ip;
    }
    if (isProv && !contract.signedByProvider) {
      contract.signedByProvider     = true;
      contract.providerSignatureInput = sigInput;
      contract.providerSignedAt     = new Date();
      contract.providerSignedIp     = ip;
    }

    // Both signed → activate
    if (contract.signedByOrg && contract.signedByProvider) {
      contract.status = 'active';
      await Job.findByIdAndUpdate(contract.jobId, { status: 'in-progress' });
      const notifyId = isOrg ? contract.providerId : contract.organizationId;
      await notify(notifyId, 'contract', 'Contract Active',
        `Contract "${contract.title}" is now active. Work can begin.`, contract._id);
    }

    await contract.save();
    res.json(contract);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── @PUT /api/contracts/:id/submit-work ──────────────────────────────────────
// Provider submits work for org approval
// Body: { note: "All deliverables uploaded to the shared drive." }
const submitWork = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    if (contract.providerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the provider can submit work' });

    if (!['active', 'overdue'].includes(contract.status))
      return res.status(400).json({ message: `Cannot submit work on a contract with status: ${contract.status}` });

    contract.status              = 'pending_review';
    contract.workSubmittedAt     = new Date();
    contract.workSubmissionNote  = (req.body.note || '').trim();

    await contract.save();

    await notify(contract.organizationId, 'contract', 'Work Submitted for Review',
      `Provider has submitted work for "${contract.title}". Please review and accept or request revision.`,
      contract._id);

    res.json(contract);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── @PUT /api/contracts/:id/approve-work ─────────────────────────────────────
// Org accepts work → releases payment → marks completed
const approveWork = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    if (contract.organizationId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the organization can approve work' });

    if (contract.status !== 'pending_review')
      return res.status(400).json({ message: 'Contract is not pending review' });

    contract.status           = 'completed';
    contract.completedAt      = new Date();
    contract.paymentReleasedAt= new Date();

    await contract.save();
    await Job.findByIdAndUpdate(contract.jobId, { status: 'completed', paid: true, rated: false });

    await notify(contract.providerId, 'payment', 'Payment Released',
      `Your work on "${contract.title}" has been approved. Payment of NPR ${contract.amount.toLocaleString()} has been released.`,
      contract._id);

    res.json(contract);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── @PUT /api/contracts/:id/request-revision ─────────────────────────────────
// Org sends work back to provider with a note
// Body: { note: "Please fix the logo colours and resubmit." }
const requestRevision = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    if (contract.organizationId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the organization can request revisions' });

    if (contract.status !== 'pending_review')
      return res.status(400).json({ message: 'Contract is not pending review' });

    contract.status           = 'active';          // back to active so provider can resubmit
    contract.revisionRequests = (contract.revisionRequests || 0) + 1;
    contract.lastRevisionNote = (req.body.note || '').trim();

    await contract.save();

    await notify(contract.providerId, 'contract', 'Revision Requested',
      `The organization has requested a revision on "${contract.title}". Note: ${contract.lastRevisionNote || 'Please review and resubmit.'}`,
      contract._id);

    res.json(contract);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = {
  generateContract,
  getContract,
  getMyContracts,
  signContract,
  submitWork,
  approveWork,
  requestRevision,
};
