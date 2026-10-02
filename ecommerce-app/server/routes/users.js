const express = require('express');
const { User } = require('../models');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const router = express.Router();

// Get all users (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] } // Don't return passwords
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Make user admin
router.put('/:id/make-admin', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.role = 'admin';
        await user.save();
        
        res.json({ message: 'User role updated to admin' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;