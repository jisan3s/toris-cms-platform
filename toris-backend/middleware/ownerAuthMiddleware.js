const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const ownerProtect = async (req, res, next) => {
    try {
        if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "owner") {
            return res.status(403).json({ message: "Owner access required" });
        }

        const owner = await Admin.findById(decoded.id).select("-password");
        if (!owner) {
            return res.status(401).json({ message: "Not authorized, owner not found" });
        }
        if (owner.role !== "owner") {
            return res.status(403).json({ message: "Owner access required" });
        }

        req.owner = owner;
        return next();
    } catch {
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
};

module.exports = ownerProtect;
