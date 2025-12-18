const db = require('../config/db');

exports.getStats = (req, res) => {
    const sql = `SELECT COUNT(*) as total, SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved FROM tickets`;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result[0]);
    });
};

exports.getProfile = (req, res) => {
    db.query("SELECT id, name, email, phone, avatar FROM admins WHERE id = 1", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result[0]);
    });
};

exports.updateProfile = (req, res) => {
    const { name, phone, email } = req.body;
    let sql, params;
    if (req.file) {
        sql = "UPDATE admins SET name = ?, phone = ?, email = ?, avatar = ? WHERE id = 1";
        params = [name, phone, email, req.file.path.replace(/\\/g, '/')];
    } else {
        sql = "UPDATE admins SET name = ?, phone = ?, email = ? WHERE id = 1";
        params = [name, phone, email];
    }
    db.query(sql, params, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Profile updated' });
    });
};

exports.updatePassword = (req, res) => {
    const { currentPassword, newPassword } = req.body;
    db.query("SELECT password FROM admins WHERE id = 1", (err, result) => {
        if (result[0].password !== currentPassword) return res.json({ error: "Incorrect password" });
        db.query("UPDATE admins SET password = ? WHERE id = 1", [newPassword], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Password changed' });
        });
    });
};  