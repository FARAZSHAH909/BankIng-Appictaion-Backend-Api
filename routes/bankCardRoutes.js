import express from "express";
import { createCard, setCardPin, requestCardOtp, updateCardStatusAndPin } from "../controllers/bankCardController.js";
import { withdrawWithCard } from "../controllers/transactionMoneyController.js";
import accountDetailMiddleware from "../middleware/AccountDetailMiddleware.js";

const router = express.Router();

router.post("/create-card", createCard);
router.post("/set-pin", setCardPin);
router.post("/request-otp", requestCardOtp);
router.post("/update-status-pin", updateCardStatusAndPin);
router.post("/transaction-money",accountDetailMiddleware, withdrawWithCard);


export default router;
