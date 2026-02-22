const router = require('express').Router();
const { generateContract, getContract, getMyContracts, signContract } = require('../controllers/contract.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/generate', protect, generateContract);
router.get('/my', protect, getMyContracts);
router.get('/:id', protect, getContract);
router.put('/:id/sign', protect, signContract);

module.exports = router;
