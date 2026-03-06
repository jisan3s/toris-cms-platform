const AboutContent = require("../../models/AboutContent");
const { canAccess } = require("./contentUtils");

exports.getAboutContent = async (req, res) => {
    try {
        if (!canAccess(req, res, "about")) return;
        let about = await AboutContent.findOne();

        if (!about) {
            about = await AboutContent.create({});
        }

        return res.json(about);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.updateAboutContent = async (req, res) => {
    try {
        if (!canAccess(req, res, "about")) return;
        let about = await AboutContent.findOne();

        if (!about) {
            about = await AboutContent.create(req.body);
        } else {
            about = await AboutContent.findByIdAndUpdate(
                about._id,
                req.body,
                { returnDocument: "after" }
            );
        }

        return res.json({
            message: "About content updated",
            about
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
