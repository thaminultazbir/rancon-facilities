const db = require('../config/db');


// Helper for consistent error responses
const handleError = (res, err, msg = 'Server Error') => {
    console.error(msg, err);
    return res.status(500).json({ error: msg, details: err.message });
};


// 1. Get All Staff
exports.getAllStaff = async (req, res) => {
    try {
        const sql = "SELECT * FROM staff ORDER BY created_at DESC";
        const [results] = await db.promise().query(sql);
        res.json(results);
    } catch (err) {
        handleError(res, err, "Failed to fetch staff list");
    }
};

// 2. Create Staff
exports.createStaff = async (req, res) => {
    const { emp_id, name, role, contact, status } = req.body;

    // Validation
    if (!emp_id || !name || !role || !contact) {
        return res.status(400).json({ error: "Missing required fields (ID, Name, Role, Contact)" });
    }

    try {
        const sql = "INSERT INTO staff (emp_id, name, role, contact, status) VALUES (?, ?, ?, ?, ?)";
        const [result] = await db.promise().query(sql, [emp_id, name, role, contact, status || 'Active']);
        
        res.status(201).json({ message: 'Staff member created successfully', id: result.insertId });
    } catch (err) {
        handleError(res, err, "Failed to create staff member");
    }
};

// 3. Update Staff
exports.updateStaff = async (req, res) => {
    const { emp_id, name, role, contact, status } = req.body;
    const { id } = req.params;

    if (!emp_id || !name || !role) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const sql = "UPDATE staff SET emp_id = ?, name = ?, role = ?, contact = ?, status = ? WHERE id = ?";
        const [result] = await db.promise().query(sql, [emp_id, name, role, contact, status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Staff member not found" });
        }

        res.json({ message: 'Staff member updated successfully' });
    } catch (err) {
        handleError(res, err, "Failed to update staff details");
    }
};

// 4. Delete Staff
exports.deleteStaff = async (req, res) => {
    try {
        // Note: If you have tickets assigned to this staff, you might want to 
        // handle re-assignment or setting them to NULL here in the future.
        // For now, we perform a standard delete.
        
        const [result] = await db.promise().query("DELETE FROM staff WHERE id = ?", [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Staff member not found" });
        }

        res.json({ message: 'Staff member deleted successfully' });
    } catch (err) {
        handleError(res, err, "Failed to delete staff member");
    }
};