const fs = require("fs");
const path = require("path");

const envPath = path.resolve(__dirname, "..", ".env");

const weakValues = new Set([
    "changeme",
    "user_changeme",
    "toris_super_secret",
    "toris_user_secret",
    "123456",
    "6543211",
    "password",
    "admin",
    "owner",
    "your-cloud-name",
    "your-api-key",
    "your-api-secret",
    "your_owner_password"
]);

const parseEnv = (content) => {
    const values = {};
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const index = trimmed.indexOf("=");
        if (index <= 0) continue;
        const key = trimmed.slice(0, index).trim();
        const value = trimmed.slice(index + 1).trim();
        values[key] = value;
    }
    return values;
};

if (!fs.existsSync(envPath)) {
    console.error("No .env file found at toris-backend/.env");
    process.exit(1);
}

const env = parseEnv(fs.readFileSync(envPath, "utf8"));
const findings = [];

const requireStrongValue = (key, minLength = 24) => {
    const value = String(env[key] || "").trim();
    if (!value) {
        findings.push(`${key} is missing`);
        return;
    }
    if (value.length < minLength) {
        findings.push(`${key} is too short (minimum ${minLength} characters recommended)`);
    }
    if (weakValues.has(value)) {
        findings.push(`${key} uses a weak/default value`);
    }
};

requireStrongValue("JWT_SECRET");
requireStrongValue("USER_JWT_SECRET");

const ownerPassword = String(env.OWNER_PASSWORD || "").trim();
if (!ownerPassword) {
    findings.push("OWNER_PASSWORD is missing");
} else if (ownerPassword.length < 10 || weakValues.has(ownerPassword)) {
    findings.push("OWNER_PASSWORD is weak (use 10+ chars with mixed symbols)");
}

const mongoUri = String(env.MONGO_URI || "").trim();
if (!mongoUri) {
    findings.push("MONGO_URI is missing");
} else if (!mongoUri.startsWith("mongodb+srv://")) {
    findings.push("MONGO_URI should use mongodb+srv:// for Atlas");
} else if (mongoUri.includes("<db_user>") || mongoUri.includes("<db_password>") || mongoUri.includes("<cluster-name>")) {
    findings.push("MONGO_URI still contains placeholder values");
}

const cloudinaryCloudName = String(env.CLOUDINARY_CLOUD_NAME || "").trim();
const cloudinaryApiKey = String(env.CLOUDINARY_API_KEY || "").trim();
const cloudinaryApiSecret = String(env.CLOUDINARY_API_SECRET || "").trim();

if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
    findings.push("Cloudinary credentials are incomplete");
} else {
    if (weakValues.has(cloudinaryCloudName) || weakValues.has(cloudinaryApiKey) || weakValues.has(cloudinaryApiSecret)) {
        findings.push("Cloudinary credentials still use placeholder/default values");
    }
}

if (findings.length > 0) {
    console.error("Secret check failed:");
    findings.forEach((issue) => console.error(`- ${issue}`));
    process.exit(1);
}

console.log("Secret check passed.");
