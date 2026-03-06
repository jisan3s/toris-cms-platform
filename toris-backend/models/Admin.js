const mongoose = require("mongoose");
const { fullPermissions } = require("../utils/adminPermissions");

const adminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ["owner", "admin"],
            default: "admin"
        },
        isBlocked: {
            type: Boolean,
            default: false
        },
        createdByOwner: {
            type: Boolean,
            default: false
        },
        permissions: {
            home: { type: Boolean, default: false },
            about: { type: Boolean, default: false },
            blog: { type: Boolean, default: false },
            services: { type: Boolean, default: false },
            projects: { type: Boolean, default: false }
        }
    },
    { timestamps: true }
);

adminSchema.pre("save", function setRolePermissions() {
    if (this.role === "owner") {
        this.permissions = fullPermissions();
        this.createdByOwner = true;
    } else if (this.role === "admin") {
        this.permissions = fullPermissions();
    }
});

module.exports = mongoose.model("Admin", adminSchema);
