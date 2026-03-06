const express = require("express");
const router = express.Router();
const userProtect = require("../middleware/userAuthMiddleware");

router.get("/dashboard", userProtect, (req, res) => {
    res.json({
        message: "Welcome User Dashboard",
        user: req.user
    });
});

module.exports = router;
