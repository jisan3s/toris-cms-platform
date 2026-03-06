const express = require("express");
const router = express.Router();
const {
    userLoginLimiter,
    userForgotLimiter,
    userResetLimiter
} = require("../config/security");
const {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    verifyEmail,
    refreshUserToken,
    logoutUser
} = require("../controllers/userAuthController");

router.post("/register", registerUser);
router.post("/login", userLoginLimiter, loginUser);
router.post("/forgot-password", userForgotLimiter, forgotPassword);
router.post("/reset-password", userResetLimiter, resetPassword);
router.post("/verify-email", verifyEmail);
router.post("/refresh", refreshUserToken);
router.post("/logout", logoutUser);

module.exports = router;
