const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const { authenticateToken, authorize, isInstructor } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

router.post('/',
    authenticateToken,
    authorize('teacher', 'admin'),
    [
        body('title').trim().notEmpty().withMessage('Course title is required'),
        body('description').trim().notEmpty().withMessage('Course description is required'),
        body('startDate').optional().isISO8601().toDate().withMessage('Valid start date is required'),
        body('endDate').optional().isISO8601().toDate().withMessage('Valid end date is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const course = new Course({
                ...req.body,
                instructor: req.user._id
            });

            await course.save();
            res.status(201).json(course);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
);

router.get('/', authenticateToken, async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('instructor', 'name email')
            .populate('students', '_id name')
            .select('-assignments -__v')
            .lean();

        const processedCourses = courses.map(course => ({
            ...course,
            instructor: course.instructor || null,
            students: course.students || []
        }));
        res.json(processedCourses);
    } 
    catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/teaching', 
    authenticateToken,
    authorize('teacher', 'admin'),
    async (req, res) => {
        try {
            const courses = await Course.find({ instructor: req.user._id })
                .populate('instructor', 'name email')
                .populate('students', 'name email');
            res.json(courses);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
);

router.get('/enrolled', 
    authenticateToken,
    authorize('student'),
    async (req, res) => {
        try {            
            const courses = await Course.find({
                students: req.user._id
            }).populate('instructor', 'name email _id');
            res.json(courses);
        } 
        catch (error) {
            console.error('Error fetching enrolled courses:', error);
            res.status(500).json({ message: 'Error fetching enrolled courses', error: error.message });
        }
    }
);

router.get('/available', authenticateToken, authorize('student'), async (req, res) => {
        try {
            const allCourses = await Course.find({}).populate('instructor', 'name email _id');
            const availableCourses = allCourses.filter(course => {
                const isEnrolled = course.students.some(studentId => 
                    studentId.toString() === req.user._id.toString()
                );
                return !isEnrolled;
            });
            res.json(availableCourses);
        } 
        catch (error) {
            res.status(500).json({ message: 'Error fetching available courses', error: error.message });
        }
    }
);

router.get('/:courseId', authenticateToken, async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId)
            .populate('instructor', 'name email _id')
            .populate('students', 'name email');

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course);
    } 
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});



router.put('/:courseId',
    authenticateToken,
    authorize('teacher', 'admin'),
    [
        body('title').trim().optional().notEmpty().withMessage('Course title cannot be empty'),
        body('description').trim().optional().notEmpty().withMessage('Course description cannot be empty'),
        body('startDate').optional().isISO8601().toDate().withMessage('Valid start date is required'),
        body('endDate').optional().isISO8601().toDate().withMessage('Valid end date is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const course = await Course.findById(req.params.courseId);
            
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }

            if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized to update this course' });
            }

            const updatedCourse = await Course.findByIdAndUpdate(
                req.params.courseId,
                { $set: req.body },
                { new: true }
            ).populate('instructor', 'name email');

            res.json(updatedCourse);
        } 
        catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
);

router.delete('/:courseId',
    authenticateToken,
    authorize('teacher', 'admin'),
    async (req, res) => {
        try {
            const course = await Course.findById(req.params.courseId).populate('instructor', 'name email _id');
            
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }

            const instructorId = course.instructor._id.toString();
            const userId = req.user._id.toString();

            if (instructorId !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ 
                    message: 'Not authorized to delete this course',
                    details: {
                        isInstructor: instructorId === userId,
                        isAdmin: req.user.role === 'admin'
                    }
                });
            }

            await Course.findByIdAndDelete(req.params.courseId);
            res.json({ message: 'Course deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
);

router.post('/:courseId/enroll',
    authenticateToken,
    authorize('student'),
    async (req, res) => {
        try {
            const course = await Course.findById(req.params.courseId);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }

            const isEnrolled = course.students.some(studentId => 
                studentId.toString() === req.user._id.toString()
            );

            if (isEnrolled) {
                return res.status(400).json({ message: 'Already enrolled in this course' });
            }

            course.students.push(req.user._id);
            await course.save();

            res.json({ message: 'Successfully enrolled in course', course });
        } catch (error) {
            console.error('Error enrolling in course:', error);
            res.status(500).json({ message: 'Error enrolling in course', error: error.message });
        }
    }
);


router.delete('/:courseId/unenroll',
    authenticateToken,
    authorize('student'),
    async (req, res) => {
        try {
            const { courseId } = req.params;
            const studentId = req.user._id;

            if (!mongoose.Types.ObjectId.isValid(courseId)) {
                return res.status(400).json({ message: 'Invalid course ID format' });
            }

            const course = await Course.findById(courseId).populate('students', '_id');
            
            if (!course) {
                console.error('Course not found:', courseId);
                return res.status(404).json({ message: 'Course not found' });
            }

            const studentIdStr = studentId.toString();
            const isEnrolled = course.students.some(s => s._id.toString() === studentIdStr);
            
            if (!isEnrolled) {
                return res.status(400).json({ 
                    message: 'You are not enrolled in this course',
                    details: {
                        studentId: studentIdStr,
                        courseId: course._id.toString(),
                        enrolled: false
                    }
                });
            }

            course.students = course.students.filter(s => s._id.toString() !== studentIdStr);
            await course.save();
            res.json({ 
                message: 'Successfully unenrolled from course',
                courseId: course._id.toString()
            });
        } catch (error) {
            console.error('Error during unenrollment:', error);
            res.status(500).json({ 
                message: 'Error unenrolling from course', 
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }
);

module.exports = router;
