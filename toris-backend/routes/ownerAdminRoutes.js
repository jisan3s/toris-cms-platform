const express = require("express");
const router = express.Router();
const ownerProtect = require("../middleware/ownerAuthMiddleware");
const {
    listAdmins,
    createAdmin,
    updateAdmin,
    setAdminBlocked,
    deleteAdmin
} = require("../controllers/ownerAdminController");

router.use(ownerProtect);

router.get("/", listAdmins);
router.post("/", createAdmin);
router.put("/:id", updateAdmin);
router.patch("/:id/block", setAdminBlocked);
router.delete("/:id", deleteAdmin);

module.exports = router;
