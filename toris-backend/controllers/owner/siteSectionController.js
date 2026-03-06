const SiteSection = require("../../models/SiteSection");
const {
    canAccess,
    pagePermissionMap,
    hasPermission,
    validateSiteSectionData,
    isPlainObject
} = require("./contentUtils");

exports.listSiteSections = async (req, res) => {
    try {
        const page = (req.query.page || "").trim().toLowerCase();
        if (page) {
            const permission = pagePermissionMap[page];
            if (!permission) {
                return res.status(400).json({ message: "Invalid page" });
            }
            if (!canAccess(req, res, permission)) return;
        }
        const filter = {};

        if (page) {
            filter.page = page;
        } else if (req.cmsUser?.role === "admin") {
            const allowedPages = Object.keys(pagePermissionMap).filter((pageKey) => {
                const permission = pagePermissionMap[pageKey];
                return hasPermission(req.cmsUser, permission);
            });
            filter.page = { $in: allowedPages };
        }
        const sections = await SiteSection.find(filter).sort({ page: 1, section: 1 });
        return res.json(sections);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.upsertSiteSection = async (req, res) => {
    try {
        const page = (req.params.page || "").trim().toLowerCase();
        const section = (req.params.section || "").trim().toLowerCase();
        const data = req.body?.data;

        if (!page || !section) {
            return res.status(400).json({ message: "Page and section are required" });
        }

        const permission = pagePermissionMap[page];
        if (!permission) {
            return res.status(400).json({ message: "Invalid page" });
        }
        if (!canAccess(req, res, permission)) return;

        if (!isPlainObject(data)) {
            return res.status(400).json({ message: "Data must be a JSON object" });
        }

        const validation = validateSiteSectionData(page, section, data);
        if (!validation.valid) {
            return res.status(400).json({
                message: "Invalid section data",
                errors: validation.errors
            });
        }

        const item = await SiteSection.findOneAndUpdate(
            { page, section },
            { data },
            { upsert: true, returnDocument: "after", runValidators: true }
        );

        return res.json({
            message: "Section content saved",
            item
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
