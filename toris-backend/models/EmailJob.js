const mongoose = require("mongoose");

const emailJobSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            trim: true
        },
        payload: {
            type: Object,
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "processing", "failed", "dead_letter", "sent"],
            default: "pending",
            index: true
        },
        attempts: {
            type: Number,
            default: 0
        },
        maxAttempts: {
            type: Number,
            default: 5
        },
        nextAttemptAt: {
            type: Date,
            default: Date.now,
            index: true
        },
        lastError: {
            type: String,
            default: ""
        },
        sentAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("EmailJob", emailJobSchema);
