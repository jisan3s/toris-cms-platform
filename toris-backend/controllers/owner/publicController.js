const CmsContent = require("../../models/CmsContent");
const {
    toSlug,
    extractCmsPublicFields
} = require("./contentUtils");
const {
    getPageSectionsPublic
} = require("./homeController");

const parsePagination = (req) => {
    const rawLimit = Number(req.query.limit);
    const rawPage = Number(req.query.page);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 12;
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
    return { limit, page, skip: (page - 1) * limit };
};

exports.listServicesPublic = async (req, res) => {
    try {
        const { limit, page, skip } = parsePagination(req);
        const [total, services] = await Promise.all([
            CmsContent.countDocuments({ type: "services", status: "Published" }),
            CmsContent.find({
                type: "services",
                status: "Published"
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select(extractCmsPublicFields())
        ]);

        return res.json({
            items: services,
            total,
            page,
            limit
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.listPortfolioPublic = async (req, res) => {
    try {
        const { limit, page, skip } = parsePagination(req);
        const [total, portfolio] = await Promise.all([
            CmsContent.countDocuments({ type: "portfolio", status: "Published" }),
            CmsContent.find({
                type: "portfolio",
                status: "Published"
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select(extractCmsPublicFields())
        ]);

        return res.json({ items: portfolio, total, page, limit });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.getPortfolioDetailsPublic = async (req, res) => {
    try {
        const slug = toSlug(req.params.slug || "");
        if (!slug) {
            return res.status(400).json({ message: "Invalid portfolio slug" });
        }

        const item = await CmsContent.findOne({
            type: "portfolio",
            slug,
            status: "Published"
        })
            .select(extractCmsPublicFields());

        if (!item) {
            return res.status(404).json({ message: "Portfolio item not found" });
        }

        return res.json({ item });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.listBlogsPublic = async (req, res) => {
    try {
        const { limit, page, skip } = parsePagination(req);
        const [total, blogs] = await Promise.all([
            CmsContent.countDocuments({ type: "blog", status: "Published" }),
            CmsContent.find({
                type: "blog",
                status: "Published"
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select(extractCmsPublicFields())
        ]);

        return res.json({ items: blogs, total, page, limit });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.getBlogDetailsPublic = async (req, res) => {
    try {
        const slug = toSlug(req.params.slug || "");
        if (!slug) {
            return res.status(400).json({ message: "Invalid blog slug" });
        }

        const blog = await CmsContent.findOne({
            type: "blog",
            slug,
            status: "Published"
        })
            .select(extractCmsPublicFields());

        if (!blog) {
            return res.status(404).json({ message: "Blog post not found" });
        }

        return res.json({ item: blog });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.getServiceDetailsPublic = async (req, res) => {
    try {
        const slug = toSlug(req.params.slug || "");
        if (!slug) {
            return res.status(400).json({ message: "Invalid service slug" });
        }

        const service = await CmsContent.findOne({
            type: "services",
            slug,
            status: "Published"
        })
            .select(extractCmsPublicFields());

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        return res.json({
            item: service
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.getPageSectionsPublic = getPageSectionsPublic;
