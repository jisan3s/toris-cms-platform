const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendErrorResponse } = require("../utils/apiErrors");
const { normalize } = require("../config/credentials");

const generateAdminToken = (id) => {
    return jwt.sign({ id, role: "admin" }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });
};

exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = normalize(email);

        const admin = await Admin.findOne({
            email: normalizedEmail,
            role: "admin",
            createdByOwner: true
        });

        if (!admin) {
            return sendErrorResponse(res, 401, "Invalid credentials");
        }

        if (admin.isBlocked) {
            return sendErrorResponse(res, 403, "Your admin account is blocked");
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return sendErrorResponse(res, 401, "Invalid credentials");
        }

        return res.json({
            message: "Admin login successful",
            token: generateAdminToken(admin._id),
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                permissions: admin.permissions
            }
        });
    } catch (error) {
        return sendErrorResponse(res, 500, "Failed to login admin", error, "adminAuth.login");
    }
};
