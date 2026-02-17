import express from 'express';
const router = express.Router();
import { openAccountController, verifyOtpController } from '../controllers/openAccountController.js';

// open account
router.post('/open-account', openAccountController);
// verify otp
router.post('/verify-otp', verifyOtpController);



export default router;  