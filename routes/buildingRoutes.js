const express = require('express');
const router = express.Router();
const buildingController = require('../controllers/buildingController');

// Matches /api/admin/buildings
router.get('/admin/buildings', buildingController.getAllBuildings);
router.post('/admin/buildings', buildingController.createBuilding);

// Matches /api/admin/buildings/:id
router.put('/admin/buildings/:id', buildingController.updateBuilding);

// --- FIX IS HERE: Changed 'buildings' to 'building' to match Frontend ---
router.delete('/admin/building/:id', buildingController.deleteBuilding); 

router.get('/admin/building/:id/units', buildingController.getBuildingUnits);
router.put('/admin/unit/:id', buildingController.updateUnitName);

module.exports = router;