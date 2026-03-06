const { validateSiteSectionData, isPlainObject } = require("../../validators/siteSectionValidation");

const allowedTypes = new Set(["blog", "services", "projects", "portfolio"]);

const validateType = (type) => allowedTypes.has((type || "").toLowerCase());

const toSlug = (value = "") => String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeServiceFeatures = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item || "").trim()).filter(Boolean);
    }
    return String(value || "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
};

const pagePermissionMap = {
    home: "home",
    about: "about",
    contact: "about",
    faq: "about",
    pricing: "about",
    testimonials: "about",
    team: "about",
    careers: "about",
    terms: "about",
    privacy: "about",
    global: "about",
    blog: "blog",
    "blog-details": "blog",
    services: "services",
    "service-details": "services",
    projects: "projects",
    portfolio: "projects",
    "portfolio-details": "projects"
};

const hasPermission = (user, permission) => {
    if (!user) return false;
    return user.role === "owner" || user.role === "admin";
};

const canAccess = (req, res, permission) => {
    if (hasPermission(req.cmsUser, permission)) {
        return true;
    }

    res.status(403).json({ message: `Access denied for ${permission} content` });
    return false;
};

const extractCmsPublicFields = () => "title summary slug icon image detailTitle detailDescription features buttonText buttonLink updatedAt category";

module.exports = {
    validateType,
    toSlug,
    normalizeServiceFeatures,
    pagePermissionMap,
    hasPermission,
    canAccess,
    extractCmsPublicFields,
    isPlainObject,
    validateSiteSectionData
};
