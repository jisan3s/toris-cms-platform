const CmsContent = require("../../models/CmsContent");
const { canAccess, validateType, toSlug, normalizeServiceFeatures } = require("./contentUtils");

const normalizeCmsPayload = (type, body = {}) => {
    const payload = {
        title: String(body.title || "").trim(),
        summary: String(body.summary || "").trim(),
        status: body.status === "Published" ? "Published" : "Draft"
    };

    const rawOrder = Number(body.order);
    payload.order = Number.isFinite(rawOrder) ? rawOrder : 0;

    if (type !== "services") {
        if (type === "blog" || type === "portfolio") {
            payload.slug = toSlug(body.slug || payload.title);
            payload.category = String(body.category || "Blog").trim();
            payload.icon = String(body.icon || "").trim();
            payload.image = String(body.image || "").trim();
            payload.detailTitle = String(body.detailTitle || payload.title).trim();
            payload.detailDescription = String(body.detailDescription || "").trim();
        }

        return payload;
    }

    payload.slug = toSlug(body.slug || payload.title);
    payload.icon = String(body.icon || "").trim();
    payload.image = String(body.image || "").trim();
    payload.detailDescription = String(body.detailDescription || "").trim();
    payload.features = normalizeServiceFeatures(body.features);
    payload.buttonText = String(body.buttonText || "").trim();
    payload.buttonLink = String(body.buttonLink || "").trim();

    return payload;
};

const parsePagination = (req) => {
    const rawLimit = Number(req.query.limit);
    const rawPage = Number(req.query.page);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 20;
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
    return { limit, page, skip: (page - 1) * limit };
};

exports.listCmsContent = async (req, res) => {
    try {
        const { type } = req.params;
        if (!validateType(type)) {
            return res.status(400).json({ message: "Invalid CMS type" });
        }
        if (!canAccess(req, res, type.toLowerCase())) return;

        const { limit, page, skip } = parsePagination(req);
        const [total, items] = await Promise.all([
            CmsContent.countDocuments({ type }),
            CmsContent.find({ type })
                .sort({ order: 1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
        ]);

        return res.json({
            items,
            total,
            page,
            limit
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.checkCmsSlug = async (req, res) => {
    try {
        const { type, slug } = req.params;
        if (!validateType(type)) {
            return res.status(400).json({ message: "Invalid CMS type" });
        }
        const normalizedSlug = toSlug(slug);
        if (!normalizedSlug) {
            return res.json({ exists: false });
        }

        const existing = await CmsContent.findOne({ type, slug: normalizedSlug }).select("_id");
        return res.json({
            exists: !!existing,
            id: existing?._id
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.createCmsContent = async (req, res) => {
    try {
        const { type } = req.params;
        if (!validateType(type)) {
            return res.status(400).json({ message: "Invalid CMS type" });
        }
        if (!canAccess(req, res, type.toLowerCase())) return;

        const payload = normalizeCmsPayload(type, req.body || {});
        if (!payload.title || !payload.summary) {
            return res.status(400).json({ message: "Title and summary are required" });
        }
        if ((type === "services" || type === "blog" || type === "portfolio") && !payload.slug) {
            return res.status(400).json({ message: "Slug is required for services" });
        }

        const item = await CmsContent.create({ type, ...payload });

        return res.status(201).json({
            message: "CMS content created",
            item
        });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(400).json({ message: "Slug already exists for services" });
        }
        return res.status(500).json({ message: error.message });
    }
};

exports.updateCmsContent = async (req, res) => {
    try {
        const { type, id } = req.params;
        if (!validateType(type)) {
            return res.status(400).json({ message: "Invalid CMS type" });
        }
        if (!canAccess(req, res, type.toLowerCase())) return;

        const payload = normalizeCmsPayload(type, req.body || {});
        if (!payload.title || !payload.summary) {
            return res.status(400).json({ message: "Title and summary are required" });
        }
        if ((type === "services" || type === "blog" || type === "portfolio") && !payload.slug) {
            return res.status(400).json({ message: "Slug is required for services" });
        }

        const item = await CmsContent.findOneAndUpdate(
            { _id: id, type },
            payload,
            { returnDocument: "after", runValidators: true }
        );

        if (!item) {
            return res.status(404).json({ message: "Content item not found" });
        }

        return res.json({
            message: "CMS content updated",
            item
        });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(400).json({ message: "Slug already exists for services" });
        }
        return res.status(500).json({ message: error.message });
    }
};

exports.deleteCmsContent = async (req, res) => {
    try {
        const { type, id } = req.params;
        if (!validateType(type)) {
            return res.status(400).json({ message: "Invalid CMS type" });
        }
        if (!canAccess(req, res, type.toLowerCase())) return;

        const item = await CmsContent.findOneAndDelete({ _id: id, type });
        if (!item) {
            return res.status(404).json({ message: "Content item not found" });
        }

        return res.json({ message: "CMS content deleted" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
