const express = require("express");
const router = express.Router();
const ownerProtect = require("../middleware/ownerAuthMiddleware");
const {
    listContactSubmissions,
    updateContactSubmissionStatus,
    listEmailDeadLetters
} = require("../controllers/ownerContactController");

router.use(ownerProtect);

router.get("/submissions", listContactSubmissions);
router.patch("/submissions/:id/status", updateContactSubmissionStatus);
router.get("/dead-letters", listEmailDeadLetters);

module.exports = router;
