const pool = require('../config/db');

// Full station list matching the frontend (19 stations)
const STATIONS = [
    { name: 'Gare de Tunis',   lat: 36.795311, lon: 10.180563 },
    { name: 'G.D.F. Hached',   lat: 36.7873048, lon: 10.1788879 },
    { name: 'Djebel Jelloud', lat: 36.7724962, lon: 10.2040837 },
    { name: 'Mégrine Riadh',  lat: 36.7702698, lon: 10.2201399 },
    { name: 'Mégrine',        lat: 36.7683269, lon: 10.2294121 },
    { name: 'Sidi Rezig',     lat: 36.7672182, lon: 10.2409349 },
    { name: 'Radès Lycée',   lat: 36.7667611, lon: 10.2563696 },
    { name: 'Radès',          lat: 36.7683081, lon: 10.2675813 },
    { name: 'Radès Méliane', lat: 36.7638474, lon: 10.2802198 },
    { name: 'Ezzahra',        lat: 36.7468667, lon: 10.3022642 },
    { name: 'Ezzahra Lycée', lat: 36.7410292, lon: 10.3132506 },
    { name: 'Boukornine',     lat: 36.7350881, lon: 10.3211148 },
    { name: 'Hammam Lif',     lat: 36.7301698, lon: 10.3309961 },
    { name: 'Arrêt du Stade',lat: 36.7253285, lon: 10.3423043 },
    { name: 'Tahar Sfar',     lat: 36.7183456, lon: 10.3565843 },
    { name: 'Hammam Chott',   lat: 36.7141659, lon: 10.3666802 },
    { name: 'Bir El Bey',     lat: 36.7102676, lon: 10.3742641 },
    { name: 'Borj Cédria',   lat: 36.7042123, lon: 10.3942412 },
    { name: 'Erriadh Station',lat: 36.7005737, lon: 10.411182 },
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
