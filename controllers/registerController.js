import User from '../models/registerModel.js';
import OpenAccount from '../models/openAccoutModel.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

// registration
export const handleRegistration = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    try {
        const account = await OpenAccount.findOne({ email }).exec();
        if (!account) {
            return res.status(404).json({ message: 'No account found with this email. Please open an account first.' });
        }
        if (!account.isVerified) {
            return res.status(403).json({ message: 'Your account is not verified. Please verify your account first.' });
        }

        const duplicate = await User.findOne({ email }).exec();
        if (duplicate) {
            return res.status(409).json({ message: 'User already exists.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 10 * 60 * 1000;

        const verificationLink = `${req.protocol}://${req.get('host')}/api/verify-email?email=${email}&otp=${otp}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification - OTP Code',
            html: `
                <h2>Welcome ${username}!</h2>
                <p>Thank you for registering. Please use the following OTP to verify your email:</p>
                <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p> 
                <a href="${verificationLink}">Verify Email</a>
            `
        });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            otp,
            otpExpiry,
            isVerified: false,
            accountId: account._id
        });

        res.status(201).json({
            message: `User ${username} registered successfully. Please check your email for the OTP code.`,
            user: {
                username: newUser.username,
                email: newUser.email,
                isVerified: newUser.isVerified
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// login
export const handleLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const foundUser = await User.findOne({ email }).select("+password");
        if (!foundUser) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const match = await bcrypt.compare(password, foundUser.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        if (!foundUser.isVerified) {
            return res.status(403).json({ message: 'Email not verified.' });
        }

        const account = await OpenAccount.findById(foundUser.accountId);
        if (!account) {
            return res.status(404).json({ message: 'Associated account not found.' });
        }

        foundUser.isLogin = true;
        foundUser.lastLogin = new Date();
        await foundUser.save();

        const token = jwt.sign(
            { 
                userId: foundUser._id, 
                username: foundUser.username, 
                accountId: account._id,
                accountNumber: account.accountNumber,
                accountTitle: account.accountTitle
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                username: foundUser.username,
                email: foundUser.email,
                isVerified: foundUser.isVerified,
                lastLogin: foundUser.lastLogin
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// forgot password

export const handleForgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 10 * 60 * 1000;

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset - OTP Code',
            html: `
                <h2>Password Reset Request</h2>
                <p>You requested to reset your password. Please use the following OTP code:</p>
                <h1 style="color: #2196F3; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        });

        res.status(200).json({ message: 'Password reset OTP has been sent to your email.' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// verify otp
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required.' });
        }

        const user = await User.findOne({ email }).select('+otp +otpExpiry');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (!user.otp) {
            return res.status(400).json({ message: 'No OTP found. Please request again.' });
        }

        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired.' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP.' });
        }

        return res.status(200).json({ message: 'OTP verified successfully.' });

    } catch (err) {
        return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};


// reset password

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword, accountNumber } = req.body;

        if (!email || !otp || !newPassword || !accountNumber) {
            return res.status(400).json({ message: 'Email, OTP, new password, and account number are required.' });
        }

        const user = await User.findOne({ email }).select('+otp +otpExpiry');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const account = await OpenAccount.findOne({
            email: user.email,
            accountNumber: { $regex: `${accountNumber}$` }
        });

        if (!account) {
            return res.status(404).json({ message: 'Account not found or account number mismatch.' });
        }

        if (!user.otp) {
            return res.status(400).json({ message: 'No OTP found. Please request again.' });
        }

        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired.' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        account.password = hashedPassword;
        account.otp = null;
        account.otpExpiry = null;
        await account.save();

        return res.status(200).json({ message: 'Password reset successful. You can now login with your new password.' });

    } catch (err) {
        return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

