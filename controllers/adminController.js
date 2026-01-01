const db = require('../config/db');



// Helper: Get Admin's Assigned Building IDs
const getAssignedBuildings = (adminId) => {
    return new Promise((resolve, reject) => {
        db.query("SELECT building_id FROM admin_buildings WHERE admin_id = ?", [adminId], (err, res) => {
            if (err) reject(err);
            else resolve(res.map(r => r.building_id));
        });
    });
};


// 1. Admin Login
exports.login = (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM admins WHERE email = ?";
    
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0 || results[0].password !== password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const admin = results[0];
        
        // Fetch assigned buildings if Project Admin
        let assignedBuildings = [];
        if (admin.role === 'Project Admin') {
            assignedBuildings = await getAssignedBuildings(admin.id);
        }

        res.json({ 
            message: 'Login successful', 
            admin: { 
                id: admin.id, 
                name: admin.name, 
                email: admin.email, 
                avatar: admin.avatar,
                role: admin.role,               // <--- NEW
                buildings: assignedBuildings    // <--- NEW
            } 
        });
    });
};

// 2. Get All Admins
exports.getAllAdmins = (req, res) => {
    const sql = `
        SELECT a.id, a.name, a.email, a.phone, a.created_at, a.avatar, a.role, 
        b.name as building_name, 
        b.id as assigned_bid  -- <--- ADD THIS LINE
        FROM admins a 
        LEFT JOIN admin_buildings ab ON a.id = ab.admin_id 
        LEFT JOIN buildings b ON ab.building_id = b.id 
        ORDER BY a.created_at DESC`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// 3. Create New Admin
exports.createAdmin = (req, res) => {
    const { name, email, phone, password, role, assigned_building_id } = req.body;

    // Check email
    db.query("SELECT * FROM admins WHERE email = ?", [email], (err, results) => {
        if (results.length > 0) return res.status(400).json({ error: "Email exists" });

        const sql = "INSERT INTO admins (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)";
        db.query(sql, [name, email, phone, password, role || 'Super Admin'], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            
            const newAdminId = result.insertId;

            // If Project Admin, assign the building
            if (role === 'Project Admin' && assigned_building_id) {
                db.query("INSERT INTO admin_buildings (admin_id, building_id) VALUES (?, ?)", [newAdminId, assigned_building_id], (err) => {
                    if (err) console.error("Assignment failed", err);
                });
            }
            res.json({ message: 'New Admin created successfully' });
        });
    });
};

exports.getTickets = (req, res) => {
    const adminId = req.query.admin_id;


    





    if (!adminId) return res.status(400).json({ error: "Admin ID required" });

    db.query("SELECT role FROM admins WHERE id = ?", [adminId], async (err, result) => {


        
        if (err || result.length === 0) return res.status(401).json({ error: "Unauthorized" });

        const role = result[0].role;
        
        // BASE QUERY: Note we are now joining ON t.building_id
        let query = `
            SELECT t.*, b.name as building_name, s.name as staff_name 
            FROM tickets t 
            LEFT JOIN buildings b ON t.building_id = b.id 
            LEFT JOIN staff s ON t.assigned_to = s.id
            WHERE 1=1
        `; 
        let params = [];

        // STRICT SECURITY FOR PROJECT ADMIN
        if (role === 'Project Admin') {
            // 1. Get Assigned Building IDs
            const buildingIds = await getAssignedBuildings(adminId);
            
            console.log(`[DEBUG] Admin: ${result[0].name}, Role: ${role}, Assigned IDs: ${buildingIds}`);

            // 2. If Unassigned, return empty immediately
            if (!buildingIds || buildingIds.length === 0) {
                return res.json([]); 
            }

            // 3. Filter Tickets by Building ID
            query += ` AND t.building_id IN (?)`;
            params.push(buildingIds);
        }

        query += ` ORDER BY t.created_at DESC`;

        db.query(query, params, (err, tickets) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(tickets);
        });
    });
};



// ... (Keep existing getStats, getProfile, updateProfile, updatePassword functions below)
exports.getStats = (req, res) => {
    const adminId = req.query.admin_id;
    if (!adminId) return res.json({ total:0, pending:0, resolved:0 });

    db.query("SELECT role FROM admins WHERE id = ?", [adminId], async (err, result) => {
        if(err || result.length === 0) return res.json({ total:0, pending:0, resolved:0 });

        const role = result[0].role;
        let sql = `SELECT COUNT(*) as total, SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved FROM tickets`;
        let params = [];

        // CRITICAL SECURITY CHECK
        if (role === 'Project Admin') {
            const buildingIds = await getAssignedBuildings(adminId);
            if (buildingIds.length === 0) return res.json({ total:0, pending:0, resolved:0 });
            
            sql += ` WHERE building_id IN (?)`;
            params.push(buildingIds);
        }

        db.query(sql, params, (err, result) => res.json(result[0]));
    });
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

exports.updateAdmin = (req, res) => {
    const { id } = req.params;
    const { name, email, phone, role, assigned_building_id } = req.body;

    // 1. Update Basic Info & Role
    const sql = "UPDATE admins SET name = ?, email = ?, phone = ?, role = ? WHERE id = ?";
    db.query(sql, [name, email, phone, role, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // 2. Handle Building Assignment Logic
        if (role === 'Super Admin') {
            // If promoted to Super Admin, remove any project restrictions
            db.query("DELETE FROM admin_buildings WHERE admin_id = ?", [id], (err) => {
                if(err) console.error(err);
                res.json({ message: "Admin updated & unassigned from projects" });
            });
        } else {
            // If Project Admin, Update or Insert the assignment
            // First, remove old assignment to be safe (1 Admin = 1 Project logic)
            db.query("DELETE FROM admin_buildings WHERE admin_id = ?", [id], (err) => {
                if(err) return res.status(500).json({ error: "Reassignment failed" });
                
                if (assigned_building_id) {
                    db.query("INSERT INTO admin_buildings (admin_id, building_id) VALUES (?, ?)", [id, assigned_building_id], (err) => {
                        if(err) return res.status(500).json({ error: "Failed to assign building" });
                        res.json({ message: "Admin updated and reassigned successfully" });
                    });
                } else {
                    res.json({ message: "Admin updated (No building assigned yet)" });
                }
            });
        }
    });
};