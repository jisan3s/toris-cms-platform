const express = require("express");
const router = express.Router();
const { adminLogin } = require("../controllers/adminAuthController");
const { requireAdminLoginPayload } = require("../validators/authValidator");

router.post("/login", requireAdminLoginPayload, adminLogin);

module.exports = router;
