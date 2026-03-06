const SiteSection = require("../../models/SiteSection");
const { canAccess } = require("./contentUtils");

const HOME_SECTION_KEYS = [
    "hero",
    "clients",
    "about-preview",
    "why-choose",
    "testimonials",
    "services",
    "portfolio",
    "blog",
    "pricing",
    "cta"
];

const pickHeroPayload = (hero = {}) => ({
    title: hero.title,
    subtitle: hero.subtitle,
    description: hero.description,
    buttonText: hero.buttonText,
    buttonLink: hero.buttonLink,
    image: hero.image
});

const mergeSectionData = (base, next) => {
    const baseObj = base ?? {};
    const nextObj = next ?? {};
    return {
        ...baseObj,
        ...nextObj
    };
};

exports.getHomePageContent = async (req, res) => {
    try {
        if (!canAccess(req, res, "home")) return;
        const sections = await SiteSection.find({
            page: "home",
            section: { $in: HOME_SECTION_KEYS }
        });

        const sectionMap = {};
        sections.forEach((entry) => {
            sectionMap[entry.section] = entry.data || {};
        });

        const hero = sectionMap.hero || {};
        const pageSections = { ...sectionMap };
        delete pageSections.hero;

        return res.json({
            hero,
            sections: pageSections
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.updateHomePageContent = async (req, res) => {
    try {
        if (!canAccess(req, res, "home")) return;
        const hero = req.body?.hero;
        const sections = req.body?.sections;
        const normalizedSections = {};

        if (hero && typeof hero === "object") {
            normalizedSections.hero = pickHeroPayload(hero);
        }

        if (sections && typeof sections === "object") {
            Object.assign(normalizedSections, sections);
        }

        if (Object.keys(normalizedSections).length) {
            const submittedKeys = Object.keys(normalizedSections);
            const unsupportedKeys = submittedKeys.filter((key) => !HOME_SECTION_KEYS.includes(key));
            if (unsupportedKeys.length) {
                return res.status(400).json({ message: "Unsupported sections: " + unsupportedKeys.join(", ") });
            }

            const sectionKeys = submittedKeys.filter((key) => HOME_SECTION_KEYS.includes(key));
            const existingSections = await SiteSection.find({
                page: "home",
                section: { $in: sectionKeys }
            });
            const existingMap = existingSections.reduce((acc, entry) => {
                acc[entry.section] = entry?.data || {};
                return acc;
            }, {});
            const ops = sectionKeys.map((key) => ({
                updateOne: {
                    filter: { page: "home", section: key },
                    update: {
                        $set: {
                            data: mergeSectionData(existingMap[key], normalizedSections[key])
                        }
                    },
                    upsert: true
                }
            }));

            if (ops.length) {
                await SiteSection.bulkWrite(ops);
            }
        }

        return res.json({ message: "Homepage content updated" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.getPageSectionsPublic = async (req, res) => {
    try {
        const page = (req.params.page || "").trim().toLowerCase();
        const sections = await SiteSection.find({ page });

        const payload = sections.reduce((acc, curr) => {
            acc[curr.section] = curr.data;
            return acc;
        }, {});

        return res.json({
            page,
            sections: payload
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
