require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const trainRoutes = require('./routes/trainRoutes');
const lostItemsRoutes = require('./routes/lostItemsRoutes');
const gpsService = require('./services/gpsService');
const { deleteExpiredItems } = require('./controllers/lostItemsController');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', trainRoutes);
app.use('/api/lost-items', lostItemsRoutes);

// Base route
app.get('/', (req, res) => {
    res.send('Train Tracker API running');
});

// Start listening
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // Start background GPS service
    gpsService.startService();
    // Delete any already-expired lost items on startup
    deleteExpiredItems();
    // Run cleanup every hour
    setInterval(deleteExpiredItems, 60 * 60 * 1000);
});
