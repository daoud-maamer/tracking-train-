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
             WHERE expires_at > NOW() AND status = 'approved'
             ORDER BY created_at DESC`
        );

        if (req.user) {
            const userId = req.user.id;
            const [likes] = await pool.query(`SELECT item_id FROM lost_item_likes WHERE user_id = ?`, [userId]);
            const likedItemIds = new Set(likes.map(l => l.item_id));
            rows.forEach(row => {
                row.is_liked = likedItemIds.has(row.id);
            });
        } else {
            rows.forEach(row => {
                row.is_liked = false;
            });
        }

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

// PATCH /api/lost-items/:id/like - Increment/Decrement likes
const likeItem = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [existing] = await pool.query('SELECT * FROM lost_item_likes WHERE user_id = ? AND item_id = ?', [userId, id]);
        
        let is_liked = false;

        if (existing.length > 0) {
            // Unlike
            await pool.query('DELETE FROM lost_item_likes WHERE user_id = ? AND item_id = ?', [userId, id]);
            await pool.query('UPDATE lost_items SET likes = likes - 1 WHERE id = ?', [id]);
            is_liked = false;
        } else {
            // Like
            await pool.query('INSERT INTO lost_item_likes (user_id, item_id) VALUES (?, ?)', [userId, id]);
            await pool.query('UPDATE lost_items SET likes = likes + 1 WHERE id = ?', [id]);
            is_liked = true;
        }

        const [updated] = await pool.query('SELECT likes FROM lost_items WHERE id = ?', [id]);
        res.json({ likes: updated[0].likes, is_liked });
    } catch (error) {
        console.error('Error liking item:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET /api/lost-items/pending - Get pending items (admin only)
const getPendingItems = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT * FROM lost_items WHERE status = 'pending' ORDER BY created_at DESC`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching pending items:', error.message);
        res.status(500).json({ error: 'Server error fetching items' });
    }
};

// PATCH /api/lost-items/:id/approve - Approve or Reject an item (admin only)
const approveRejectItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Status must be "approved" or "rejected"' });
        }

        const [result] = await pool.query('UPDATE lost_items SET status = ? WHERE id = ?', [status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json({ message: `Item successfully marked as ${status}` });
    } catch (error) {
        console.error('Error updating status:', error.message);
        res.status(500).json({ error: 'Server error updating status' });
    }
};

module.exports = { getAllItems, getPendingItems, createItem, updateStatus, approveRejectItem, likeItem, deleteExpiredItems };
