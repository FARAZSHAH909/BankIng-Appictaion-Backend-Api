import mongoose from 'mongoose';


const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isLogin: {
            type: Boolean,
            default: false,
        },
        otp: {
            type: String,
            default: null,
            select: false,
        },
        otpExpiry: {
            type: Date,
            default: null,
            select: false,
        },
        forgotPasswordToken: {
            type: String,
            default: null,
            select: false,
        },
        forgotPasswordExpiry: {
            type: Date,
            default: null,
            select: false,
        },
        role: {
            type: String,
            default: 'user',
            enum: ['user', 'admin'],
        },
        phone: {
            type: String,
            default: null,
        },
        profilePicture: {
            type: String,
            default: null,
        },
        lastLogin: {
            type: Date,
            default: null,
        },
        accountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "OpenAccount",
            required: true
        }

    },
    { timestamps: true }
);


export default mongoose.model('User', userSchema);