const db = require('../config/db');

exports.getAllBuildings = (req, res) => {
    const sql = `SELECT b.*, COUNT(u.id) as unit_count FROM buildings b LEFT JOIN units u ON b.id = u.building_id GROUP BY b.id ORDER BY b.created_at DESC`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.createBuilding = (req, res) => {
    const { name, type, total_floors, units_per_floor } = req.body;
    db.query("INSERT INTO buildings (name, type, total_floors) VALUES (?, ?, ?)", [name, type, total_floors], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const buildingId = result.insertId;
        const unitValues = [];
        
        // Puzzle Logic
        if (type === 'Residential') {
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            for (let f = 1; f <= total_floors; f++) {
                for (let u = 0; u < units_per_floor; u++) {
                    const letter = letters[u] || `U${u+1}`;
                    unitValues.push([buildingId, f, `${letter}${f}`]);
                }
            }
        } else {
            for (let f = 1; f <= total_floors; f++) {
                unitValues.push([buildingId, f, `Level ${f}`]);
            }
        }

        if (unitValues.length > 0) {
            db.query("INSERT INTO units (building_id, floor_number, unit_name) VALUES ?", [unitValues], (err) => {
                if (err) console.error("Unit gen failed", err);
            });
        }
        res.json({ message: 'Building created', id: buildingId });
    });
};

exports.updateBuilding = (req, res) => {
    db.query("UPDATE buildings SET name = ?, type = ? WHERE id = ?", [req.body.name, req.body.type, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Building updated' });
    });
};

exports.deleteBuilding = (req, res) => {
    db.query("DELETE FROM buildings WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Building deleted' });
    });
};

exports.getBuildingUnits = (req, res) => {
    db.query("SELECT * FROM units WHERE building_id = ? ORDER BY floor_number ASC, unit_name ASC", [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.updateUnitName = (req, res) => {
    db.query("UPDATE units SET unit_name = ? WHERE id = ?", [req.body.unit_name, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Unit updated' });
    });
};