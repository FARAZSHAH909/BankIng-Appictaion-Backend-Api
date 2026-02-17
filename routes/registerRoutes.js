import express from "express";
import { handleRegistration, handleLogin, handleForgotPassword , verifyOtp, resetPassword } from '../controllers/registerController.js';
import verifyEmail from '../controllers/emailVerify.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
const router = express.Router();

// POST /register
router.post('/register', handleRegistration);

// POST /verify-email (for API)
router.post('/verify-email', verifyEmail);

// GET /verify-email (for email links)
router.get('/verify-email', verifyEmail);


// POST /login
router.post('/login', handleLogin);

// POST /ForgotPassword
router.post('/forgotpassword', handleForgotPassword);

// post /verifyotp
router.post('/verifyotp', verifyOtp);

// post /resetpassword
router.post('/resetpassword', resetPassword);

router.get('/admin-data', protect, authorize('admin'), (req, res) => {
  res.json({ data: "Sensitive admin information" });
});

router.get('/profile', protect, (req, res) => {
  res.json({ user: req.user });
});

export default router;