const Contract = require('../models/Contract');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

const emitTo = (userId, event, data) => {
  try { const { getIO } = require('../socket/socket'); getIO().to(userId.toString()).emit(event, data); } catch {}
};

// @POST /api/contracts/generate — org generates contract from approved application
const generateContract = async (req, res) => {
  try {
    const { applicationId, jobId, salary, duration, startDate, endDate, terms } = req.body;

    let job, app;
    if (applicationId) {
      app = await Application.findById(applicationId).populate('jobId');
      if (!app) return res.status(404).json({ message: 'Application not found' });
      if (app.status !== 'approved') return res.status(400).json({ message: 'Application must be approved first' });
      job = app.jobId;
    } else if (jobId) {
      job = await Job.findById(jobId);
      if (!job) return res.status(404).json({ message: 'Job not found' });
    } else {
      return res.status(400).json({ message: 'applicationId or jobId required' });
    }

    const providerId = app ? app.providerId : job.assignedProviderId;
    if (!providerId) return res.status(400).json({ message: 'No provider assigned' });

    if (job.organizationId.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    // Check for existing contract
    const filter = applicationId ? { applicationId } : { jobId: job._id };
    const existing = await Contract.findOne(filter);
    if (existing) return res.json(existing);

    const orgUser = await require('../models/User').findById(job.organizationId).select('name');
    const provUser = await require('../models/User').findById(providerId).select('name');

    const contractAmount = salary || app?.expectedSalary || job.budget;
    const contractTerms = terms || `This contract is between ${orgUser?.name || 'Organization'} and ${provUser?.name || 'Provider'} for "${job.title}". The agreed amount is NPR ${contractAmount.toLocaleString()}. Payment will be released upon satisfactory completion of work.`;

    const contract = await Contract.create({
      applicationId: app?._id,
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
      signedByOrg: true, // Org signs on creation
    });

    // Update application status
    if (app) { app.status = 'contracted'; await app.save(); }
    job.contractGenerated = true;
    await job.save();

    // Notify provider
    await Notification.create({
      userId: providerId, type: 'contract', title: 'Contract Generated',
      message: `A contract for "${job.title}" has been generated. Please review and sign.`,
      relatedId: contract._id, referenceUrl: '/contracts',
    });
    emitTo(providerId, 'notification', { type: 'contract', message: `Contract generated for "${job.title}"` });

    res.status(201).json(contract);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('organizationId', 'name email profileImage')
      .populate('providerId', 'name email profileImage')
      .populate('jobId', 'title category budget');
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    res.json(contract);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getMyContracts = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} :
      { $or: [{ organizationId: req.user._id }, { providerId: req.user._id }] };
    const contracts = await Contract.find(filter)
      .populate('organizationId', 'name profileImage')
      .populate('providerId', 'name profileImage')
      .populate('jobId', 'title category status')
      .sort({ createdAt: -1 });
    res.json(contracts);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const signContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    const isOrg = contract.organizationId.toString() === req.user._id.toString();
    const isProv = contract.providerId.toString() === req.user._id.toString();
    if (!isOrg && !isProv) return res.status(403).json({ message: 'Not authorized' });

    if (isOrg) contract.signedByOrg = true;
    if (isProv) contract.signedByProvider = true;

    // Status auto-updates in pre-save hook
    await contract.save();

    // If both signed, activate the job
    if (contract.signedByOrg && contract.signedByProvider) {
      contract.status = 'active';
      await contract.save();
      await Job.findByIdAndUpdate(contract.jobId, { status: 'in-progress' });

      // Notify both parties
      const notifyId = isOrg ? contract.providerId : contract.organizationId;
      await Notification.create({
        userId: notifyId, type: 'contract', title: 'Contract Signed',
        message: `Contract "${contract.title}" is now active.`, relatedId: contract._id,
        referenceUrl: '/contracts',
      });
      emitTo(notifyId, 'notification', { type: 'contract', message: 'Contract signed and active' });
    }

    res.json(contract);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { generateContract, getContract, getMyContracts, signContract };
