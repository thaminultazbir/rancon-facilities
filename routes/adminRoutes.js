const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const upload = require('../middleware/uploadMiddleware');

router.get('/admin/stats', adminController.getStats);
router.get('/admin/profile', adminController.getProfile);
router.post('/admin/profile', upload.single('avatar'), adminController.updateProfile);
router.post('/admin/password', adminController.updatePassword);

module.exports = router;