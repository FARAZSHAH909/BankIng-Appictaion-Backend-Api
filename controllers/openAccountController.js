import OpenAccount from '../models/openAccoutModel.js';
import userBalanceModel from '../models/userBalanceModel.js';
import nodemailer from 'nodemailer';


export const openAccountController = async (req, res) => {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
        return res.status(400).json({ message: 'Name, email, phone are required.' });
    }

    try {
        const existingUser = await OpenAccount.findOne({ $or: [{ email }, { phone }] });

        if (existingUser) {
            const message = existingUser.email === email
                ? 'Email is already registered.'
                : 'Phone number is already registered.';
            return res.status(409).json({ message });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

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
            subject: 'Email Verification or Open Account - OTP Code',
            html: `
                <h2>Open Account</h2>
                <p>Welcome ${name}, thank you for choosing to open an account. Please use the following OTP to verify your email:</p>
                <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        });

        const accountNumber = Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
        const bankNames = ['UBL', 'Meezan Islamic Bank', 'HBL', 'Allied Bank', 'Bank Alfalah', 'MCB Bank'];
        const accountTitle = bankNames[Math.floor(Math.random() * bankNames.length)];

        const newUser = await OpenAccount.create({
            name,
            email,
            phone,
            otp,
            otpExpiry,
            isVerified: false,
            accountNumber,
            accountTitle
        });

        // Initialize user balance
        await userBalanceModel.create({
            accountId: newUser._id,
            accountNumber: newUser.accountNumber,
            accountHolderName: newUser.name,
            accountHolderEmail: newUser.email,
            accountHolderPhone: newUser.phone,
            balance: 0
        });

        res.status(201).json({
            success: true,
            message: `User ${name} Open Account successfully. Please check your email for the OTP code.`,
            user: {
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                isVerified: newUser.isVerified,
                accountNumber: newUser.accountNumber,
                accountTitle: newUser.accountTitle
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

export const verifyOtpController = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required.' });
        }

        const user = await OpenAccount.findOne({ email }).select('+otp +otpExpiry');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (!user.otp) {
            return res.status(400).json({ message: 'No OTP found. Please request again.' });
        }

        if (user.otpExpiry < Date.now()) {
            user.otp = null;
            user.otpExpiry = null;
            await user.save();
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP.' });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: `"Your Bank" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to Your Bank - Account Activated!',
            html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                <div style="background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); padding: 30px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 28px;">Welcome Abroad!</h1>
                    <p style="margin-top: 10px; font-size: 16px; opacity: 0.9;">Your bank account is now active and ready to use.</p>
                </div>
                <div style="padding: 30px; color: #333; line-height: 1.6;">
                    <p>Dear <strong>${user.name}</strong>,</p>
                    <p>Congratulations! Your email has been successfully verified. We are excited to have you with us. Below are your account details for your reference:</p>
                    
                    <div style="background-color: #f8f9fa; border-left: 4px solid #4CAF50; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #666; width: 40%;">Account Number:</td>
                                <td style="padding: 8px 0; font-weight: bold; color: #1a1a1a;">${user.accountNumber}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;">Account Title:</td>
                                <td style="padding: 8px 0; font-weight: bold; color: #1a1a1a;">${user.accountTitle}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;">Status:</td>
                                <td style="padding: 8px 0;"><span style="background: #e8f5e9; color: #2e7d32; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">ACTIVATED</span></td>
                            </tr>
                        </table>
                    </div>

                    <p>You can now log in to your dashboard to manage your funds, track transactions, and explore our services.</p>
                    
                    <div style="text-align: center; margin-top: 35px;">
                        <a href="#" style="background: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Login to Your Account</a>
                    </div>
                </div>
                <div style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #777;">
                    <p>If you have any questions, please contact our 24/7 support team.</p>
                    <p>&copy; 2026 Your Bank. All rights reserved.</p>
                </div>
            </div>
            `
        });

        res.status(200).json({ message: 'Email verified successfully. You can now use this account.' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};