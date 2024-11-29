const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId;
        },
        minlength: 6
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student'
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
});

userSchema.pre('save', async function(next) {
    if (this.isModified('password') && this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) {
        return false;
    }
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        console.error('Password comparison error:', error);
        throw new Error('Password comparison failed');
    }
};

userSchema.methods.hasRole = function(role) {
    return this.role === role;
};

module.exports = mongoose.model('User', userSchema);
