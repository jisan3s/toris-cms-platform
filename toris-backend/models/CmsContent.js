const mongoose = require("mongoose");

const cmsContentSchema = new mongoose.Schema(
    {
        type: {
            type: String,
        enum: ["blog", "services", "projects", "portfolio"],
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        summary: {
            type: String,
            required: true
        },
        slug: {
            type: String,
            trim: true,
            lowercase: true
        },
        icon: {
            type: String,
            default: ""
        },
        image: {
            type: String,
            default: ""
        },
        detailTitle: {
            type: String,
            default: ""
        },
        detailDescription: {
            type: String,
            default: ""
        },
        features: {
            type: [String],
            default: []
        },
        buttonText: {
            type: String,
            trim: true,
            default: ""
        },
        buttonLink: {
            type: String,
            trim: true,
            default: ""
        },
        order: {
            type: Number,
            default: 0
        },
        category: {
            type: String,
            trim: true,
            default: ""
        },
        status: {
            type: String,
            enum: ["Draft", "Published"],
            default: "Draft"
        }
    },
    { timestamps: true }
);

cmsContentSchema.index({ type: 1, slug: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("CmsContent", cmsContentSchema);
