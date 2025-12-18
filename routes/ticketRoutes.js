const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const upload = require('../middleware/uploadMiddleware');

router.post('/submit-ticket', upload.array('image[]'), ticketController.submitTicket);
router.get('/admin/tickets', ticketController.getAllTickets);
router.post('/admin/ticket/:id/status', ticketController.updateStatus);
router.post('/admin/ticket/:id/assign', ticketController.assignStaff);
router.get('/admin/ticket/:id/updates', ticketController.getUpdates);
router.post('/admin/ticket/:id/updates', ticketController.addNote);

module.exports = router;