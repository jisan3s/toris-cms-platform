const express = require("express");
const router = express.Router();
const cmsProtect = require("../middleware/cmsAuthMiddleware");
const {
    getAboutContent,
    updateAboutContent
} = require("../controllers/owner/aboutController");
const {
    getHomePageContent,
    updateHomePageContent
} = require("../controllers/owner/homeController");
const {
    listCmsContent,
    createCmsContent,
    updateCmsContent,
    deleteCmsContent,
    checkCmsSlug
} = require("../controllers/owner/cmsController");
const {
    listSiteSections,
    upsertSiteSection
} = require("../controllers/owner/siteSectionController");
const { getMediaConfig, uploadMedia } = require("../controllers/mediaController");

router.use(cmsProtect);

router.get("/about", getAboutContent);
router.put("/about", updateAboutContent);
router.get("/home", getHomePageContent);
router.put("/home", updateHomePageContent);
router.get("/sections", listSiteSections);
router.put("/sections/:page/:section", upsertSiteSection);
router.get("/media/config", getMediaConfig);
router.post("/media/upload", express.json({ limit: "20mb" }), uploadMedia);

router.get("/:type/slug/:slug", checkCmsSlug);
router.get("/:type", listCmsContent);
router.post("/:type", createCmsContent);
router.put("/:type/:id", updateCmsContent);
router.delete("/:type/:id", deleteCmsContent);

module.exports = router;
