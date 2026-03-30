const express = require('express');
const router = express.Router();
const trainController = require('../controllers/trainController');

// GET /api/trains
router.get('/trains', trainController.getTrains);

// PUT /api/trains/:train_id/status
router.put('/trains/:train_id/status', trainController.toggleTrainStatus);

module.exports = router;
