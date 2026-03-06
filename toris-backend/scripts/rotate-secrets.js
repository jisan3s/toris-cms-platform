const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const envPath = path.resolve(__dirname, "..", ".env");
const auditPath = path.resolve(__dirname, "..", ".secrets-ops.json");
const args = new Set(process.argv.slice(2));
const rotateOwnerPassword = args.has("--owner") || args.has("--all");
const dryRun = args.has("--dry-run");

const generateSecret = (length = 48) => {
    return crypto.randomBytes(length).toString("base64url");
};

const generateOwnerPassword = () => {
    // Avoid '#' and spaces to keep .env parsing straightforward.
    return `Own_${crypto.randomBytes(16).toString("base64url")}`;
};

const upsertEnvValue = (source, key, value) => {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`^${escaped}=.*$`, "m");
    if (regex.test(source)) {
        return source.replace(regex, `${key}=${value}`);
    }
    const needsTrailingNewline = source.length > 0 && !source.endsWith("\n");
    return `${source}${needsTrailingNewline ? "\n" : ""}${key}=${value}\n`;
};

if (!fs.existsSync(envPath)) {
    console.error("No .env file found. Create toris-backend/.env first.");
    process.exit(1);
}

let envContent = fs.readFileSync(envPath, "utf8");

const newJwtSecret = generateSecret();
const newUserJwtSecret = generateSecret();
const changedKeys = ["JWT_SECRET", "USER_JWT_SECRET"];

envContent = upsertEnvValue(envContent, "JWT_SECRET", newJwtSecret);
envContent = upsertEnvValue(envContent, "USER_JWT_SECRET", newUserJwtSecret);

let ownerPassword = "";
if (rotateOwnerPassword) {
    ownerPassword = generateOwnerPassword();
    envContent = upsertEnvValue(envContent, "OWNER_PASSWORD", ownerPassword);
    changedKeys.push("OWNER_PASSWORD");
}

if (!dryRun) {
    fs.writeFileSync(envPath, envContent, "utf8");
}

const now = new Date().toISOString();
const auditPayload = {
    lastRotationAt: now,
    rotatedKeys: changedKeys
};
if (!dryRun) {
    fs.writeFileSync(auditPath, `${JSON.stringify(auditPayload, null, 2)}\n`, "utf8");
}

console.log(dryRun ? "Secrets dry-run complete." : "Secrets rotated successfully.");
console.log(`Updated keys: ${changedKeys.join(", ")}`);
if (rotateOwnerPassword) {
    console.log(`New OWNER_PASSWORD: ${ownerPassword}`);
    console.log("Store this password securely before restarting backend.");
}
