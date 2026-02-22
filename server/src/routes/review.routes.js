const router = require('express').Router();
const { createReview, getReviewsForUser } = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, createReview);
router.get('/user/:userId', getReviewsForUser);

module.exports = router;
