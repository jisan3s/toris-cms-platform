const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const { fullPermissions } = require("../utils/adminPermissions");

const normalizeEmail = (email) => (email || "").trim().toLowerCase();
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");

exports.listAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({ role: "admin", createdByOwner: true }).select("-password");
        return res.json(admins);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required" });
        }

        const normalizedName = String(name).trim();
        const normalizedEmail = normalizeEmail(email);
        if (!normalizedName) {
            return res.status(400).json({ message: "Name is required" });
        }
        if (!isValidEmail(normalizedEmail)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        if (String(password).length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const existing = await Admin.findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(400).json({ message: "Admin email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await Admin.create({
            name: normalizedName,
            email: normalizedEmail,
            password: hashedPassword,
            role: "admin",
            isBlocked: false,
            createdByOwner: true,
            permissions: fullPermissions()
        });

        return res.status(201).json({
            message: "Admin created successfully",
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                isBlocked: admin.isBlocked,
                permissions: admin.permissions
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        const admin = await Admin.findOne({ _id: id, role: "admin", createdByOwner: true });
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        if (email) {
            const normalizedEmail = normalizeEmail(email);
            if (!isValidEmail(normalizedEmail)) {
                return res.status(400).json({ message: "Invalid email format" });
            }
            const emailTaken = await Admin.findOne({
                email: normalizedEmail,
                _id: { $ne: id }
            });
            if (emailTaken) {
                return res.status(400).json({ message: "Email already in use" });
            }
            admin.email = normalizedEmail;
        }

        if (name) {
            admin.name = String(name).trim();
            if (!admin.name) {
                return res.status(400).json({ message: "Name is required" });
            }
        }

        admin.permissions = fullPermissions();

        await admin.save();

        return res.json({
            message: "Admin updated successfully",
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                isBlocked: admin.isBlocked,
                permissions: admin.permissions
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.setAdminBlocked = async (req, res) => {
    try {
        const { id } = req.params;
        const { isBlocked } = req.body;

        if (typeof isBlocked !== "boolean") {
            return res.status(400).json({ message: "isBlocked must be boolean" });
        }

        const admin = await Admin.findOneAndUpdate(
            { _id: id, role: "admin", createdByOwner: true },
            { isBlocked },
            { returnDocument: "after" }
        ).select("-password");

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        return res.json({
            message: `Admin ${isBlocked ? "blocked" : "unblocked"} successfully`,
            admin
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Admin.findOneAndDelete({ _id: id, role: "admin", createdByOwner: true });

        if (!deleted) {
            return res.status(404).json({ message: "Admin not found" });
        }

        return res.json({ message: "Admin deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
