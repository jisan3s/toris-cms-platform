const fs = require("fs");
const path = require("path");

const strict = process.argv.includes("--strict");
const envPath = path.resolve(__dirname, "..", ".env");

const parseEnv = (content) => {
    const values = {};
    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) continue;
        const idx = line.indexOf("=");
        if (idx <= 0) continue;
        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();
        values[key] = value;
    }
    return values;
};

const warnings = [];
const errors = [];

if (!fs.existsSync(envPath)) {
    console.error("Deployment check failed: toris-backend/.env not found.");
    process.exit(1);
}

const env = parseEnv(fs.readFileSync(envPath, "utf8"));

const requiredKeys = [
    "PORT",
    "MONGO_URI",
    "JWT_SECRET",
    "USER_JWT_SECRET",
    "OWNER_EMAIL",
    "OWNER_PASSWORD",
    "CORS_ALLOWED_ORIGINS",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET"
];

for (const key of requiredKeys) {
    if (!String(env[key] || "").trim()) {
        errors.push(`${key} is missing`);
    }
}

const checkSecretStrength = (key) => {
    const value = String(env[key] || "");
    if (value.length < 24) {
        errors.push(`${key} should be at least 24 characters`);
    }
};

checkSecretStrength("JWT_SECRET");
checkSecretStrength("USER_JWT_SECRET");

if (!String(env.MONGO_URI || "").startsWith("mongodb+srv://")) {
    errors.push("MONGO_URI should use mongodb+srv:// (Atlas)");
}

const corsOrigins = String(env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

if (corsOrigins.length === 0) {
    errors.push("CORS_ALLOWED_ORIGINS is empty");
} else {
    const localhostOrigin = corsOrigins.find((origin) => /localhost|127\.0\.0\.1/i.test(origin));
    if (localhostOrigin) {
        const message = `CORS_ALLOWED_ORIGINS contains local origin (${localhostOrigin})`;
        if (strict) {
            errors.push(message);
        } else {
            warnings.push(message);
        }
    }
}

const ownerPassword = String(env.OWNER_PASSWORD || "");
if (ownerPassword.length < 10) {
    const message = "OWNER_PASSWORD should be at least 10 characters";
    if (strict) {
        errors.push(message);
    } else {
        warnings.push(message);
    }
}

if (warnings.length > 0) {
    console.warn("Deployment check warnings:");
    for (const warning of warnings) {
        console.warn(`- ${warning}`);
    }
}

if (errors.length > 0) {
    console.error("Deployment check failed:");
    for (const issue of errors) {
        console.error(`- ${issue}`);
    }
    process.exit(1);
}

console.log(`Backend deployment check passed${strict ? " (strict)" : ""}.`);
