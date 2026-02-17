import User from '../models/registerModel.js';

const verifyEmail = async (req, res) => {
    // Support both query params (GET from email link) and body params (POST from API)
    const email = req.query?.email || req.body?.email;
    const otp = req.query?.otp || req.body?.otp;

    // Validate input
    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    try {
        // Find user and include the otp and otpExpiry fields (they have select: false)
        const user = await User.findOne({ email }).select('+otp +otpExpiry');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user is already verified
        if (user.isVerified) {
            return res.status(200).json({
                message: 'Email already verified',
                user: {
                    username: user.username,
                    email: user.email,
                    isVerified: user.isVerified
                }
            });
        }

        // Check if OTP exists
        if (!user.otp) {
            return res.status(400).json({ message: 'No OTP found. Please register again.' });
        }

        // Check if OTP has expired
        if (user.otpExpiry && Date.now() > user.otpExpiry) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        // Verify OTP
        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }




        // Update user verification status
        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        return res.status(200).json({
            message: 'Email verified successfully! ✅',
            user: {
                username: user.username,
                email: user.email,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export default verifyEmail;
