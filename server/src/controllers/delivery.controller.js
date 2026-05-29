const DeliverySubmission = require('../models/DeliverySubmission');
const Contract = require('../models/Contract');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const path = require('path');
const fs = require('fs');

const emitTo = (userId, event, data) => {
  try { const { getIO } = require('../socket/socket'); getIO().to(userId.toString()).emit(event, data); } catch {}
};

const notify = async (userId, type, title, message, relatedId) => {
  await Notification.create({ userId, type, title, message, relatedId, referenceUrl: '/contracts' });
  emitTo(userId, 'notification', { type, message });
};

// ── @POST /api/delivery/:contractId — provider submits work with files ────────
const submitDelivery = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.contractId);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    if (contract.providerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the assigned provider can submit delivery' });
    if (!['active', 'overdue'].includes(contract.status))
      return res.status(400).json({ message: `Cannot submit delivery for contract with status: ${contract.status}` });

    // Count previous submissions for this contract
    const prevCount = await DeliverySubmission.countDocuments({ contractId: contract._id });

    // Build file list from multer uploads
    const files = (req.files || []).map(f => {
      const ext = path.extname(f.originalname).toLowerCase();
      let fileType = 'other';
      if (['.jpg','.jpeg','.png','.gif','.webp'].includes(ext)) fileType = 'image';
      else if (ext === '.pdf') fileType = 'pdf';
      else if (['.mp4','.mov','.avi','.webm'].includes(ext)) fileType = 'video';
      else if (['.doc','.docx','.xls','.xlsx','.txt'].includes(ext)) fileType = 'document';

      // Build URL — use Cloudinary URL if available, else local path
      const url = f.path?.startsWith('http') ? f.path : `/uploads/${f.filename}`;
      return {
        url,
        originalName: f.originalname,
        mimeType: f.mimetype,
        size: f.size,
        fileType,
      };
    });

    const submission = await DeliverySubmission.create({
      contractId: contract._id,
      jobId: contract.jobId,
      providerId: req.user._id,
      organizationId: contract.organizationId,
      deliveryNote: (req.body.deliveryNote || '').trim(),
      files,
      status: 'submitted',
      submissionNumber: prevCount + 1,
      submittedAt: new Date(),
    });

    // Update contract status to pending_review
    contract.status = 'pending_review';
    contract.workSubmittedAt = new Date();
    contract.workSubmissionNote = req.body.deliveryNote || '';
    await contract.save();

    await notify(
      contract.organizationId, 'contract',
      'Work Submitted for Review',
      `Provider has submitted delivery #${prevCount + 1} for "${contract.title}". Please review and approve.`,
      contract._id
    );

    res.status(201).json(submission);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── @GET /api/delivery/:contractId — get all submissions for a contract ───────
const getDeliveries = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.contractId);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    const isParty =
      contract.organizationId.toString() === req.user._id.toString() ||
      contract.providerId.toString() === req.user._id.toString() ||
      req.user.role === 'admin';
    if (!isParty) return res.status(403).json({ message: 'Not authorized' });

    const submissions = await DeliverySubmission.find({ contractId: req.params.contractId })
      .populate('providerId', 'name profileImage')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── @PUT /api/delivery/:id/approve — org approves delivery ───────────────────
const approveDelivery = async (req, res) => {
  try {
    const submission = await DeliverySubmission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    if (submission.organizationId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the organization can approve delivery' });

    submission.status = 'approved';
    submission.reviewedAt = new Date();
    submission.reviewNote = (req.body.reviewNote || '').trim();
    await submission.save();

    // Complete the contract
    const contract = await Contract.findById(submission.contractId);
    if (contract) {
      contract.status = 'completed';
      contract.completedAt = new Date();
      contract.paymentReleasedAt = new Date();
      await contract.save();
      await Job.findByIdAndUpdate(contract.jobId, { status: 'completed', paid: true });
    }

    await notify(
      submission.providerId, 'payment',
      'Delivery Approved — Payment Released',
      `Your delivery for "${contract?.title}" has been approved. Payment released.`,
      submission.contractId
    );

    res.json(submission);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── @PUT /api/delivery/:id/reject — org rejects delivery ─────────────────────
const rejectDelivery = async (req, res) => {
  try {
    const submission = await DeliverySubmission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    if (submission.organizationId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the organization can reject delivery' });

    submission.status = 'rejected';
    submission.reviewedAt = new Date();
    submission.reviewNote = (req.body.reviewNote || '').trim();
    await submission.save();

    // Revert contract to active so provider can resubmit
    await Contract.findByIdAndUpdate(submission.contractId, { status: 'active' });

    await notify(
      submission.providerId, 'contract',
      'Delivery Rejected',
      `Your delivery was rejected. Reason: ${submission.reviewNote || 'Please review and resubmit.'}`,
      submission.contractId
    );

    res.json(submission);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── @PUT /api/delivery/:id/revision — org requests revision ──────────────────
const requestRevision = async (req, res) => {
  try {
    const submission = await DeliverySubmission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    if (submission.organizationId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the organization can request revision' });

    submission.status = 'revision_requested';
    submission.reviewedAt = new Date();
    submission.revisionNote = (req.body.revisionNote || '').trim();
    await submission.save();

    // Revert contract to active
    const contract = await Contract.findById(submission.contractId);
    if (contract) {
      contract.status = 'active';
      contract.revisionRequests = (contract.revisionRequests || 0) + 1;
      contract.lastRevisionNote = submission.revisionNote;
      await contract.save();
    }

    await notify(
      submission.providerId, 'contract',
      'Revision Requested',
      `Revision requested for "${contract?.title}": ${submission.revisionNote || 'Please review and resubmit.'}`,
      submission.contractId
    );

    res.json(submission);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { submitDelivery, getDeliveries, approveDelivery, rejectDelivery, requestRevision };
