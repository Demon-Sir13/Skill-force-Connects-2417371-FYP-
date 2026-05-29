const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { applyToJob, getMyApplications, getOrgApplications, getJobApplications, updateApplicationStatus } = require('../controllers/application.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { checkApplicationLimit } = require('../middleware/subscription.middleware');

// Upload middleware for application documents
const uploadDir = path.join(__dirname, '../../uploads/applications');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substr(2, 6)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf','application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg','image/png'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only PDF, DOC, JPG, PNG allowed'));
  },
});

router.get('/my', protect, authorize('provider'), getMyApplications);
router.get('/org', protect, authorize('organization', 'admin'), getOrgApplications);
router.post('/:jobId', protect, authorize('provider'), checkApplicationLimit,
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'citizenship', maxCount: 1 },
    { name: 'certificate', maxCount: 1 },
  ]),
  applyToJob
);
router.get('/job/:jobId', protect, authorize('organization', 'admin'), getJobApplications);
router.put('/:id/status', protect, authorize('organization', 'admin'), updateApplicationStatus);

module.exports = router;
