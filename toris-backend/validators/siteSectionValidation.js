const isPlainObject = (value) => {
    return Object.prototype.toString.call(value) === "[object Object]";
};

const sectionSchemas = {
    home: {
        hero: {
            title: "string",
            subtitle: "string",
            description: "string",
            buttonText: "string",
            buttonLink: "string",
            image: "string"
        },
        clients: {
            title: "string",
            logos: ["string"]
        },
        "about-preview": {
            heading: "string",
            description: "string",
            buttonText: "string",
            image: "string"
        },
        "why-choose": {
            subtitle: "string",
            yearsExperience: "string",
            yearsExperienceLabel: "string",
            projectsCompleted: "string",
            projectsCompletedLabel: "string",
            clientSatisfaction: "string",
            clientSatisfactionLabel: "string"
        },
        testimonials: {
            heading: "string",
            items: [{
                name: "string",
                position: "string",
                message: "string",
                photo: "string"
            }]
        },
        pricing: {
            heading: "string",
            buttonText: "string",
            buttonLink: "string",
            plans: [{
                name: "string",
                price: "string",
                features: ["string"],
                buttonText: "string",
                buttonLink: "string"
            }]
        },
        services: {
            heading: "string",
            subtitle: "string",
            cardButtonText: "string",
            sectionButtonText: "string"
        },
        portfolio: {
            heading: "string",
            sectionButtonText: "string"
        },
        blog: {
            heading: "string",
            cardButtonText: "string"
        },
        cta: {
            title: "string",
            buttonText: "string",
            buttonLink: "string"
        }
    },
    about: {
        banner: { title: "string", subtitle: "string" },
        overview: { image: "string", title: "string", description1: "string", description2: "string" },
        "mission-vision": { missionTitle: "string", missionText: "string", visionTitle: "string", visionText: "string" },
        "why-choose": { title: "string", cardText: "string", items: ["string"] },
        stats: { items: [{ title: "string", label: "string" }] },
        "team-preview": { title: "string", items: [{ name: "string", position: "string", image: "string" }] },
        cta: { title: "string", buttonText: "string", buttonLink: "string" }
    },
    contact: {
        banner: { title: "string", subtitle: "string" },
        info: {
            addressTitle: "string",
            address: "string",
            emailTitle: "string",
            email: "string",
            phoneTitle: "string",
            phone: "string"
        },
        cta: { title: "string", buttonText: "string", buttonLink: "string" }
    },
    faq: {
        banner: { title: "string", subtitle: "string" },
        faqs: { items: [{ question: "string", answer: "string" }] },
        cta: { title: "string", subtitle: "string", buttonText: "string", buttonLink: "string" }
    },
    pricing: {
        banner: { title: "string", subtitle: "string" },
        plans: { items: [{ name: "string", price: "string", features: ["string"], buttonText: "string", buttonLink: "string" }] },
        cta: { title: "string", buttonText: "string", buttonLink: "string" }
    },
    testimonials: {
        banner: { title: "string", subtitle: "string" },
        items: { items: [{ name: "string", position: "string", photo: "string", message: "string" }] },
        cta: { title: "string", subtitle: "string", buttonText: "string", buttonLink: "string" }
    },
    blog: {
        "page-banner": { title: "string", subtitle: "string" },
        cta: { title: "string", subtitle: "string", buttonText: "string", buttonLink: "string" }
    },
    "blog-details": {
        media: { detailFallbackImage: "string" },
        empty: { message: "string" }
    },
    portfolio: {
        hero: { title: "string", subtitle: "string" }
    },
    "portfolio-details": {
        media: { detailFallbackImage: "string" },
        empty: { message: "string" }
    },
    team: {
        banner: { title: "string", subtitle: "string" },
        members: { items: [{ name: "string", role: "string", image: "string" }] },
        cta: { title: "string", subtitle: "string", buttonText: "string", buttonLink: "string" }
    },
    careers: {
        banner: { title: "string", subtitle: "string" },
        jobs: {
            items: [{ title: "string", location: "string", type: "string", applyText: "string", applyLink: "string" }]
        }
    },
    services: {
        banner: { title: "string", subtitle: "string" }
    },
    "service-details": {
        features: { title: "string", itemDescription: "string" },
        media: { detailFallbackImage: "string" },
        cta: { title: "string", buttonText: "string", buttonLink: "string" }
    },
    terms: {
        banner: { title: "string" },
        content: { body: "string" }
    },
    privacy: {
        banner: { title: "string" },
        content: { body: "string" }
    },
    global: {
        header: { brand: "string", logo: "string", backgroundImage: "string", items: [{ label: "string", path: "string" }] },
        footer: {
            title: "string",
            subtitle: "string",
            logo: "string",
            backgroundImage: "string",
            links: [{ label: "string", path: "string" }],
            copyright: "string"
        }
    }
};

const getSectionSchema = (page, section) => {
    return sectionSchemas?.[page]?.[section] || null;
};

const validateAgainstSchema = (value, schema, path, errors) => {
    if (schema === "string") {
        if (typeof value !== "string") {
            errors.push(`${path} must be a string`);
        }
        return;
    }

    if (Array.isArray(schema)) {
        if (!Array.isArray(value)) {
            errors.push(`${path} must be an array`);
            return;
        }
        const itemSchema = schema[0];
        value.forEach((item, index) => {
            validateAgainstSchema(item, itemSchema, `${path}[${index}]`, errors);
        });
        return;
    }

    if (!isPlainObject(schema)) {
        errors.push(`${path} has invalid schema configuration`);
        return;
    }

    if (!isPlainObject(value)) {
        errors.push(`${path} must be an object`);
        return;
    }

    const unknownKeys = Object.keys(value).filter((key) => !(key in schema));
    unknownKeys.forEach((key) => {
        errors.push(`${path}.${key} is not allowed`);
    });

    Object.keys(value).forEach((key) => {
        if (!(key in schema)) {
            return;
        }
        const nestedValue = value[key];
        if (nestedValue === undefined) {
            return;
        }
        validateAgainstSchema(nestedValue, schema[key], `${path}.${key}`, errors);
    });
};

const validateSiteSectionData = (page, section, data) => {
    if (!isPlainObject(data)) {
        return {
            valid: false,
            errors: ["data must be a plain JSON object"]
        };
    }

    const schema = getSectionSchema(page, section);
    if (!schema) {
        return {
            valid: false,
            errors: [`Unsupported section "${page}.${section}"`]
        };
    }

    const errors = [];
    validateAgainstSchema(data, schema, "data", errors);

    return {
        valid: errors.length === 0,
        errors
    };
};

module.exports = {
    isPlainObject,
    getSectionSchema,
    validateSiteSectionData
};
