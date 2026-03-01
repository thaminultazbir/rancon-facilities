const db = require('../config/db');


// Helper for consistent error responses
const handleError = (res, err, msg = 'Server Error') => {
    console.error(msg, err);
    return res.status(500).json({ error: msg, details: err.message });
};



// 1. Submit Ticket (Transaction for Data + Images)
exports.submitTicket = async (req, res) => {
    const { name, contact, buildingName, floor, apartment, Category, details } = req.body;

    const connection = await db.promise().getConnection();

    try {
        await connection.beginTransaction();

        // 1. Insert Main Ticket Data
        const sql = `INSERT INTO tickets (name, contact, building_name, floor, apartment, category, details) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await connection.query(sql, [name, contact, buildingName, floor, apartment, Category, details]);
        
        const ticketId = result.insertId;

        // 2. Handle Image Uploads (if any)
        if (req.files && req.files.length > 0) {
            const imageValues = req.files.map(file => [
                ticketId, 
                file.path.replace(/\\/g, '/').replace(/^public\//, '') // Standardize paths
            ]);
            
            const imgSql = `INSERT INTO ticket_images (ticket_id, file_path) VALUES ?`;
            await connection.query(imgSql, [imageValues]);
        }

        await connection.commit();
        res.status(201).json({ message: 'Ticket submitted successfully', ticketId });

    } catch (err) {
        await connection.rollback();
        handleError(res, err, "Failed to submit ticket");
    } finally {
        connection.release();
    }
};

// 2. Get All Tickets (Role-Based Access)
exports.getAllTickets = async (req, res) => {
    const currentAdminId = req.query.admin_id;

    if (!currentAdminId) {
        return res.status(400).json({ error: "Admin ID required" });
    }

    try {
        // 1. Check Admin Role
        const [adminResult] = await db.promise().query("SELECT role FROM admins WHERE id = ?", [currentAdminId]);
        
        if (adminResult.length === 0) {
            return res.status(404).json({ error: "Admin not found" });
        }

        const role = adminResult[0].role;
        let sql = "";
        let params = [];

        // 2. Build Query Based on Role
        if (role === 'Super Admin') {
            // Super Admin sees ALL tickets
            sql = `
                SELECT t.*, s.name as staff_name, GROUP_CONCAT(ti.file_path) as images 
                FROM tickets t 
                LEFT JOIN ticket_images ti ON t.id = ti.ticket_id 
                LEFT JOIN staff s ON t.assigned_to = s.id 
                GROUP BY t.id 
                ORDER BY t.created_at DESC`;
        } else {
            // Project Admin sees ONLY assigned building tickets
            sql = `
                SELECT t.*, s.name as staff_name, GROUP_CONCAT(ti.file_path) as images 
                FROM tickets t 
                JOIN buildings b ON t.building_name = b.name
                JOIN admin_assignments aa ON b.id = aa.building_id
                LEFT JOIN ticket_images ti ON t.id = ti.ticket_id 
                LEFT JOIN staff s ON t.assigned_to = s.id 
                WHERE aa.admin_id = ?
                GROUP BY t.id 
                ORDER BY t.created_at DESC`;
            params = [currentAdminId];
        }

        // 3. Execute
        const [results] = await db.promise().query(sql, params);
        res.json(results);

    } catch (err) {
        handleError(res, err, "Failed to fetch tickets");
    }
};

// 3. Update Status
exports.updateStatus = async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    try {
        const [result] = await db.promise().query("UPDATE tickets SET status = ? WHERE id = ?", [status, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Ticket not found" });
        }

        res.json({ message: 'Status updated successfully' });
    } catch (err) {
        handleError(res, err, "Failed to update status");
    }
};

// 4. Assign Staff
exports.assignStaff = async (req, res) => {
    // Handle "Unassigned" (empty string) as NULL
    const staffId = req.body.staff_id === "" ? null : req.body.staff_id;
    const { id } = req.params;

    try {
        const [result] = await db.promise().query("UPDATE tickets SET assigned_to = ? WHERE id = ?", [staffId, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Ticket not found" });
        }

        res.json({ message: 'Staff assigned successfully' });
    } catch (err) {
        handleError(res, err, "Failed to assign staff");
    }
};

// 5. Get Ticket Updates (History)
exports.getUpdates = async (req, res) => {
    try {
        const [results] = await db.promise().query(
            "SELECT * FROM ticket_updates WHERE ticket_id = ? ORDER BY created_at DESC", 
            [req.params.id]
        );
        res.json(results);
    } catch (err) {
        handleError(res, err, "Failed to fetch updates");
    }
};


// 6. Add Note
exports.addNote = async (req, res) => {
    const { note } = req.body;
    const { id } = req.params;

    if (!note) return res.status(400).json({ error: "Note cannot be empty" });

    try {
        await db.promise().query(
            "INSERT INTO ticket_updates (ticket_id, note) VALUES (?, ?)", 
            [id, note]
        );
        res.status(201).json({ message: 'Note added successfully' });
    } catch (err) {
        handleError(res, err, "Failed to add note");
    }
};