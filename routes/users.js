const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.put('/me', 
    authenticateToken,
    [
        body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
        body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('currentPassword').optional().notEmpty().withMessage('Current password is required for password change'),
        body('newPassword').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, email, currentPassword, newPassword } = req.body;
            const user = await User.findById(req.user.userId);

            if (name) user.name = name;
            if (email) user.email = email;

            if (currentPassword && newPassword) {
                const isMatch = await user.comparePassword(currentPassword);
                if (!isMatch) {
                    return res.status(400).json({ message: 'Current password is incorrect' });
                }
                user.password = newPassword;
            }

            await user.save();
            const updatedUser = await User.findById(req.user.userId).select('-password');
            res.json(updatedUser);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
);

router.get('/', authenticateToken, authorize('admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.put('/:userId/role',
    authenticateToken,
    authorize('admin'),
    [
        body('role').isIn(['student', 'teacher', 'admin']).withMessage('Invalid role')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const user = await User.findById(req.params.userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            user.role = req.body.role;
            await user.save();

            res.json(user);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
);

router.delete('/:userId', authenticateToken, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.findByIdAndDelete(req.params.userId);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
