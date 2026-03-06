const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const protect = async (req, res, next) => {
    let token;

    try {
        // check authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            // get token
            token = req.headers.authorization.split(" ")[1];

            // verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // attach admin to request
            req.admin = await Admin.findById(decoded.id).select("-password");

            next();
        } else {
            res.status(401).json({ message: "Not authorized, no token" });
        }
    } catch {
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};

module.exports = protect;
