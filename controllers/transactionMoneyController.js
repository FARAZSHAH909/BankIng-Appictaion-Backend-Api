import TransactionMoneyModel from "../models/TransactionMoneyModel.js";
import openAccountModel from "../models/openAccoutModel.js";
import userBalanceModel from "../models/userBalanceModel.js";
import Card from "../models/bankCardModel.js";
import nodemailer from 'nodemailer';
import bcrypt from "bcryptjs";


export const transactionMoneyController = async (req, res) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        const { accountId, accountNumber: senderAccountNumber, userId } = req.accountDetails;
        const { ReciverAccountNumber, ReciverAccountTitle, amount, description } = req.body;

        // Fetch Sender details for email
        const senderDetail = await openAccountModel.findById(accountId);
        if (!senderDetail) {
            return res.status(404).json({ success: false, message: "Sender account not found" });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid transaction amount" });
        }

        const receiverAccountDetail = await openAccountModel.findOne({
            accountNumber: ReciverAccountNumber,
            accountTitle: ReciverAccountTitle
        });

        if (!receiverAccountDetail) {
            // Send Failure Email to Sender
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: senderDetail.email,
                subject: 'Transaction Failed',
                html: `
                    <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #f44336; text-align: center;">Transaction Failed</h2>
                        <hr>
                        <p>Dear ${senderDetail.name}, your transaction to ${ReciverAccountNumber} failed.</p>
                        <p><strong>Reason:</strong> Receiver account not found or details mismatch.</p>
                        <p><strong>Amount:</strong> PKR ${amount}</p>
                        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                `
            });
            return res.status(404).json({ success: false, message: "Receiver account not found" });
        }

        const senderBalanceDoc = await userBalanceModel.findOne({ accountId });
        if (!senderBalanceDoc || senderBalanceDoc.balance < amount) {
            // Send Failure Email to Sender
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: senderDetail.email,
                subject: 'Transaction Failed',
                html: `
                    <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #f44336; text-align: center;">Transaction Failed</h2>
                        <hr>
                        <p>Dear ${senderDetail.name}, your transaction to ${receiverAccountDetail.name} failed.</p>
                        <p><strong>Reason:</strong> Insufficient balance.</p>
                        <p><strong>Amount:</strong> PKR ${amount}</p>
                        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                `
            });
            return res.status(400).json({ success: false, message: "Insufficient balance" });
        }

        const receiverBalanceDoc = await userBalanceModel.findOne({ accountId: receiverAccountDetail._id });
        if (!receiverBalanceDoc) {
            return res.status(404).json({ success: false, message: "Receiver balance record not found" });
        }

        senderBalanceDoc.balance -= Number(amount);
        receiverBalanceDoc.balance += Number(amount);

        await senderBalanceDoc.save();
        await receiverBalanceDoc.save();

        const transaction = await TransactionMoneyModel.create({
            senderId: accountId,
            receiverId: receiverAccountDetail._id,
            senderAccountNumber,
            receiverAccountNumber: receiverAccountDetail.accountNumber,
            amount,
            userEmail: senderDetail.email,
            loginId: userId,
            status: "completed",
            description: description || `Money transferred to ${ReciverAccountNumber}`
        });

        // Send Success Email to Sender
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: senderDetail.email,
            subject: 'Money Sent Successfully',
            html: `
                <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #4CAF50; text-align: center;">Money Sent Successfully</h2>
                    <hr>
                    <p><strong>Transaction ID:</strong> ${transaction.transactionId}</p>
                    <p><strong>From:</strong> ${senderDetail.name} (${senderAccountNumber})</p>
                    <p><strong>To:</strong> ${receiverAccountDetail.name} (${receiverAccountDetail.accountNumber})</p>
                    <p><strong>Amount:</strong> <span style="color: #4CAF50;">PKR ${amount}</span></p>
                    <p><strong>Status:</strong> COMPLETED</p>
                    <p><strong>Time:</strong> ${transaction.createdAt.toLocaleString()}</p>
                </div>
            `
        });

        // Send Success Email to Receiver
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: receiverAccountDetail.email,
            subject: 'Money Received',
            html: `
                <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #4CAF50; text-align: center;">Money Received</h2>
                    <hr>
                    <p><strong>Transaction ID:</strong> ${transaction.transactionId}</p>
                    <p><strong>From:</strong> ${senderDetail.name} (${senderAccountNumber})</p>
                    <p><strong>To:</strong> ${receiverAccountDetail.name} (${receiverAccountDetail.accountNumber})</p>
                    <p><strong>Amount:</strong> <span style="color: #4CAF50;">PKR ${amount}</span></p>
                    <p><strong>Status:</strong> COMPLETED</p>
                    <p><strong>Time:</strong> ${transaction.createdAt.toLocaleString()}</p>
                </div>
            `
        });

        res.status(200).json({
            success: true,
            message: "Money transferred successfully",
            transaction
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};



export const transactionHistoryController = async (req, res) => {
    try {
        const { userId } = req.accountDetails;
        const transactions = await TransactionMoneyModel.find({ loginId: userId });
        res.status(200).json({ success: true, transactions });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const filterTransactionHistoryController = async (req, res) => {
    try {
        const { userId } = req.accountDetails;
        const {receiverId} = req.params;
        const transactions = await TransactionMoneyModel.find({ loginId: userId, receiverId });
        res.status(200).json({ success: true, transactions });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const withdrawWithCard = async (req, res) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        const { cardNumber, pin, amount } = req.body;

        if (!cardNumber || !pin || !amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid card details, PIN, or amount" });
        }

        const card = await Card.findOne({ cardNumber }).select("+pin");
        if (!card) {
            return res.status(404).json({ success: false, message: "Card not found" });
        }

        const isPinValid = await bcrypt.compare(pin.toString(), card.pin || "");
        if (!isPinValid) {
            return res.status(401).json({ success: false, message: "Incorrect PIN" });
        }

        if (card.cardStatus !== "active") {
            return res.status(400).json({ success: false, message: "Card is not active" });
        }

        if (card.dailyLimit < amount) {
            return res.status(400).json({ success: false, message: "Daily limit exceeded" });
        }

        if (!card.isContactlessEnabled) {
            return res.status(400).json({ success: false, message: "Contactless transactions are disabled" });
        }

        if (card.expiryDate < new Date()) {
            return res.status(400).json({ success: false, message: "Card has expired" });
        }

        const accountDetail = await openAccountModel.findById(card.accountId);
        if (!accountDetail) {
            return res.status(404).json({ success: false, message: "Account associated with card not found" });
        }

        const userBalanceDoc = await userBalanceModel.findOne({ accountId: card.accountId });
        if (!userBalanceDoc || userBalanceDoc.balance < amount) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: accountDetail.email,
                subject: 'Withdrawal Failed',
                html: `
                    <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #f44336; text-align: center;">Withdrawal Failed</h2>
                        <hr>
                        <p>Dear ${accountDetail.name}, your withdrawal of PKR ${amount} failed due to insufficient balance.</p>
                        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                `
            });
            return res.status(400).json({ success: false, message: "Insufficient balance" });
        }

        userBalanceDoc.balance -= Number(amount);
        await userBalanceDoc.save();

        const transaction = await TransactionMoneyModel.create({
            senderId: accountDetail._id,
            receiverId: accountDetail._id,
            senderAccountNumber: accountDetail.accountNumber,
            receiverAccountNumber: accountDetail.accountNumber,
            amount,
            userEmail: accountDetail.email,
            loginId: req.accountDetails.userId,
            status: "completed",
            description: `ATM Withdrawal via Card: ${cardNumber}`
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: accountDetail.email,
            subject: 'Withdrawal Successful',
            html: `
                <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #4CAF50; text-align: center;">Withdrawal Successful</h2>
                    <hr>
                    <p><strong>Transaction ID:</strong> ${transaction.transactionId}</p>
                    <p><strong>Amount:</strong> <span style="color: #f44336;">PKR ${amount}</span></p>
                    <p><strong>Remaining Balance:</strong> PKR ${userBalanceDoc.balance}</p>
                    <p><strong>Time:</strong> ${transaction.createdAt.toLocaleString()}</p>
                </div>
            `
        });

        res.status(200).json({
            success: true,
            message: "Withdrawal successful",
            transaction,
            remainingBalance: userBalanceDoc.balance
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};


