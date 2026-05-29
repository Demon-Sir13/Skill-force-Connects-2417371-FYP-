const router = require('express').Router();
const QRCode = require('qrcode');
const {
  generateContract,
  getContract,
  getMyContracts,
  signContract,
  submitWork,
  approveWork,
  requestRevision,
} = require('../controllers/contract.controller');
const { protect } = require('../middleware/auth.middleware');
const Contract = require('../models/Contract');

router.post('/generate',              protect, generateContract);
router.get('/my',                     protect, getMyContracts);
router.get('/:id',                    protect, getContract);
router.put('/:id/sign',               protect, signContract);
router.put('/:id/submit-work',        protect, submitWork);
router.put('/:id/approve-work',       protect, approveWork);
router.put('/:id/request-revision',   protect, requestRevision);

// Public contract verification endpoint (no auth — for QR scan)
router.get('/verify/:contractNumber', async (req, res) => {
  try {
    const contract = await Contract.findOne({ contractNumber: req.params.contractNumber })
      .populate('organizationId', 'name')
      .populate('providerId', 'name')
      .populate('jobId', 'title');
    if (!contract) return res.status(404).json({ message: 'Contract not found', valid: false });
    res.json({
      valid: true,
      contractNumber: contract.contractNumber,
      title: contract.title,
      organization: contract.organizationId?.name,
      provider: contract.providerId?.name,
      status: contract.status,
      amount: contract.amount,
      createdAt: contract.createdAt,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Generate QR code for a contract
router.get('/:id/qr', protect, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    const verifyUrl = `${process.env.CLIENT_URL}/verify-contract/${contract.contractNumber}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 200, margin: 1 });
    res.json({ qr: qrDataUrl, verifyUrl });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
