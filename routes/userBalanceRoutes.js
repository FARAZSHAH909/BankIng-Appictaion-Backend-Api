import express from "express";
import { userBalanceController } from "../controllers/userBalanceController.js";
import { transactionMoneyController , transactionHistoryController, filterTransactionHistoryController } from "../controllers/transactionMoneyController.js";
import accountDetailMiddleware from "../middleware/AccountDetailMiddleware.js";
const router = express.Router();



// post /user-balance
router.post('/user-balance', userBalanceController )

// post /transaction-money
router.post('/transaction-money', accountDetailMiddleware, transactionMoneyController )

// post /transaction-history
router.get('/transaction-history', accountDetailMiddleware, transactionHistoryController )

//post /filter-transaction-history
router.get('/filter-transaction-history/:receiverId', accountDetailMiddleware, filterTransactionHistoryController )


export default router;