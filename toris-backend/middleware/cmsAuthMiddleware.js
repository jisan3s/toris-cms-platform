const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const cmsProtect = async (req, res, next) => {
    try {
        if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!["owner", "admin"].includes(decoded.role)) {
            return res.status(403).json({ message: "CMS access denied" });
        }

        const adminUser = await Admin.findById(decoded.id).select("-password");
        if (!adminUser) {
            return res.status(401).json({ message: "Not authorized, account not found" });
        }

        if (adminUser.role !== decoded.role) {
            return res.status(403).json({ message: "Role mismatch" });
        }

        if (adminUser.role === "admin" && !adminUser.createdByOwner) {
            return res.status(403).json({ message: "Admin access denied" });
        }

        if (adminUser.role === "admin" && adminUser.isBlocked) {
            return res.status(403).json({ message: "Your admin account is blocked" });
        }

        req.cmsUser = adminUser;
        return next();
    } catch {
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
};

module.exports = cmsProtect;
