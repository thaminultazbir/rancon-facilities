const db = require('../config/db');

// 1. Admin Login
exports.login = (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM admins WHERE email = ?";
    
    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const admin = results[0];
        
        // In a real app, use bcrypt.compare(password, admin.password) here
        if (password !== admin.password) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Login Success
        res.json({ 
            message: 'Login successful', 
            admin: { id: admin.id, name: admin.name, email: admin.email, avatar: admin.avatar } 
        });
    });
};

// 2. Get All Admins
exports.getAllAdmins = (req, res) => {
    db.query("SELECT id, name, email, phone, created_at, avatar FROM admins ORDER BY created_at DESC", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// 3. Create New Admin
exports.createAdmin = (req, res) => {
    const { name, email, phone, password } = req.body;
    // Check if email exists
    db.query("SELECT * FROM admins WHERE email = ?", [email], (err, results) => {
        if (results.length > 0) return res.status(400).json({ error: "Email already exists" });

        const sql = "INSERT INTO admins (name, email, phone, password) VALUES (?, ?, ?, ?)";
        db.query(sql, [name, email, phone, password], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'New Admin created successfully' });
        });
    });
};

// ... (Keep existing getStats, getProfile, updateProfile, updatePassword functions below)
exports.getStats = (req, res) => {
    const sql = `SELECT COUNT(*) as total, SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved FROM tickets`;
    db.query(sql, (err, result) => res.json(result[0]));
};

exports.getProfile = (req, res) => {
    // Note: In real app, get ID from session/token. For now hardcoded ID 1 or passed param
    // Let's assume we pass ID in query or defaulting to 1 for the prototype
    const id = req.query.id || 1; 
    db.query("SELECT id, name, email, phone, avatar FROM admins WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result[0]);
    });
};

exports.updateProfile = (req, res) => {
    const { id, name, phone, email } = req.body; // Expect ID from frontend now
    let sql, params;
    if (req.file) {
        const cleanPath = req.file.path.replace(/^public[\\/]/, '').replace(/\\/g, '/');
        sql = "UPDATE admins SET name = ?, phone = ?, email = ?, avatar = ? WHERE id = ?";
        params = [name, phone, email, cleanPath, id];
    } else {
        sql = "UPDATE admins SET name = ?, phone = ?, email = ? WHERE id = ?";
        params = [name, phone, email, id];
    }
    db.query(sql, params, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Profile updated' });
    });
};

exports.updatePassword = (req, res) => {
    const { id, currentPassword, newPassword } = req.body;
    db.query("SELECT password FROM admins WHERE id = ?", [id], (err, result) => {
        if (result[0].password !== currentPassword) return res.json({ error: "Incorrect password" });
        db.query("UPDATE admins SET password = ? WHERE id = ?", [newPassword, id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Password changed' });
        });
    });
};