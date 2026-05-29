const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getProfile, updateProfile, getAllProviders, updateAvailability, updateSchedule } = require('../controllers/provider.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const ProviderProfile = require('../models/ProviderProfile');

// Upload for verification docs
const verifyDir = path.join(__dirname, '../../uploads/verification');
if (!fs.existsSync(verifyDir)) fs.mkdirSync(verifyDir, { recursive: true });

const verifyUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, verifyDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.random().toString(36).substr(2, 6)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ['application/pdf','image/jpeg','image/png'].includes(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Only PDF/JPG/PNG allowed'));
  },
});

// Static routes FIRST (before /:userId)
router.get('/', getAllProviders);
router.put('/me', protect, authorize('provider'), updateProfile);
router.put('/availability', protect, authorize('provider'), updateAvailability);
router.put('/schedule', protect, authorize('provider'), updateSchedule);

// Verification request
router.post('/verification-request', protect, authorize('provider'),
  verifyUpload.fields([{ name: 'citizenship', maxCount: 1 }, { name: 'certificate', maxCount: 1 }]),
  async (req, res) => {
    try {
      const citizenshipUrl = req.files?.citizenship?.[0]
        ? `/uploads/verification/${req.files.citizenship[0].filename}` : '';
      const certificateUrl = req.files?.certificate?.[0]
        ? `/uploads/verification/${req.files.certificate[0].filename}` : '';

      if (!citizenshipUrl) return res.status(400).json({ message: 'Citizenship document required' });

      await ProviderProfile.findOneAndUpdate(
        { userId: req.user._id },
        {
          verificationStatus: 'pending',
          citizenshipDoc: citizenshipUrl,
          certificateDoc: certificateUrl,
          verificationRequestedAt: new Date(),
        }
      );
      res.json({ message: 'Verification request submitted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
  }
);

// Dynamic route LAST
router.get('/:userId', getProfile);

module.exports = router;
