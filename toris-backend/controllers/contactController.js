const ContactSubmission = require("../models/ContactSubmission");
const EmailJob = require("../models/EmailJob");
const { sanitizeText, sanitizeEmail } = require("../utils/sanitize");

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");

exports.submitContact = async (req, res) => {
    try {
        const name = sanitizeText(req.body?.name, { max: 120, allowNewlines: false });
        const email = sanitizeEmail(req.body?.email);
        const subject = sanitizeText(req.body?.subject, { max: 200, allowNewlines: false });
        const message = sanitizeText(req.body?.message, { max: 5000, allowNewlines: true });

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: "Name, email, subject, and message are required" });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "Please provide a valid email address" });
        }

        const submission = await ContactSubmission.create({
            name,
            email,
            subject,
            message,
            ipAddress: String(req.ip || ""),
            userAgent: String(req.headers["user-agent"] || "")
        });

        await EmailJob.create({
            type: "contact_notification",
            payload: {
                submissionId: String(submission._id),
                name,
                email,
                subject,
                message
            },
            status: "pending",
            attempts: 0,
            maxAttempts: Math.max(1, Number.parseInt(process.env.EMAIL_WORKER_MAX_ATTEMPTS || "5", 10) || 5),
            nextAttemptAt: new Date()
        });

        return res.status(201).json({
            message: "Message submitted successfully",
            submissionId: submission._id
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Failed to submit contact form" });
    }
};
