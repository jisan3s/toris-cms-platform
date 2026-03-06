const mongoose = require("mongoose");

const aboutContentSchema = new mongoose.Schema(
    {
        heading: {
            type: String,
            required: true,
            default: ""
        },
        subheading: {
            type: String,
            default: ""
        },
        body: {
            type: String,
            required: true,
            default: ""
        },
        image: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("AboutContent", aboutContentSchema);
