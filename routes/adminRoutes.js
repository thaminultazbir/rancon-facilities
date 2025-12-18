const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const upload = require('../middleware/uploadMiddleware');

// Auth & Management
router.post('/login', adminController.login);
router.get('/admins', adminController.getAllAdmins);
router.post('/create', adminController.createAdmin);

// Dashboard Data
router.get('/stats', adminController.getStats);
router.get('/profile', adminController.getProfile);
router.post('/profile', upload.single('avatar'), adminController.updateProfile);
router.post('/password', adminController.updatePassword);

module.exports = router;