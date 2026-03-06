const express = require("express");
const router = express.Router();
const {
    getPageSectionsPublic,
    listServicesPublic,
    getServiceDetailsPublic,
    listBlogsPublic,
    getBlogDetailsPublic,
    listPortfolioPublic,
    getPortfolioDetailsPublic
} = require("../controllers/owner/publicController");
const { submitContact } = require("../controllers/contactController");

router.get("/page/:page", getPageSectionsPublic);
router.get("/blog", listBlogsPublic);
router.get("/blog/:slug", getBlogDetailsPublic);
router.get("/services", listServicesPublic);
router.get("/services/:slug", getServiceDetailsPublic);
router.get("/portfolio", listPortfolioPublic);
router.get("/portfolio/:slug", getPortfolioDetailsPublic);
router.post("/contact/submit", submitContact);
router.get("/:page", getPageSectionsPublic);

module.exports = router;
