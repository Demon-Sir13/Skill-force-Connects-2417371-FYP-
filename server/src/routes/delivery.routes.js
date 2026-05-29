const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  submitDelivery, getDeliveries,
  approveDelivery, rejectDelivery, requestRevision,
} = require('../controllers/delivery.controller');

// ── Upload middleware ─────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../../uploads/deliveries');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substr(2, 8)}${ext}`);
  },
});

const ALLOWED_MIME = [
  'image/jpeg','image/png','image/gif','image/webp',
  'application/pdf',
  'video/mp4','video/quicktime','video/webm',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024, files: 10 }, // 20MB per file, max 10 files
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true);
    cb(new Error(`File type not allowed: ${file.mimetype}`));
  },
});

// ── Routes ────────────────────────────────────────────────────────────────────
// Provider submits delivery with file uploads
router.post('/:contractId',
  protect, authorize('provider'),
  upload.array('files', 10),
  submitDelivery
);

// Get all submissions for a contract (both parties)
router.get('/:contractId', protect, getDeliveries);

// Org reviews submissions
router.put('/:id/approve',   protect, authorize('organization'), approveDelivery);
router.put('/:id/reject',    protect, authorize('organization'), rejectDelivery);
router.put('/:id/revision',  protect, authorize('organization'), requestRevision);

module.exports = router;
