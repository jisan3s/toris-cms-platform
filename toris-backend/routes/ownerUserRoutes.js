const express = require("express");
const router = express.Router();
const ownerProtect = require("../middleware/ownerAuthMiddleware");
const {
    listUsers,
    setUserBlocked,
    deleteUser
} = require("../controllers/ownerUserController");

router.use(ownerProtect);

router.get("/", listUsers);
router.patch("/:id/block", setUserBlocked);
router.delete("/:id", deleteUser);

module.exports = router;
