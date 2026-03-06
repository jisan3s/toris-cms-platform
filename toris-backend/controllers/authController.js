const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendErrorResponse } = require("../utils/apiErrors");
const { isAdminEmailAllowed, normalize } = require("../config/credentials");

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });
};


// REGISTER ADMIN
exports.registerAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const isSelfRegisterEnabled = process.env.ADMIN_SELF_REGISTER === "true";
        const adminCount = await Admin.countDocuments();

        if (!isSelfRegisterEnabled) {
            return sendErrorResponse(res, 403, "Admin registration is disabled");
        }

        if (adminCount > 0) {
            return sendErrorResponse(res, 403, "Admin registration is closed");
        }

        if (!isAdminEmailAllowed(email)) {
            return sendErrorResponse(res, 403, "You are not allowed to register as admin");
        }

        // check existing admin
        const normalizedEmail = normalize(email);
        const exists = await Admin.findOne({ email: normalizedEmail });
        if (exists)
        return sendErrorResponse(res, 400, "Admin already exists");

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = await Admin.create({
            name,
            email: normalizedEmail,
            password: hashedPassword
        });

        return res.status(201).json({
            message: "Admin registered successfully",
            token: generateToken(admin._id),
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email
            }
        });

    } catch (error) {
        return sendErrorResponse(res, 500, "Failed to register admin", error, "auth.registerAdmin");
    }
};


// LOGIN ADMIN
exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!isAdminEmailAllowed(email)) {
            return sendErrorResponse(res, 403, "You are not allowed to access admin dashboard");
        }

        const normalizedEmail = normalize(email);
        const admin = await Admin.findOne({ email: normalizedEmail });
        if (!admin)
        return sendErrorResponse(res, 401, "Invalid credentials");

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch)
        return sendErrorResponse(res, 401, "Invalid credentials");

        res.json({
            message: "Login successful",
            token: generateToken(admin._id),
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email
            }
        });

    } catch (error) {
        return sendErrorResponse(res, 500, "Failed to login admin", error, "auth.loginAdmin");
    }
};
