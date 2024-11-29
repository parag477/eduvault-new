const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Course = require('../models/Course');


exports.authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Authentication token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (decoded.role !== user.role) {
            return res.status(401).json({ message: 'Invalid token: Role mismatch' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Access denied. Required role: ${roles.join(' or ')}`
            });
        }
        next();
    };
};

exports.isInstructor = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructor.toString() !== req.user._id.toString() && 
            req.user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Only course instructor or admin can perform this action' 
            });
        }

        req.course = course;
        next();
    } catch (error) {
        console.error('Instructor check error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.isEnrolled = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (!course.students.includes(req.user._id)) {
            return res.status(403).json({ 
                message: 'You must be enrolled in this course to perform this action' 
            });
        }

        req.course = course;
        next();
    } catch (error) {
        console.error('Enrollment check error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
