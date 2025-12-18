const db = require('../config/db');

exports.getAllStaff = (req, res) => {
    db.query("SELECT * FROM staff ORDER BY created_at DESC", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.createStaff = (req, res) => {
    const { emp_id, name, role, contact, status } = req.body;
    const sql = "INSERT INTO staff (emp_id, name, role, contact, status) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [emp_id, name, role, contact, status || 'Active'], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Staff created', id: result.insertId });
    });
};

exports.updateStaff = (req, res) => {
    const { emp_id, name, role, contact, status } = req.body;
    const sql = "UPDATE staff SET emp_id = ?, name = ?, role = ?, contact = ?, status = ? WHERE id = ?";
    db.query(sql, [emp_id, name, role, contact, status, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Staff updated' });
    });
};

exports.deleteStaff = (req, res) => {
    db.query("DELETE FROM staff WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Staff deleted' });
    });
};