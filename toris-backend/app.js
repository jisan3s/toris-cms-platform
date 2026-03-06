const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const ownerAuthRoutes = require("./routes/ownerAuthRoutes");
const userRoutes = require("./routes/userRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const ownerAdminRoutes = require("./routes/ownerAdminRoutes");
const ownerUserRoutes = require("./routes/ownerUserRoutes");
const ownerContactRoutes = require("./routes/ownerContactRoutes");
const ownerContentRoutes = require("./routes/ownerContentRoutes");
const publicContentRoutes = require("./routes/publicContentRoutes");
const errorHandler = require("./middleware/errorHandler");
const withRequestContext = require("./middleware/requestContext");
const {
    securityHeaders,
    apiLimiter,
    authLimiter,
    ownerAuthLimiter,
    adminAuthLimiter,
    validateProductionSecurityConfig
} = require("./config/security");

const isProduction = process.env.NODE_ENV === "production";

const parseAllowedOrigins = () => {
    const configured = (process.env.CORS_ALLOWED_ORIGINS || "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
        .map((origin) => origin.replace(/\/+$/, ""));

    if (configured.length > 0) {
        return new Set(configured);
    }

    if (!isProduction) {
        return new Set([
            "http://localhost:4200",
            "http://127.0.0.1:4200",
            "http://localhost:4000",
            "http://127.0.0.1:4000",
            "http://localhost:5001",
            "http://127.0.0.1:5001"
        ]);
    }

    return new Set();
};

const createApp = () => {
    validateProductionSecurityConfig();
    const app = express();
    const allowedOrigins = parseAllowedOrigins();

    const corsOptions = {
        origin(origin, callback) {
            if (!origin) {
                return callback(null, true);
            }

            const normalizedOrigin = origin.replace(/\/+$/, "");
            if (allowedOrigins.has(normalizedOrigin)) {
                return callback(null, true);
            }

            return callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
        optionsSuccessStatus: 204
    };

    app.disable("x-powered-by");
    if (isProduction) {
        app.set("trust proxy", 1);
    }
    app.use(securityHeaders);
    app.use(cors(corsOptions));
    app.use(express.json({ limit: "20mb" }));
    app.use(withRequestContext);

    app.use("/api/auth", authLimiter, authRoutes);
    app.use("/api/owner/auth", ownerAuthLimiter, ownerAuthRoutes);
    app.use("/api/admin/auth", adminAuthLimiter, adminAuthRoutes);
    app.use("/api/owner", apiLimiter, adminRoutes);
    app.use("/api/owner/admins", apiLimiter, ownerAdminRoutes);
    app.use("/api/owner/users", apiLimiter, ownerUserRoutes);
    app.use("/api/owner/contact", apiLimiter, ownerContactRoutes);
    app.use("/api/owner/content", apiLimiter, ownerContentRoutes);
    app.use("/api/content", apiLimiter, publicContentRoutes);
    app.use("/api/user", apiLimiter, userRoutes);

    app.get("/", (req, res) => {
        res.send("Toris Backend Running");
    });

    app.get("/health", (req, res) => {
        res.json({ status: "ok", uptime: Math.round(process.uptime()) });
    });

    app.get("/ready", (req, res) => {
        res.json({ status: "ready" });
    });

    app.use(errorHandler);

    return { app, allowedOrigins };
};

module.exports = {
    createApp,
    parseAllowedOrigins
};
