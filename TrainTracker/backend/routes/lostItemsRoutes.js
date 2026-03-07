const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getAllItems, createItem, updateStatus, likeItem } = require('../controllers/lostItemsController');

// Configure multer storage for uploaded images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG and WebP images are allowed'), false);
    }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// Routes
router.get('/', getAllItems);
router.post('/', upload.single('image'), createItem);
router.patch('/:id/status', updateStatus);
router.patch('/:id/like', likeItem);

module.exports = router;
