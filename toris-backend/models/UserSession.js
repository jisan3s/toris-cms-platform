const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        tokenHash: {
            type: String,
            required: true,
            index: true
        },
        tokenId: {
            type: String,
            required: true,
            index: true
        },
        ipAddress: {
            type: String,
            default: ""
        },
        userAgent: {
            type: String,
            default: ""
        },
        expiresAt: {
            type: Date,
            required: true,
            index: true
        },
        revokedAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("UserSession", userSessionSchema);
