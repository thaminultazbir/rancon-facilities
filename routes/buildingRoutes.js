const express = require('express');
const router = express.Router();
const buildingController = require('../controllers/buildingController');

router.get('/admin/buildings', buildingController.getAllBuildings);
router.post('/admin/buildings', buildingController.createBuilding);
router.put('/admin/buildings/:id', buildingController.updateBuilding);
router.delete('/admin/buildings/:id', buildingController.deleteBuilding);
router.get('/admin/building/:id/units', buildingController.getBuildingUnits);
router.put('/admin/unit/:id', buildingController.updateUnitName);

module.exports = router;