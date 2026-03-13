const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getAllItems, getPendingItems, createItem, updateStatus, approveRejectItem, likeItem } = require('../controllers/lostItemsController');
const { authMiddleware, adminMiddleware, optionalAuth } = require('../middleware/auth');

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
// Public route to view approved items but optionally get user context
router.get('/', optionalAuth, getAllItems);

// Protected routes (require login)
router.post('/', authMiddleware, upload.single('image'), createItem);
router.patch('/:id/status', authMiddleware, updateStatus);
router.patch('/:id/like', authMiddleware, likeItem);

// Admin routes
router.get('/pending', authMiddleware, adminMiddleware, getPendingItems);
router.patch('/:id/approve', authMiddleware, adminMiddleware, approveRejectItem);

module.exports = router;
