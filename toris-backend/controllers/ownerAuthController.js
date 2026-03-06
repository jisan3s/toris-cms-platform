const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { fullPermissions } = require("../utils/adminPermissions");
const { ownerEmail, ownerPassword, ownerName, normalize } = require("../config/credentials");
const { sendErrorResponse } = require("../utils/apiErrors");

const generateOwnerToken = (id) => {
    return jwt.sign({ id, role: "owner" }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });
};

exports.ownerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!ownerEmail || !ownerPassword) {
            return sendErrorResponse(res, 500, "Owner credentials are not configured");
        }

        const inputEmail = normalize(email);
        if (inputEmail !== ownerEmail || password !== ownerPassword) {
            return sendErrorResponse(res, 401, "Invalid owner credentials");
        }

        const owner = await Admin.findOne({ email: ownerEmail, role: "owner" });
        if (!owner) {
            return sendErrorResponse(res, 500, "Owner account not initialized");
        }

        return res.json({
            message: "Owner login successful",
            token: generateOwnerToken(owner._id),
            owner: {
                id: owner._id,
                name: owner.name,
                email: owner.email
            }
        });
    } catch (error) {
        return sendErrorResponse(res, 500, "Failed to login owner", error, "ownerAuth.ownerLogin");
    }
};

exports.bootstrapOwner = async () => {
    const email = ownerEmail;
    const password = ownerPassword;

    if (!email || !password) {
        console.warn("OWNER_EMAIL or OWNER_PASSWORD not set; owner bootstrap skipped");
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Admin.findOneAndUpdate(
        { email: ownerEmail },
        {
            name: ownerName || "Owner",
            email: email,
            password: hashedPassword,
            role: "owner",
            isBlocked: false,
            createdByOwner: true,
            permissions: fullPermissions()
        },
        {
            upsert: true,
            returnDocument: "after"
        }
    );
};
