require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Admin = require("../models/Admin");
const { emptyPermissions, normalizePermissions } = require("../utils/adminPermissions");

const PERMISSION_KEYS = ["home", "about", "blog", "services", "projects"];

const parseArgs = () => {
    const args = process.argv.slice(2);
    const options = {
        emails: [],
        permissions: [],
        apply: false
    };

    args.forEach((arg) => {
        if (arg.startsWith("--emails=")) {
            options.emails = arg
                .replace("--emails=", "")
                .split(",")
                .map((email) => email.trim().toLowerCase())
                .filter(Boolean);
        } else if (arg.startsWith("--permissions=")) {
            options.permissions = arg
                .replace("--permissions=", "")
                .split(",")
                .map((key) => key.trim().toLowerCase())
                .filter(Boolean);
        } else if (arg === "--apply") {
            options.apply = true;
        }
    });

    return options;
};

const validateOptions = ({ emails, permissions }) => {
    if (!emails.length) {
        throw new Error("Missing --emails. Example: --emails=admin1@site.com,admin2@site.com");
    }

    if (!permissions.length) {
        throw new Error("Missing --permissions. Example: --permissions=home,about");
    }

    const invalid = permissions.filter((key) => !PERMISSION_KEYS.includes(key));
    if (invalid.length) {
        throw new Error(`Invalid permissions: ${invalid.join(", ")}. Allowed: ${PERMISSION_KEYS.join(", ")}`);
    }
};

const permissionObjectFromKeys = (keys = []) => {
    const base = emptyPermissions();
    keys.forEach((key) => {
        base[key] = true;
    });
    return base;
};

const run = async () => {
    const options = parseArgs();
    validateOptions(options);

    const permissions = normalizePermissions(
        permissionObjectFromKeys(options.permissions),
        emptyPermissions()
    );

    await connectDB();

    const admins = await Admin.find({
        email: { $in: options.emails },
        role: "admin"
    });

    const foundEmails = admins.map((admin) => (admin.email || "").toLowerCase());
    const missingEmails = options.emails.filter((email) => !foundEmails.includes(email));

    console.log("Selected emails:", options.emails.join(", "));
    console.log("Permissions to set:", JSON.stringify(permissions));
    console.log("Found admins:", foundEmails.length);
    if (missingEmails.length) {
        console.log("Not found:", missingEmails.join(", "));
    }

    if (!options.apply) {
        console.log("Dry run mode. No database changes made.");
        console.log("Re-run with --apply to execute the migration.");
        return;
    }

    let updatedCount = 0;
    for (const admin of admins) {
        admin.createdByOwner = true;
        admin.permissions = normalizePermissions(permissions, admin.permissions || emptyPermissions());
        await admin.save();
        updatedCount += 1;
    }

    console.log(`Migration completed. Updated ${updatedCount} admin account(s).`);
};

run()
    .catch((error) => {
        console.error("Migration failed:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.connection.close();
    });
