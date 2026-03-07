const pool = require('../config/db');
const path = require('path');

// Delete expired items (older than 30 days)
const deleteExpiredItems = async () => {
    try {
        const [result] = await pool.query(
            'DELETE FROM lost_items WHERE expires_at < NOW()'
        );
        if (result.affectedRows > 0) {
            console.log(`🗑️  Deleted ${result.affectedRows} expired lost item(s).`);
        }
    } catch (error) {
        console.error('Error deleting expired items:', error.message);
    }
};

// GET /api/lost-items - Get all active items
const getAllItems = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT *, 
             DATEDIFF(expires_at, NOW()) AS days_remaining
             FROM lost_items 
             WHERE expires_at > NOW()
             ORDER BY created_at DESC`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching lost items:', error.message);
        res.status(500).json({ error: 'Server error fetching items' });
    }
};

// POST /api/lost-items - Create a new item
const createItem = async (req, res) => {
    try {
        const { type, author, item, description, location, item_date, item_time, contact } = req.body;

        if (!type || !author || !item || !contact) {
            return res.status(400).json({ error: 'type, author, item, and contact are required.' });
        }

        // If an image was uploaded via multer
        let image_url = null;
        if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
        }

        const [result] = await pool.query(
            `INSERT INTO lost_items 
             (type, author, item, description, location, item_date, item_time, contact, image_url, expires_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))`,
            [type, author, item, description || null, location || null, item_date || null, item_time || null, contact, image_url]
        );

        const [newItem] = await pool.query(
            `SELECT *, DATEDIFF(expires_at, NOW()) AS days_remaining FROM lost_items WHERE id = ?`,
            [result.insertId]
        );

        res.status(201).json(newItem[0]);
    } catch (error) {
        console.error('Error creating lost item:', error.message);
        res.status(500).json({ error: 'Server error creating item' });
    }
};

// PATCH /api/lost-items/:id/status - Mark as resolved
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'resolved'].includes(status)) {
            return res.status(400).json({ error: 'Status must be "active" or "resolved"' });
        }

        await pool.query('UPDATE lost_items SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Status updated successfully' });
    } catch (error) {
        console.error('Error updating status:', error.message);
        res.status(500).json({ error: 'Server error updating status' });
    }
};

// PATCH /api/lost-items/:id/like - Increment likes
const likeItem = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE lost_items SET likes = likes + 1 WHERE id = ?', [id]);
        const [updated] = await pool.query('SELECT likes FROM lost_items WHERE id = ?', [id]);
        res.json({ likes: updated[0].likes });
    } catch (error) {
        console.error('Error liking item:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { getAllItems, createItem, updateStatus, likeItem, deleteExpiredItems };
