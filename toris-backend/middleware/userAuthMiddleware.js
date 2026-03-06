const jwt = require("jsonwebtoken");
const User = require("../models/User");

const userProtect = async (req, res, next) => {
    try {
        if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.USER_JWT_SECRET || process.env.JWT_SECRET);

        if (decoded.role !== "user" || (decoded.type && decoded.type !== "access")) {
            return res.status(403).json({ message: "User access required" });
        }

        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "Not authorized, user not found" });
        }
        if (user.isBlocked) {
            return res.status(403).json({ message: "Account is blocked" });
        }

        req.user = user;
        return next();
    } catch {
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
};

module.exports = userProtect;
