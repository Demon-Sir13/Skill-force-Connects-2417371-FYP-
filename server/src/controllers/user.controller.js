const User = require('../models/User');

const updateUser = async (req, res) => {
  try {
    const { name, profileImage } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, profileImage },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { updateUser, getUserById };
