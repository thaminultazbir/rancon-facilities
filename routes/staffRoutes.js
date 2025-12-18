const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

router.get('/admin/staff', staffController.getAllStaff);
router.post('/admin/staff', staffController.createStaff);
router.put('/admin/staff/:id', staffController.updateStaff);
router.delete('/admin/staff/:id', staffController.deleteStaff);

module.exports = router;