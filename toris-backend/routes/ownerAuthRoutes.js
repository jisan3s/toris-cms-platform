const express = require("express");
const router = express.Router();
const { ownerLogin } = require("../controllers/ownerAuthController");
const { requireOwnerLoginPayload } = require("../validators/authValidator");

router.post("/login", requireOwnerLoginPayload, ownerLogin);

module.exports = router;
