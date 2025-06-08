const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');

// POST /review → only reviewers allowed
router.post('/review', protect, restrictTo('reviewer'), (req, res) => {
  res.json({ message: 'Review successful' });
});

module.exports = router;
