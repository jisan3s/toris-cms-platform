const User = require("../models/User");
const UserSession = require("../models/UserSession");
const EmailJob = require("../models/EmailJob");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sanitizeEmail, sanitizeText } = require("../utils/sanitize");

const ACCESS_SECRET = () => process.env.USER_JWT_SECRET || process.env.JWT_SECRET;
const REFRESH_SECRET = () => process.env.USER_REFRESH_JWT_SECRET || process.env.USER_JWT_SECRET || process.env.JWT_SECRET;
const EMAIL_VERIFY_REQUIRED = () => String(process.env.USER_EMAIL_VERIFY_REQUIRED || "").toLowerCase() === "true";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const signAccessToken = (id) =>
    jwt.sign({ id, role: "user", type: "access" }, ACCESS_SECRET(), { expiresIn: process.env.USER_ACCESS_TOKEN_TTL || "30m" });

const signRefreshToken = (id, tokenId) =>
    jwt.sign(
        { id, role: "user", type: "refresh", jti: tokenId },
        REFRESH_SECRET(),
        { expiresIn: process.env.USER_REFRESH_TOKEN_TTL || "30d" }
    );

const issueAuthTokens = async (user, req) => {
    const tokenId = crypto.randomUUID();
    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id, tokenId);
    const refreshTokenHash = hashToken(refreshToken);
    const refreshTtlDays = Math.max(1, Number.parseInt(process.env.USER_REFRESH_TOKEN_DAYS || "30", 10) || 30);
    const expiresAt = new Date(Date.now() + refreshTtlDays * 24 * 60 * 60 * 1000);

    await UserSession.create({
        userId: user._id,
        tokenHash: refreshTokenHash,
        tokenId,
        ipAddress: String(req.ip || ""),
        userAgent: String(req?.headers?.["user-agent"] || ""),
        expiresAt
    });

    return { accessToken, refreshToken };
};

const queueVerificationEmail = async (user, verificationToken, req) => {
    const frontendOrigin = String(process.env.FRONTEND_ORIGIN || "").trim().replace(/\/+$/, "");
    const fallbackOrigin = req?.headers?.origin ? String(req.headers.origin).replace(/\/+$/, "") : "http://localhost:4200";
    const verifyBase = frontendOrigin || fallbackOrigin;
    const verificationLink = `${verifyBase}/verify-email?token=${encodeURIComponent(verificationToken)}`;
    await EmailJob.create({
        type: "verify_email",
        payload: {
            to: user.email,
            verificationLink
        },
        status: "pending",
        attempts: 0,
        maxAttempts: Math.max(1, Number.parseInt(process.env.EMAIL_WORKER_MAX_ATTEMPTS || "5", 10) || 5),
        nextAttemptAt: new Date()
    });
};

exports.registerUser = async (req, res) => {
    try {
        const name = sanitizeText(req.body?.name, { max: 80, allowNewlines: false });
        const email = sanitizeEmail(req.body?.email);
        const password = String(req.body?.password || "");

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required" });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const emailVerificationToken = crypto.randomBytes(32).toString("hex");
        const emailVerificationTokenHash = hashToken(emailVerificationToken);
        const emailVerifyTtlMinutes = Math.max(
            1,
            Number.parseInt(process.env.EMAIL_VERIFY_TOKEN_TTL_MINUTES || "1440", 10) || 1440
        );

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            emailVerified: EMAIL_VERIFY_REQUIRED() ? false : true,
            emailVerificationTokenHash,
            emailVerificationExpiresAt: new Date(Date.now() + emailVerifyTtlMinutes * 60 * 1000)
        });

        if (EMAIL_VERIFY_REQUIRED()) {
            await queueVerificationEmail(user, emailVerificationToken, req);
            return res.status(201).json({
                message: "User registered successfully. Please verify your email to log in.",
                verifyRequired: true
            });
        }

        const { accessToken, refreshToken } = await issueAuthTokens(user, req);
        return res.status(201).json({
            message: "User registered successfully",
            token: accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const token = sanitizeText(req.body?.token, { max: 200, allowNewlines: false });
        if (!token) {
            return res.status(400).json({ message: "Verification token is required" });
        }
        const tokenHash = hashToken(token);
        const user = await User.findOne({
            emailVerificationTokenHash: tokenHash,
            emailVerificationExpiresAt: { $gt: new Date() }
        });
        if (!user) {
            return res.status(400).json({ message: "Verification token is invalid or expired" });
        }
        user.emailVerified = true;
        user.emailVerificationTokenHash = "";
        user.emailVerificationExpiresAt = null;
        await user.save();
        return res.json({ message: "Email verified successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const email = sanitizeEmail(req.body?.email);
        const password = String(req.body?.password || "");
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        if (user.isBlocked) {
            return res.status(403).json({ message: "Account is blocked" });
        }
        if (EMAIL_VERIFY_REQUIRED() && !user.emailVerified) {
            return res.status(403).json({ message: "Please verify your email before login" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const { accessToken, refreshToken } = await issueAuthTokens(user, req);
        return res.json({
            message: "Login successful",
            token: accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.refreshUserToken = async (req, res) => {
    try {
        const refreshToken = sanitizeText(req.body?.refreshToken, { max: 3000, allowNewlines: false });
        if (!refreshToken) {
            return res.status(400).json({ message: "refreshToken is required" });
        }

        const decoded = jwt.verify(refreshToken, REFRESH_SECRET());
        if (decoded?.type !== "refresh" || decoded?.role !== "user" || !decoded?.jti) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        const tokenHash = hashToken(refreshToken);
        const session = await UserSession.findOne({
            userId: decoded.id,
            tokenId: decoded.jti,
            tokenHash,
            revokedAt: null,
            expiresAt: { $gt: new Date() }
        });
        if (!session) {
            return res.status(401).json({ message: "Session expired or invalid" });
        }

        const user = await User.findById(decoded.id);
        if (!user || user.isBlocked) {
            return res.status(403).json({ message: "User is not allowed" });
        }

        const token = signAccessToken(user._id);
        return res.json({ message: "Token refreshed", token });
    } catch {
        return res.status(401).json({ message: "Invalid refresh token" });
    }
};

exports.logoutUser = async (req, res) => {
    try {
        const refreshToken = sanitizeText(req.body?.refreshToken, { max: 3000, allowNewlines: false });
        if (!refreshToken) {
            return res.status(400).json({ message: "refreshToken is required" });
        }
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET());
        const tokenHash = hashToken(refreshToken);
        await UserSession.updateMany(
            {
                userId: decoded.id,
                tokenId: decoded.jti,
                tokenHash,
                revokedAt: null
            },
            { revokedAt: new Date() }
        );
        return res.json({ message: "Logged out successfully" });
    } catch {
        return res.status(200).json({ message: "Logged out" });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const email = sanitizeEmail(req.body?.email);
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "No account found with this email" });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetPasswordTokenHash = hashToken(resetToken);
        const resetTokenTtlMinutes = Math.max(
            1,
            Number.parseInt(process.env.RESET_PASSWORD_TOKEN_TTL_MINUTES || "15", 10) || 15
        );
        const resetPasswordExpiresAt = new Date(Date.now() + resetTokenTtlMinutes * 60 * 1000);

        user.resetPasswordTokenHash = resetPasswordTokenHash;
        user.resetPasswordExpiresAt = resetPasswordExpiresAt;
        await user.save();

        return res.json({
            message: "Email verified",
            resetToken,
            expiresAt: resetPasswordExpiresAt.toISOString()
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const token = sanitizeText(req.body?.token, { max: 200, allowNewlines: false });
        const password = String(req.body?.password || "");
        const confirmPassword = String(req.body?.confirmPassword || "");

        if (!token || !password || !confirmPassword) {
            return res.status(400).json({ message: "Token, password, and confirmPassword are required" });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const tokenHash = hashToken(token);
        const user = await User.findOne({
            resetPasswordTokenHash: tokenHash,
            resetPasswordExpiresAt: { $gt: new Date() }
        });
        if (!user) {
            return res.status(400).json({ message: "Reset token is invalid or expired" });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordTokenHash = "";
        user.resetPasswordExpiresAt = null;
        await user.save();

        await UserSession.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() });

        return res.json({ message: "Password reset successful" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
