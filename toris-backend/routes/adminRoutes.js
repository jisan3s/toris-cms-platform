const express = require("express");
const router = express.Router();
const ownerProtect = require("../middleware/ownerAuthMiddleware");

// protected owner dashboard route
router.get("/dashboard", ownerProtect, (req, res) => {
    res.json({
        message: "Welcome Owner Dashboard",
        owner: req.owner
    });
});

module.exports = router;
