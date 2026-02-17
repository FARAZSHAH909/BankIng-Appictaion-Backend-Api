import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OpenAccount",
        required: true
    },

    cardNumber: {
        type: String,
        required: true,
        unique: true
    },

    expiryDate: {
        type: String, // format MM/YY
        required: true
    },

    cvv: {   // 3 digit security
        type: String,
        required: true
    },

    pin: {
        type: String,
        select: false
    },
    otp: {
        type: String,
        default: null,
       
    },
    otpExpiry: {
        type: Date,
        default: null,
    
    },
    cardStatus: {
        type: String,
        enum: ["active", "blocked", "locked"],
        default: "active"
    },

    isContactlessEnabled: {
        type: Boolean,
        default: true
    },

    dailyLimit: {
        type: Number,
        default: 50000
    }

}, { timestamps: true });

export default mongoose.model("Card", cardSchema);
