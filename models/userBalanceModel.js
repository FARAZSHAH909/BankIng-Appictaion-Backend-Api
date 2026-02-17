import mongoose from "mongoose";

const balanceSchema = new mongoose.Schema({
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OpenAccount",
        required: true,
        unique: true
    },
    accountNumber: {
        type: String,
        required: true,
        unique: true
    },
    accountHolderName: {    
        type: String,
        required: true  
    },
    accountHolderEmail: {       
        type: String,
        required: true
    },  
    accountHolderPhone: {           
        type: String,
        required: true
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    currency: {
        type: String,
        default: "PKR"
    },
    isFrozen: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model("Balance", balanceSchema);
