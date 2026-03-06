require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const OUTPUT_DIR = path.resolve(__dirname, "../data/api-export");
const metadataFile = path.join(OUTPUT_DIR, "_metadata.json");

const COLLECTIONS = [
    "aboutcontents",
    "cmscontents",
    "sitesections",
    "contactsubmissions",
    "emailjobs"
];

const ensureDir = (dirPath) => {
    fs.mkdirSync(dirPath, { recursive: true });
};

const writeJson = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const run = async () => {
    const mongoUri = String(process.env.MONGO_URI || "").trim();
    if (!mongoUri) {
        throw new Error("MONGO_URI is missing in environment");
    }

    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;

    ensureDir(OUTPUT_DIR);

    const existingCollections = await db.listCollections().toArray();
    const existingSet = new Set(existingCollections.map((item) => item.name));

    const summary = [];

    for (const collectionName of COLLECTIONS) {
        if (!existingSet.has(collectionName)) {
            summary.push({ collection: collectionName, count: 0, skipped: true });
            continue;
        }

        const docs = await db.collection(collectionName).find({}).toArray();
        const outFile = path.join(OUTPUT_DIR, `${collectionName}.json`);
        writeJson(outFile, docs);
        summary.push({ collection: collectionName, count: docs.length, skipped: false });
    }

    writeJson(metadataFile, {
        exportedAt: new Date().toISOString(),
        source: "MongoDB Atlas",
        collections: summary
    });

    console.log(JSON.stringify({ ok: true, outputDir: OUTPUT_DIR, collections: summary }, null, 2));
    await mongoose.disconnect();
};

run().catch(async (error) => {
    console.error(error.message || error);
    try {
        await mongoose.disconnect();
    } catch {}
    process.exit(1);
});
