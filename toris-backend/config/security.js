const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const isProduction = process.env.NODE_ENV === "production";

const toPositiveInt = (rawValue, fallback) => {
    const parsed = Number(rawValue);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const createLimiter = ({ windowMs, max, message, standardHeaders = true }) =>
    rateLimit({
        windowMs,
        max,
        standardHeaders,
        legacyHeaders: false,
        message: { message }
    });

const securityHeaders = helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
});

const apiLimiter = createLimiter({
    windowMs: toPositiveInt(process.env.API_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: toPositiveInt(process.env.API_RATE_LIMIT_MAX, 300),
    message: "Too many requests. Please try again later."
});

const authLimiter = createLimiter({
    windowMs: toPositiveInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: toPositiveInt(process.env.AUTH_RATE_LIMIT_MAX, 20),
    message: "Too many login attempts. Please wait and try again."
});

const ownerAuthLimiter = createLimiter({
    windowMs: toPositiveInt(process.env.OWNER_AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: toPositiveInt(process.env.OWNER_AUTH_RATE_LIMIT_MAX, 12),
    message: "Too many owner login attempts. Please wait and try again."
});

const adminAuthLimiter = createLimiter({
    windowMs: toPositiveInt(process.env.ADMIN_AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: toPositiveInt(process.env.ADMIN_AUTH_RATE_LIMIT_MAX, 12),
    message: "Too many admin login attempts. Please wait and try again."
});

const userLoginLimiter = createLimiter({
    windowMs: toPositiveInt(process.env.USER_LOGIN_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: toPositiveInt(process.env.USER_LOGIN_RATE_LIMIT_MAX, 10),
    message: "Too many login attempts. Please wait and try again."
});

const userForgotLimiter = createLimiter({
    windowMs: toPositiveInt(process.env.USER_FORGOT_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: toPositiveInt(process.env.USER_FORGOT_RATE_LIMIT_MAX, 8),
    message: "Too many forgot-password attempts. Please wait and try again."
});

const userResetLimiter = createLimiter({
    windowMs: toPositiveInt(process.env.USER_RESET_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: toPositiveInt(process.env.USER_RESET_RATE_LIMIT_MAX, 12),
    message: "Too many reset attempts. Please wait and try again."
});

const validateProductionSecurityConfig = () => {
    if (!isProduction) return;

    const requiredKeys = ["MONGO_URI", "JWT_SECRET", "USER_JWT_SECRET", "USER_REFRESH_JWT_SECRET", "CORS_ALLOWED_ORIGINS"];
    const missing = requiredKeys.filter((key) => !String(process.env[key] || "").trim());

    if (missing.length > 0) {
        throw new Error(`Missing required production environment variables: ${missing.join(", ")}`);
    }

    const weakSecretValues = new Set(["changeme", "user_changeme", "toris_super_secret", "toris_user_secret"]);
    const jwtSecret = String(process.env.JWT_SECRET || "").trim();
    const userJwtSecret = String(process.env.USER_JWT_SECRET || "").trim();
    const userRefreshJwtSecret = String(process.env.USER_REFRESH_JWT_SECRET || "").trim();

    if (jwtSecret.length < 24 || weakSecretValues.has(jwtSecret)) {
        throw new Error("JWT_SECRET is too weak for production. Use a strong random value (24+ chars).");
    }

    if (userJwtSecret.length < 24 || weakSecretValues.has(userJwtSecret)) {
        throw new Error("USER_JWT_SECRET is too weak for production. Use a strong random value (24+ chars).");
    }

    if (userRefreshJwtSecret.length < 24 || weakSecretValues.has(userRefreshJwtSecret)) {
        throw new Error("USER_REFRESH_JWT_SECRET is too weak for production. Use a strong random value (24+ chars).");
    }
};

module.exports = {
    securityHeaders,
    apiLimiter,
    authLimiter,
    ownerAuthLimiter,
    adminAuthLimiter,
    userLoginLimiter,
    userForgotLimiter,
    userResetLimiter,
    validateProductionSecurityConfig
};
