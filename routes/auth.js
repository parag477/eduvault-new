const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://eduvault-new.vercel.app//api/auth/google/callback",
    passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ email: profile.emails[0].value });
        
        if (!user) {
            let role = 'student';
            try {
                if (req.query.state) {
                    const stateData = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
                    role = stateData.role || 'student';
                }
            } catch (error) {
                console.error('Error parsing state:', error);
            }
            
            user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id,
                role: role
            });
            await user.save();
            console.log('New user created:', user);
        } else {
            if (!user.googleId) {
                user.googleId = profile.id;
                await user.save();
                console.log('Updated existing user with Google ID:', user);
            }
        }
        
        return done(null, user);
    } catch (error) {
        console.error('Google auth error:', error);
        return done(error, null);
    }
}));

router.use(passport.initialize());

const validateSignup = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 3 })
        .withMessage('Password must be at least 3 characters long'),
    body('role')
        .optional()
        .isIn(['student', 'teacher'])
        .withMessage('Invalid role specified')
];


// Signup
router.post('/signup', validateSignup, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, password, role = 'student' } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: 'User already exists',
                errors: [{ msg: 'Email is already registered' }]
            });
        }

        // Create new user
        user = new User({
            name,
            email,
            password,
            role
        });

        await user.save();

        const token = jwt.sign({ 
                userId: user._id,
                role: user.role  
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            message: 'Server error',
            errors: [{ msg: error.message }]
        });
    }
});

// Login Route
router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: 'Authentication failed',
                errors: [{ msg: 'Invalid email or password' }]
            });
        }

        //  password verification
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                message: 'Authentication failed',
                errors: [{ msg: 'Invalid email or password' }]
            });
        }

        const token = jwt.sign(
            { 
                userId: user._id,
                role: user.role  
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Server error',
            errors: [{ msg: error.message }]
        });
    }
});

// Google Auth
router.get('/google', (req, res, next) => {
    const role = req.query.role || 'student';
    
    const state = Buffer.from(JSON.stringify({ role })).toString('base64');
    
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        state: state
    })(req, res, next);
});

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    async (req, res) => {
        try {
            if (!req.user) {
                throw new Error('Authentication failed - no user');
            }

            const token = jwt.sign({ 
                    userId: req.user._id, 
                    role: req.user.role || 'student'
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            let redirectPath;
            const userRole = req.user.role || 'student';
            
            switch (userRole) {
                case 'admin':
                    redirectPath = '/admin/dashboard';
                    break;
                case 'teacher':
                    redirectPath = '/teacher/dashboard';
                    break;
                default:
                    redirectPath = '/student/dashboard';
            }
            res.redirect(`${process.env.CLIENT_URL}${redirectPath}?token=${token}`);
        } 
        catch (error) {
            console.error('Callback error:', error);
            res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
        }
    }
);

router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } 
    catch (error) {
        console.error('Get user error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = router;



