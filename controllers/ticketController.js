const db = require('../config/db');

exports.submitTicket = (req, res) => {
    const { name, contact, buildingName, floor, apartment, Category, details } = req.body;

    // STEP 1: We MUST get the building_id first, otherwise Project Admins can't see this ticket
    const findBuildingSql = "SELECT id FROM buildings WHERE name = ?";
    
    db.query(findBuildingSql, [buildingName], (err, buildingResult) => {
        if (err) return res.status(500).json({ error: "Database error resolving building." });
        
        // Default to NULL if not found, but try to find it
        const buildingId = buildingResult.length > 0 ? buildingResult[0].id : null;

        // STEP 2: Insert Ticket with building_id
        const sql = `INSERT INTO tickets (building_id, name, contact, building_name, floor, apartment, category, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        
        db.query(sql, [buildingId, name, contact, buildingName, floor, apartment, Category, details], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            
            const ticketId = result.insertId;
            
            // Handle Images
            if (req.files && req.files.length > 0) {
                const imageValues = req.files.map(file => [ticketId, file.path.replace(/\\/g, '/')]); 
                const imgSql = `INSERT INTO ticket_images (ticket_id, file_path) VALUES ?`;
                db.query(imgSql, [imageValues], (err) => {
                    if (err) console.error("Image upload failed", err);
                });
            }
            res.json({ message: 'Ticket submitted successfully', ticketId });
        });
    });
};

exports.getAllTickets = (req, res) => {
    // 1. Security: Ensure user is logged in
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized: No user data found." });
    }

    const { id, role } = req.user;
    let query = "";
    let params = [];

    // 2. Base Query: This grabs the ticket, the assigned staff name, and images
    // We use LEFT JOIN so we get the ticket even if no staff is assigned yet.
    const baseFields = `
        SELECT t.*, 
               s.name as staff_name, 
               GROUP_CONCAT(ti.file_path) as images 
        FROM tickets t 
        LEFT JOIN ticket_images ti ON t.id = ti.ticket_id 
        LEFT JOIN staff s ON t.assigned_to = s.id 
    `;

    // 3. Logic for Different Roles
    if (role === 'Super Admin') {
        // Super Admin sees EVERYTHING
        query = `
            ${baseFields}
            GROUP BY t.id 
            ORDER BY t.created_at DESC
        `;
    } else if (role === 'Project Admin') {
        // ✅ THE FIX: Join with 'admin_buildings' to filter by this admin's ID
        query = `
            ${baseFields}
            JOIN admin_buildings ab ON t.building_id = ab.building_id
            WHERE ab.admin_id = ?
            GROUP BY t.id 
            ORDER BY t.created_at DESC
        `;
        params = [id]; // Pass the Admin ID (2) into the query
    } else {
        // If it's just a Staff member or unknown role
        return res.status(403).json({ success: false, message: "Access Denied" });
    }

    // 4. Execute Query
    db.query(query, params, (err, results) => {
        if (err) {
            console.error("Database Error in getAllTickets:", err);
            return res.status(500).json({ success: false, error: err.message });
        }
        
        // Return the results. The frontend will now receive the 5 tickets for Rangs Babylonia.
        res.status(200).json({ success: true, data: results });
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