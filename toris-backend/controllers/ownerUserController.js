const User = require("../models/User");

exports.listUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .select("-password -resetPasswordTokenHash -resetPasswordExpiresAt")
            .sort({ createdAt: -1 });
        return res.json(users);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.setUserBlocked = async (req, res) => {
    try {
        const { id } = req.params;
        const { isBlocked } = req.body;
        if (typeof isBlocked !== "boolean") {
            return res.status(400).json({ message: "isBlocked must be boolean" });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { isBlocked },
            { returnDocument: "after" }
        ).select("-password -resetPasswordTokenHash -resetPasswordExpiresAt");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json({
            message: `User ${isBlocked ? "blocked" : "unblocked"} successfully`,
            user
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await User.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.json({ message: "User deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
