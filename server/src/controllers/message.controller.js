const Message = require('../models/Message');
const { getIO } = require('../socket/socket');

const sendMessage = async (req, res) => {
  try {
    const { receiverId, jobId, message } = req.body;
    const msg = await Message.create({
      senderId: req.user._id,
      receiverId,
      jobId: jobId || null,
      message,
    });

    // Emit via socket as fallback for REST callers
    try {
      getIO().to(receiverId.toString()).emit('newMessage', msg);
    } catch { /* socket not ready */ }

    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: userId },
        { senderId: userId, receiverId: req.user._id },
      ],
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getInbox = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
    })
      .populate('senderId', 'name profileImage')
      .populate('receiverId', 'name profileImage')
      .sort({ timestamp: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markRead = async (req, res) => {
  try {
    const { userId } = req.params;
    await Message.updateMany(
      { senderId: userId, receiverId: req.user._id, read: false },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const counts = await Message.aggregate([
      { $match: { receiverId: req.user._id, read: false } },
      { $group: { _id: '$senderId', count: { $sum: 1 } } },
    ]);
    // Return as { senderId: count }
    const result = {};
    counts.forEach(c => { result[c._id.toString()] = c.count; });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { sendMessage, getConversation, getInbox, markRead, getUnreadCount };
