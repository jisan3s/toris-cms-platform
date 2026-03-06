const mongoose = require("mongoose");
const { isPlainObject } = require("../validators/siteSectionValidation");

const siteSectionSchema = new mongoose.Schema(
    {
        page: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        section: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        data: {
            type: mongoose.Schema.Types.Mixed,
            validate: {
                validator: (value) => isPlainObject(value),
                message: "SiteSection.data must be a plain JSON object"
            },
            default: {}
        }
    },
    { timestamps: true }
);

siteSectionSchema.index({ page: 1, section: 1 }, { unique: true });

module.exports = mongoose.model("SiteSection", siteSectionSchema);
