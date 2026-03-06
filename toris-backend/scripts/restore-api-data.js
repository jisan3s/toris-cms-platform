require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const INPUT_DIR = path.resolve(__dirname, "../data/api-export");
const COLLECTIONS = [
    "aboutcontents",
    "cmscontents",
    "sitesections",
    "contactsubmissions",
    "emailjobs"
];

const readJsonArray = (filePath) => {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
        throw new Error(`Expected array in ${filePath}`);
    }
    return parsed;
};

const run = async () => {
    const mongoUri = String(process.env.MONGO_URI || "").trim();
    if (!mongoUri) {
        throw new Error("MONGO_URI is missing in environment");
    }

    if (!fs.existsSync(INPUT_DIR)) {
        throw new Error(`Export directory not found: ${INPUT_DIR}`);
    }

    const allowReplace = process.argv.includes("--replace");
    if (!allowReplace) {
        throw new Error("Restore is blocked by default. Re-run with --replace to overwrite target collections.");
    }

    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;
    const summary = [];

    for (const collectionName of COLLECTIONS) {
        const filePath = path.join(INPUT_DIR, `${collectionName}.json`);
        if (!fs.existsSync(filePath)) {
            summary.push({ collection: collectionName, restored: 0, skipped: true });
            continue;
        }

        const docs = readJsonArray(filePath);
        const collection = db.collection(collectionName);
        await collection.deleteMany({});
        if (docs.length > 0) {
            await collection.insertMany(docs, { ordered: false });
        }
        summary.push({ collection: collectionName, restored: docs.length, skipped: false });
    }

    console.log(JSON.stringify({
        ok: true,
        inputDir: INPUT_DIR,
        replaced: true,
        collections: summary
    }, null, 2));

    await mongoose.disconnect();
};

run().catch(async (error) => {
    console.error(error.message || error);
    try {
        await mongoose.disconnect();
    } catch {}
    process.exit(1);
});
