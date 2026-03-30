const pool = require('../config/db');
const gpsService = require('../services/gpsService');

exports.getTrains = async (req, res) => {
    try {
        // First, check memory storage (Live Simulator)
        const liveTrains = gpsService.getLatestPositions();

        if (liveTrains && liveTrains.length > 0) {
            return res.json(liveTrains);
        }

        // Fallback to database if memory is empty
        const query = `
            SELECT t.train_id, p.latitude, p.longitude, p.speed, p.timestamp 
            FROM trains t 
            INNER JOIN positions p ON t.train_id = p.train_id 
            WHERE p.timestamp = (
                SELECT MAX(timestamp) 
                FROM positions 
                WHERE train_id = t.train_id
            );
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching trains:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.toggleTrainStatus = (req, res) => {
    const { train_id } = req.params;
    const { isStopped } = req.body;
    
    if (typeof isStopped !== 'boolean') {
        return res.status(400).json({ error: 'isStopped must be a boolean' });
    }

    const updated = gpsService.setTrainStatus(train_id, isStopped);
    if (updated) {
        res.json({ message: 'Train status updated successfully', train_id, isStopped });
    } else {
        res.status(404).json({ error: 'Train not found in simulator' });
    }
};
