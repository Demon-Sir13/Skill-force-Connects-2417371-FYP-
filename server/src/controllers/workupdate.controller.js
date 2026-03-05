const WorkUpdate = require('../models/WorkUpdate');
const Contract = require('../models/Contract');
const Notification = require('../models/Notification');

const emitTo = (userId, event, data) => {
  try { const { getIO } = require('../socket/socket'); getIO().to(userId.toString()).emit(event, data); } catch {}
};

// POST /api/work-updates — provider posts update
const createUpdate = async (req, res) => {
  try {
    const { contractId, message, files, type } = req.body;
    if (!contractId || !message?.trim()) return res.status(400).json({ message: 'contractId and message required' });

    const contract = await Contract.findById(contractId);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    const isProvider = contract.providerId.toString() === req.user._id.toString();
    const isOrg = contract.organizationId.toString() === req.user._id.toString();
    if (!isProvider && !isOrg) return res.status(403).json({ message: 'Not authorized' });

    const update = await WorkUpdate.create({
      contractId,
      providerId: req.user._id,
      organizationId: contract.organizationId,
      message: message.trim(),
      files: files || [],
      type: isOrg ? 'response' : (type || 'update'),
    });

    // Notify the other party
    const notifyId = isProvider ? contract.organizationId : contract.providerId;
    await Notification.create({
      userId: notifyId, type: 'job_update', title: 'Work Update',
      message: `New ${isOrg ? 'response' : 'progress update'} on "${contract.title}"`,
      relatedId: contractId, referenceUrl: '/contracts',
    });
    emitTo(notifyId, 'notification', { type: 'work_update', message: 'New work update posted' });

    res.status(201).json(update);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/work-updates/:contractId — get updates for a contract
const getUpdates = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.contractId);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    const isParty = contract.providerId.toString() === req.user._id.toString() ||
                    contract.organizationId.toString() === req.user._id.toString() ||
                    req.user.role === 'admin';
    if (!isParty) return res.status(403).json({ message: 'Not authorized' });

    const updates = await WorkUpdate.find({ contractId: req.params.contractId })
      .populate('providerId', 'name profileImage')
      .sort({ createdAt: 1 });
    res.json(updates);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { createUpdate, getUpdates };
