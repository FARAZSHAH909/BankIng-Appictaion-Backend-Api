import OpenAccount from "../models/openAccoutModel.js";
import userBalanceModel from "../models/userBalanceModel.js";

export const userBalanceController = async (req, res) => {
    try {
        const { accountNumber, balance } = req.body;

        if (!accountNumber || balance === undefined) {
            return res.status(400).json({
                success: false,
                message: "AccountNumber and balance are required"
            });
        }

        // Fetch account details using accountNumber from OpenAccount model
        const accountDetails = await OpenAccount.findOne({ accountNumber });

        if (!accountDetails) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            });
        }

        // Update or create balance record using accountNumber by incrementing the balance
        const updatedBalance = await userBalanceModel.findOneAndUpdate(
            { accountNumber },
            {
                $inc: {
                    balance,
                }
            },
            { new: true, upsert: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Balance updated successfully",
            data: updatedBalance
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};