require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const SiteSection = require("../models/SiteSection");
const CmsContent = require("../models/CmsContent");
const AboutContent = require("../models/AboutContent");

const run = async () => {
    await connectDB();

    const [sectionsResult, cmsResult, aboutResult] = await Promise.all([
        SiteSection.deleteMany({}),
        CmsContent.deleteMany({}),
        AboutContent.deleteMany({})
    ]);

    console.log("Dashboard-managed content cleared.");
    console.log({
        siteSectionsDeleted: sectionsResult.deletedCount || 0,
        cmsItemsDeleted: cmsResult.deletedCount || 0,
        aboutDocumentsDeleted: aboutResult.deletedCount || 0
    });
};

run()
    .catch((error) => {
        console.error("Failed to clear dashboard content:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.connection.close();
    });
