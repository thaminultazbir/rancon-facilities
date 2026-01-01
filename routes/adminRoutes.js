const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const upload = require('../middleware/uploadMiddleware');

// --- AUTHENTICATION ---
// Matches: /api/admin/login
router.post('/admin/login', adminController.login);

// --- ADMIN MANAGEMENT ---
// Matches: /api/admin/list
router.get('/admin/list', adminController.getAllAdmins);
// Matches: /api/admin/create
router.post('/admin/create', adminController.createAdmin);
router.get('/admin/tickets', adminController.getTickets);
router.put('/admin/:id', adminController.updateAdmin);

// --- DASHBOARD DATA ---
router.get('/admin/stats', adminController.getStats);
router.get('/admin/profile', adminController.getProfile);
router.post('/admin/profile', upload.single('avatar'), adminController.updateProfile);
router.post('/admin/password', adminController.updatePassword);

module.exports = router;