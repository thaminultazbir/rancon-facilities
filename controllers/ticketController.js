const db = require('../config/db');

exports.submitTicket = (req, res) => {
    const { name, contact, buildingName, floor, apartment, Category, details } = req.body;
    const sql = `INSERT INTO tickets (name, contact, building_name, floor, apartment, category, details) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [name, contact, buildingName, floor, apartment, Category, details], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const ticketId = result.insertId;
        
        // Handle Images
        if (req.files && req.files.length > 0) {
            const imageValues = req.files.map(file => [ticketId, file.path.replace(/\\/g, '/')]); // Fix Windows paths
            const imgSql = `INSERT INTO ticket_images (ticket_id, file_path) VALUES ?`;
            db.query(imgSql, [imageValues], (err) => {
                if (err) console.error("Image upload failed", err);
            });
        }
        res.json({ message: 'Ticket submitted successfully', ticketId });
    });
};

exports.getAllTickets = (req, res) => {
    const sql = `
        SELECT t.*, s.name as staff_name, GROUP_CONCAT(ti.file_path) as images 
        FROM tickets t 
        LEFT JOIN ticket_images ti ON t.id = ti.ticket_id 
        LEFT JOIN staff s ON t.assigned_to = s.id 
        GROUP BY t.id 
        ORDER BY t.created_at DESC`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.updateStatus = (req, res) => {
    db.query(`UPDATE tickets SET status = ? WHERE id = ?`, [req.body.status, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Status updated' });
    });
};

exports.assignStaff = (req, res) => {
    const staffId = req.body.staff_id === "" ? null : req.body.staff_id;
    db.query("UPDATE tickets SET assigned_to = ? WHERE id = ?", [staffId, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Staff assigned' });
    });
};

exports.getUpdates = (req, res) => {
    db.query("SELECT * FROM ticket_updates WHERE ticket_id = ? ORDER BY created_at DESC", [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.addNote = (req, res) => {
    db.query("INSERT INTO ticket_updates (ticket_id, note) VALUES (?, ?)", [req.params.id, req.body.note], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Note added' });
    });
};