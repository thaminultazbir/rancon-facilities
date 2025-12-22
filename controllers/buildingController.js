const db = require('../config/db');

exports.getAllBuildings = (req, res) => {
    const sql = `SELECT b.*, COUNT(u.id) as unit_count FROM buildings b LEFT JOIN units u ON b.id = u.building_id GROUP BY b.id ORDER BY b.created_at DESC`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.createBuilding = (req, res) => {
    const { name, type, total_floors, ranges } = req.body;

    // 1. Create Building Entry
    db.query("INSERT INTO buildings (name, type, total_floors) VALUES (?, ?, ?)", [name, type, total_floors], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const buildingId = result.insertId;
        const unitValues = [];
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        // 2. Loop through User Defined Ranges
        // Example Range: { start: 1, end: 3, units: 1 }
        if (ranges && Array.isArray(ranges)) {
            ranges.forEach(range => {
                // Loop through floors in this range (e.g., Floor 1 to 3)
                for (let f = range.start; f <= range.end; f++) {
                    // Safety check: Don't exceed total floors
                    if (f > total_floors) continue;

                    // Generate Units for this floor
                    for (let u = 0; u < range.units; u++) {
                        let unitName;
                        
                        if (range.units === 1) {
                            // If Single Unit: "A5" or just "5A"? Or for commercial "Level 5"?
                            // Standardizing: If it's single, usually just the floor number or "A"+Floor works.
                            // Let's use "A{Floor}" for consistency so it sorts well.
                            // OR for Commercial Single unit "Level {Floor}" looks better.
                            if (type === 'Commercial') unitName = `Level ${f}`;
                            else unitName = `A${f}`;
                        } else {
                            // Multiple Units: A1, B1, C1... or A5, B5...
                            // Logic: Letter + Floor Number
                            const letter = letters[u] || `U${u+1}`;
                            unitName = `${letter}${f}`;
                        }
                        
                        unitValues.push([buildingId, f, unitName]);
                    }
                }
            });
        }

        // 3. Bulk Insert Units
        if (unitValues.length > 0) {
            db.query("INSERT INTO units (building_id, floor_number, unit_name) VALUES ?", [unitValues], (err) => {
                if (err) console.error("Unit gen failed", err);
            });
        }

        res.json({ message: 'Building created & units generated', id: buildingId });
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