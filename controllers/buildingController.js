const db = require('../config/db');

// Helper for consistent error responses
const handleError = (res, err, msg = 'Server Error') => {
    console.error(msg, err);
    return res.status(500).json({ error: msg, details: err.message });
};

exports.getAllBuildings = async (req, res) => {
    try {
        const sql = `
            SELECT b.*, COUNT(u.id) as unit_count 
            FROM buildings b 
            LEFT JOIN units u ON b.id = u.building_id 
            GROUP BY b.id 
            ORDER BY b.created_at DESC
        `;
        const [results] = await db.promise().query(sql);
        res.json(results);
    } catch (err) {
        handleError(res, err, "Failed to fetch buildings");
    }
};

exports.createBuilding = async (req, res) => {
    const { name, type, floors, ranges } = req.body;
    
    // Validate input
    if (!name || !floors || !ranges?.length) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const connection = await db.promise().getConnection();
    
    try {
        // START TRANSACTION (ACID Compliance)
        await connection.beginTransaction();

        // 1. Insert Building
        const [result] = await connection.query(
            "INSERT INTO buildings (name, type, total_floors) VALUES (?, ?, ?)",
            [name, type, floors]
        );
        const buildingId = result.insertId;

        // 2. Generate Units Logic
        let unitValues = [];
        let totalUnitsCount = 0;

        ranges.forEach(range => {
            const start = parseInt(range.from);
            const end = parseInt(range.to);
            const count = parseInt(range.count);

            for (let f = start; f <= end; f++) {
                for (let u = 1; u <= count; u++) {
                    const unitChar = String.fromCharCode(64 + u); 
                    let unitName = `${f}${unitChar}`;
                    
                    // Logic for Basements/Ground Floor labels
                    if (f < 0) {
                        const baseName = `B${Math.abs(f)}`;
                        unitName = count > 1 ? `${baseName}-${unitChar}` : baseName;
                    } else if (f === 0) {
                        unitName = count > 1 ? `GF-${unitChar}` : 'GF';
                    }

                    unitValues.push([buildingId, f, unitName]);
                    totalUnitsCount++;
                }
            }
        });

        // 3. Bulk Insert Units
        if (unitValues.length > 0) {
            await connection.query(
                "INSERT INTO units (building_id, floor_no, unit_name) VALUES ?",
                [unitValues]
            );
            
            // 4. Update Count
            await connection.query(
                "UPDATE buildings SET total_units = ? WHERE id = ?",
                [totalUnitsCount, buildingId]
            );
        }

        // COMMIT
        await connection.commit();
        res.status(201).json({ message: "Building created successfully", id: buildingId });

    } catch (err) {
        // ROLLBACK
        await connection.rollback();
        handleError(res, err, "Failed to create building structure");
    } finally {
        connection.release();
    }
};

exports.updateBuilding = async (req, res) => {
    const { name, type } = req.body;
    const { id } = req.params;

    if (!name || !type) {
        return res.status(400).json({ error: "Name and Type are required" });
    }

    try {
        const [result] = await db.promise().query(
            "UPDATE buildings SET name = ?, type = ? WHERE id = ?", 
            [name, type, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Building not found" });
        }

        res.json({ message: 'Building updated successfully' });
    } catch (err) {
        handleError(res, err, "Failed to update building");
    }
};

exports.deleteBuilding = async (req, res) => {
    try {
        // ON DELETE CASCADE in DB handles unit deletion automatically
        const [result] = await db.promise().query("DELETE FROM buildings WHERE id = ?", [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Building not found" });
        }
        res.json({ message: 'Building deleted successfully' });
    } catch (err) {
        handleError(res, err, "Failed to delete building");
    }
};

exports.getBuildingUnits = async (req, res) => {
    try {
        const sql = "SELECT * FROM units WHERE building_id = ? ORDER BY floor_no ASC, unit_name ASC";
        const [results] = await db.promise().query(sql, [req.params.id]);
        
        // Return empty array if no units found, which is valid
        res.json(results);
    } catch (err) {
        handleError(res, err, "Failed to fetch units");
    }
};

exports.updateUnitName = async (req, res) => {
    const newName = req.body.name || req.body.unit_name;
    const { id } = req.params;

    if (!newName) {
        return res.status(400).json({ error: "Unit name is required" });
    }

    try {
        const [result] = await db.promise().query(
            "UPDATE units SET unit_name = ? WHERE id = ?", 
            [newName, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Unit not found" });
        }

        res.json({ message: 'Unit updated successfully' });
    } catch (err) {
        handleError(res, err, "Failed to update unit name");
    }
};