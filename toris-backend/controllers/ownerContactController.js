const ContactSubmission = require("../models/ContactSubmission");
const EmailJob = require("../models/EmailJob");
const { sanitizeText } = require("../utils/sanitize");

const parsePagination = (req) => {
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit || "20", 10) || 20));
    const page = Math.max(1, Number.parseInt(req.query.page || "1", 10) || 1);
    return { limit, page, skip: (page - 1) * limit };
};

exports.listContactSubmissions = async (req, res) => {
    try {
        const { limit, page, skip } = parsePagination(req);
        const q = sanitizeText(req.query.q || "", { max: 100, allowNewlines: false }).toLowerCase();
        const status = sanitizeText(req.query.status || "", { max: 20, allowNewlines: false });
        const filter = {};

        if (status && ["new", "read", "archived"].includes(status)) {
            filter.status = status;
        }
        if (q) {
            filter.$or = [
                { name: { $regex: q, $options: "i" } },
                { email: { $regex: q, $options: "i" } },
                { subject: { $regex: q, $options: "i" } }
            ];
        }

        const [total, items] = await Promise.all([
            ContactSubmission.countDocuments(filter),
            ContactSubmission.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
        ]);

        return res.json({ items, total, page, limit });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.updateContactSubmissionStatus = async (req, res) => {
    try {
        const id = sanitizeText(req.params.id, { max: 100, allowNewlines: false });
        const status = sanitizeText(req.body?.status, { max: 20, allowNewlines: false });
        if (!["new", "read", "archived"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const updated = await ContactSubmission.findByIdAndUpdate(
            id,
            { status },
            { returnDocument: "after" }
        );
        if (!updated) {
            return res.status(404).json({ message: "Contact submission not found" });
        }
        return res.json({ message: "Submission status updated", item: updated });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.listEmailDeadLetters = async (req, res) => {
    try {
        const items = await EmailJob.find({ status: "dead_letter" }).sort({ updatedAt: -1 }).limit(100);
        return res.json({ items });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
