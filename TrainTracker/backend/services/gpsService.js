const pool = require('../config/db');

const STATIONS = [
    { name: 'Tunis Ville', lat: 36.7953, lon: 10.1806 },
    { name: 'Mégrine', lat: 36.7686, lon: 10.2336 },
    { name: 'Radès', lat: 36.7667, lon: 10.2833 },
    { name: 'Ezzahra', lat: 36.7439, lon: 10.3083 },
    { name: 'Hammam Lif', lat: 36.7287, lon: 10.3416 },
    { name: 'Hammam Chott', lat: 36.7217, lon: 10.3583 },
    { name: 'Borj Cédria', lat: 36.6881, lon: 10.3779 },
];

// In-memory storage for when DB is down
let latestPositions = [];

// Simple in-memory state for simulator
let simulatorState = [
    { train_id: 'TRAIN-A', progress: 0.1, direction: 1, speed: 50 },
    { train_id: 'TRAIN-B', progress: 0.8, direction: -1, speed: 45 }
];

const updateSimulatorPositions = async () => {
    try {
        const newPositions = [];
        for (let train of simulatorState) {
            // Move train slightly (approx 0.02 progress every 15s)
            train.progress += (0.02 * train.direction);

            // Reverse if reached ends
            if (train.progress >= 1) {
                train.progress = 1;
                train.direction = -1;
            } else if (train.progress <= 0) {
                train.progress = 0;
                train.direction = 1;
            }

            // Calculate lat/lon based on linear interpolation between start and end of line
            // To keep it simple but realistic, we interpolate along the station indices
            const totalStations = STATIONS.length - 1;
            const exactIndex = train.progress * totalStations;
            const lowerIndex = Math.floor(exactIndex);
            const upperIndex = Math.ceil(exactIndex);
            const internalProgress = exactIndex - lowerIndex;

            const start = STATIONS[lowerIndex];
            const end = STATIONS[upperIndex === lowerIndex ? Math.min(upperIndex + 1, totalStations) : upperIndex];

            const lat = start.lat + (end.lat - start.lat) * internalProgress;
            const lon = start.lon + (end.lon - start.lon) * internalProgress;

            const posData = {
                train_id: train.train_id,
                latitude: lat,
                longitude: lon,
                speed: train.speed + (Math.random() * 5),
                timestamp: new Date().toISOString()
            };
            newPositions.push(posData);
        }

        latestPositions = newPositions;

        // Try to save to DB but don't crash if it fails
        try {
            const connection = await pool.getConnection();
            for (const pos of newPositions) {
                await connection.execute(`INSERT IGNORE INTO trains (train_id, line) VALUES (?, 'Banlieue Sud')`, [pos.train_id]);
                await connection.execute(`INSERT INTO positions (train_id, latitude, longitude, speed) VALUES (?, ?, ?, ?)`, [pos.train_id, pos.latitude, pos.longitude, pos.speed]);
            }
            connection.release();
        } catch (dbError) {
            // console.log('Database not available, using memory only.');
        }

    } catch (error) {
        console.error('Simulator Error:', error.message);
    }
};

const startService = () => {
    console.log('🚀 Train Simulator Service Started (Memory-ready)');
    // Run update every 15 seconds
    setInterval(updateSimulatorPositions, 15000);
    // Initial run
    updateSimulatorPositions();
};

module.exports = {
    startService,
    getLatestPositions: () => latestPositions
};
