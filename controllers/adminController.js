const db = require('../config/db');


// Helper for consistent error responses
const handleError = (res, err, msg = 'Server Error') => {
    console.error(msg, err);
    return res.status(500).json({ error: msg, details: err.message });
};


// 1. Admin Login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const [results] = await db.promise().query("SELECT * FROM admins WHERE email = ?", [email]);
        
        if (results.length === 0 || results[0].password !== password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const admin = results[0];
        res.json({ 
            message: 'Login successful', 
            admin: { 
                id: admin.id, 
                name: admin.name, 
                email: admin.email, 
                avatar: admin.avatar, 
                role: admin.role 
            } 
        });
    } catch (err) {
        handleError(res, err, "Login failed");
    }
};

// 2. Get All Admins
exports.getAllAdmins = async (req, res) => {
    try {
        const sql = `
            SELECT
                a.id,
                a.name,
                a.email,
                a.phone,
                a.created_at,
                a.avatar,
                a.role,
                GROUP_CONCAT(b.name SEPARATOR ', ') AS assigned_buildings
            FROM admins a
            LEFT JOIN admin_assignments aa ON a.id = aa.admin_id
            LEFT JOIN buildings b ON aa.building_id = b.id
            GROUP BY a.id
            ORDER BY a.created_at DESC
        `;
        const [results] = await db.promise().query(sql);
        res.json(results);
    } catch (err) {
        handleError(res, err, "Failed to fetch admins");
    }
};

// 3. Create New Admin
exports.createAdmin = async (req, res) => {
    const { name, email, phone, password, building_ids, requesting_admin_id } = req.body;

    const connection = await db.promise().getConnection();

    try {
        await connection.beginTransaction();

        // 1. Security Check (Optional: You can enforce Super Admin check here)
        if (requesting_admin_id) {
            const [adminRes] = await connection.query("SELECT role FROM admins WHERE id = ?", [requesting_admin_id]);
            // Logic can be expanded here if needed
        }

        // 2. Check if email exists
        const [existing] = await connection.query("SELECT id FROM admins WHERE email = ?", [email]);
        if (existing.length > 0) {
            await connection.rollback();
            return res.status(400).json({ error: "Email already exists" });
        }

        // 3. Insert Admin
        const sql = "INSERT INTO admins (name, email, phone, password, role) VALUES (?, ?, ?, ?, 'Project Admin')";
        const [result] = await connection.query(sql, [name, email, phone, password]);
        const newAdminId = result.insertId;

        // 4. Assign Projects
        if (building_ids && building_ids.length > 0) {
            const assignments = building_ids.map(bId => [newAdminId, bId]);
            await connection.query("INSERT INTO admin_assignments (admin_id, building_id) VALUES ?", [assignments]);
        }

        await connection.commit();
        res.status(201).json({ message: 'Project Admin created successfully' });

    } catch (err) {
        await connection.rollback();
        handleError(res, err, "Failed to create admin");
    } finally {
        connection.release();
    }
};

// 4. Create Building (With Units)
exports.createBuilding = async (req, res) => {
    const { name, type, floors, ranges } = req.body;

    if (!name || !floors || !ranges?.length) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const connection = await db.promise().getConnection();

    try {
        await connection.beginTransaction();

        // 1. Insert Building
        const [result] = await connection.query(
            "INSERT INTO buildings (name, type, total_floors) VALUES (?, ?, ?)",
            [name, type, floors]
        );
        const newBuildingId = result.insertId;

        // 2. Generate Units
        let unitValues = [];
        let totalUnitsCount = 0;

        ranges.forEach(range => {
            const start = parseInt(range.from);
            const end = parseInt(range.to);
            const count = parseInt(range.count);

            for (let f = start; f <= end; f++) {
                for (let u = 1; u <= count; u++) {
                    const unitChar = String.fromCharCode(64 + u); 
                    const unitName = `${f}${unitChar}`;
                    unitValues.push([newBuildingId, f, unitName]);
                    totalUnitsCount++;
                }
            }
        });

        // 3. Insert Units
        if (unitValues.length > 0) {
            await connection.query(
                "INSERT INTO units (building_id, floor_no, unit_name) VALUES ?",
                [unitValues]
            );

            // 4. Update Count
            await connection.query(
                "UPDATE buildings SET total_units = ? WHERE id = ?",
                [totalUnitsCount, newBuildingId]
            );
        }

        await connection.commit();
        res.json({ message: "Building created successfully", id: newBuildingId });

    } catch (err) {
        await connection.rollback();
        handleError(res, err, "Failed to create building");
    } finally {
        connection.release();
    }
};

// 5. Get Building Units
exports.getBuildingUnits = async (req, res) => {
    try {
        const sql = "SELECT * FROM units WHERE building_id = ? ORDER BY floor_no ASC, unit_name ASC";
        const [results] = await db.promise().query(sql, [req.params.id]);
        res.json(results);
    } catch (err) {
        handleError(res, err, "Failed to fetch units");
    }
};

// 6. Update Unit Name
exports.updateUnit = async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Unit name required" });

    try {
        const [result] = await db.promise().query("UPDATE units SET unit_name = ? WHERE id = ?", [name, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Unit not found" });
        
        res.json({ message: "Unit updated successfully" });
    } catch (err) {
        handleError(res, err, "Failed to update unit");
    }
};

//7. Get State
exports.getStats = async (req, res) => {
    try {
        const sql = `SELECT COUNT(*) as total, SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved FROM tickets`;
        const [results] = await db.promise().query(sql);
        res.json(results[0]);
    } catch (err) {
        handleError(res, err, "Failed to fetch stats");
    }
};

exports.getProfile = async (req, res) => {
    const id = req.query.id || req.body.id;
    if (!id) return res.status(400).json({ error: "Admin ID is required" });

    try {
        const sql = `
            SELECT a.id, a.name, a.email, a.phone, a.avatar, a.role,
            (SELECT GROUP_CONCAT(building_id) FROM admin_assignments WHERE admin_id = a.id) as assigned_ids
            FROM admins a WHERE a.id = ?`;

        const [results] = await db.promise().query(sql, [id]);

        if (results.length === 0) return res.status(404).json({ error: "Admin not found" });

        const admin = results[0];
        admin.building_ids = admin.assigned_ids ? admin.assigned_ids.split(',').map(Number) : [];
        
        res.json(admin);
    } catch (err) {
        handleError(res, err, "Failed to fetch profile");
    }
};


exports.updateAdminFull = async (req, res) => {
    const { id, name, email, phone, building_ids, password } = req.body;
    const connection = await db.promise().getConnection();

    try {
        await connection.beginTransaction();

        // 1. Prepare Update Query
        let sql = "UPDATE admins SET name = ?, email = ?, phone = ?";
        let params = [name, email, phone];

        if (password && password.trim() !== "") {
            sql += ", password = ?";
            params.push(password);
        }

        sql += " WHERE id = ?";
        params.push(id);

        await connection.query(sql, params);

        // 2. Clear Old Assignments
        await connection.query("DELETE FROM admin_assignments WHERE admin_id = ?", [id]);

        // 3. Insert New Assignments
        if (building_ids && building_ids.length > 0) {
            const values = building_ids.map(bId => [id, bId]);
            await connection.query("INSERT INTO admin_assignments (admin_id, building_id) VALUES ?", [values]);
        }

        await connection.commit();
        res.json({ message: "Admin updated successfully" });

    } catch (err) {
        await connection.rollback();
        handleError(res, err, "Failed to update admin");
    } finally {
        connection.release();
    }
};



// 10. Update Profile (Self)
exports.updateProfile = async (req, res) => {
    const { id, name, phone, email } = req.body;
    
    try {
        let sql, params;
        if (req.file) {
            const cleanPath = req.file.path.replace(/^public[\\/]/, '').replace(/\\/g, '/');
            sql = "UPDATE admins SET name = ?, phone = ?, email = ?, avatar = ? WHERE id = ?";
            params = [name, phone, email, cleanPath, id];
        } else {
            sql = "UPDATE admins SET name = ?, phone = ?, email = ? WHERE id = ?";
            params = [name, phone, email, id];
        }

        await db.promise().query(sql, params);
        res.json({ message: 'Profile updated' });
    } catch (err) {
        handleError(res, err, "Failed to update profile");
    }
};


// 11. Update Password
exports.updatePassword = async (req, res) => {
    const { id, currentPassword, newPassword } = req.body;

    try {
        const [results] = await db.promise().query("SELECT password FROM admins WHERE id = ?", [id]);
        
        if (results.length === 0 || results[0].password !== currentPassword) {
            return res.status(400).json({ error: "Incorrect current password" });
        }

        await db.promise().query("UPDATE admins SET password = ? WHERE id = ?", [newPassword, id]);
        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        handleError(res, err, "Failed to update password");
    }
};

// 12. Delete Building
exports.deleteBuilding = async (req, res) => {
    try {
        const [result] = await db.promise().query("DELETE FROM buildings WHERE id = ?", [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Building not found" });
        }
        res.json({ message: 'Building deleted successfully' });
    } catch (err) {
        handleError(res, err, "Failed to delete building");
    }
};