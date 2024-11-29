const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    assignments: [{
        title: String,
        description: String,
        dueDate: Date,
        points: Number,
        submissions: [{
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            submissionDate: Date,
            content: String,
            grade: Number,
            feedback: String
        }]
    }],
    materials: [{
        title: String,
        type: {
            type: String,
            enum: ['document', 'video', 'link'],
            required: true
        },
        content: String,
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }],
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

courseSchema.pre(/^find/, function(next) {
    this.populate('instructor', 'name email')
        .populate('students', 'name email');
    next();
});

courseSchema.methods.isStudentEnrolled = function(studentId) {
    return this.students.includes(studentId);
};

courseSchema.methods.enrollStudent = function(studentId) {
    if (!this.students.includes(studentId)) {
        this.students.push(studentId);
    }
};

module.exports = mongoose.model('Course', courseSchema);
