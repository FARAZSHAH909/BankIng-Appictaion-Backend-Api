import Card from "../models/bankCardModel.js";
import OpenAccount from "../models/openAccoutModel.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export const createCard = async (req, res) => {
    try {
        const { accountId } = req.body;
        const account = await OpenAccount.findById(accountId);
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        const cardNumber = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join("");
        const cvv = Math.floor(100 + Math.random() * 900).toString();
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 5);
        const month = String(expiryDate.getMonth() + 1).padStart(2, "0");
        const year = String(expiryDate.getFullYear()).slice(-2);

        const card = await Card.create({
            accountId,
            cardNumber,
            expiryDate: `${month}/${year}`,
            cvv,
        });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: account.email,
            subject: "Card Created Successfully",
            text: `Your card has been created successfully. Your card number is ${cardNumber}.`,
        });

        res.status(201).json(card);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



export const setCardPin = async (req, res) => {
    try {
        const { cardNumber, pin } = req.body;

        if (!/^\d{4}$/.test(pin)) {
            return res.status(400).json({ message: "PIN must be exactly 4 digits" });
        }

        const card = await Card.findOne({ cardNumber });
        if (!card) {
            return res.status(404).json({ message: "Card not found" });
        }

        const salt = await bcrypt.genSalt(10);
        card.pin = await bcrypt.hash(pin, salt);
        await card.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: account.email,
            subject: "PIN Set Successfully",
            text: `Your PIN has been set successfully Now You Use This Card For Transaction.`,
        });

        res.status(200).json({ message: "PIN set successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const requestCardOtp = async (req, res) => {
    try {
        const { cardNumber } = req.body;
        const card = await Card.findOne({ cardNumber });
        if (!card) {
            return res.status(404).json({ message: "Card not found" });
        }

        const account = await OpenAccount.findById(card.accountId);
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        card.otp = otp;
        card.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: account.email,
            subject: "Card Verification OTP",
            text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
        });
        

        await card.save();

        res.status(200).json({ message: `OTP sent successfully to ${account.email}`, otp });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCardStatusAndPin = async (req, res) => {
    try {
        const { cardNumber, otp, pin, status } = req.body;

        const card = await Card.findOne({ cardNumber });
        if (!card) {
            return res.status(404).json({ message: "Card not found" });
        }

        if (!card.otp || card.otp.toString() !== otp?.toString()) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (card.otpExpiry < new Date()) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        let message = "Card updated successfully";

        if (pin) {
            if (!/^\d{4}$/.test(pin)) {
                return res.status(400).json({ message: "PIN must be exactly 4 digits" });
            }
            const salt = await bcrypt.genSalt(10);
            card.pin = await bcrypt.hash(pin, salt);
            message = "Card updated and PIN updated successfully";
        }

        if (status) {
            card.cardStatus = status;
        }

        card.otp = null;
        card.otpExpiry = null;
        await card.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: account.email,
            subject: "Card PIN Updated Successfully",
            text: `Your card Pin has been updated successfully.`,
        });

        res.status(200).json({ message, status: card.cardStatus });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
