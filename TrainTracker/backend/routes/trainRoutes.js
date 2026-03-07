const express = require('express');
const router = express.Router();
const trainController = require('../controllers/trainController');

// GET /api/trains
router.get('/trains', trainController.getTrains);

module.exports = router;
