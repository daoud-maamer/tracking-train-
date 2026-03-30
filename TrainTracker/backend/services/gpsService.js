const pool = require('../config/db');

// Full station list matching the frontend (18 stations)
const STATIONS = [
    { name: 'Gare de Tunis',   lat: 36.7953, lon: 10.1806 },
    { name: 'Djebel Jelloud', lat: 36.7820, lon: 10.1950 },
    { name: 'Mégrine Riadh',  lat: 36.7720, lon: 10.2200 },
    { name: 'Mégrine',        lat: 36.7686, lon: 10.2336 },
    { name: 'Sidi Rezig',     lat: 36.7650, lon: 10.2500 },
    { name: 'Radès Lycée',   lat: 36.7660, lon: 10.2650 },
    { name: 'Radès',          lat: 36.7667, lon: 10.2833 },
    { name: 'Radès Méliane', lat: 36.7620, lon: 10.2700 },
    { name: 'Ezzahra',        lat: 36.7439, lon: 10.3083 },
    { name: 'Ezzahra Lycée', lat: 36.7400, lon: 10.3200 },
    { name: 'Boukornine',     lat: 36.7320, lon: 10.3300 },
    { name: 'Hammam Lif',     lat: 36.7287, lon: 10.3416 },
    { name: 'Arrêt du Stade',lat: 36.7265, lon: 10.3450 },
    { name: 'Tahar Sfar',     lat: 36.7250, lon: 10.3500 },
    { name: 'Hammam Chott',   lat: 36.7217, lon: 10.3583 },
    { name: 'Bir El Bey',     lat: 36.6980, lon: 10.3725 },
    { name: 'Borj Cédria',   lat: 36.6881, lon: 10.3779 },
    { name: 'Erriadh Station',lat: 36.6882, lon: 10.3779 },
];

// In-memory storage for when DB is down
let latestPositions = [];

// Simple in-memory state for simulator
// Progress step 0.003 per 15s = (0.003/15s) * (total time to cross) 
// With 18 stations, 1 unit = full line. 1/0.003 * 15 = ~5000s = ~83min total which is realistic for suburban
let simulatorState = [
    { train_id: 'TRAIN-A', progress: 0.1, direction: 1, speed: 30, isStopped: false },
    { train_id: 'TRAIN-B', progress: 0.8, direction: -1, speed: 28, isStopped: false }
];

const updateSimulatorPositions = async () => {
    try {
        const newPositions = [];
        for (let train of simulatorState) {
            // Move train: 0.003 progress per 15s ≈ 28 km/h average on 22km line
            if (!train.isStopped) {
                train.progress += (0.003 * train.direction);

                // Reverse if reached ends
                if (train.progress >= 1) {
                    train.progress = 1;
                    train.direction = -1;
                } else if (train.progress <= 0) {
                    train.progress = 0;
                    train.direction = 1;
                }
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
                speed: train.isStopped ? 0 : train.speed + (Math.random() * 5),
                isStopped: train.isStopped,
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

const setTrainStatus = (train_id, isStopped) => {
    const train = simulatorState.find(t => t.train_id === train_id);
    if (train) {
        train.isStopped = isStopped;
        return true;
    }
    return false;
};

module.exports = {
    startService,
    getLatestPositions: () => latestPositions,
    setTrainStatus
};
