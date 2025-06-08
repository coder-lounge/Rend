const express =  require ('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware')

// POST /upload → only creators allowed
router.post('/upload', protect, restrictTo('creator'), (req, res) => {
  res.json({ message: 'Upload successful' });
});

module.exports = router;