const EmailJob = require("../models/EmailJob");
const { sendEmail } = require("../utils/mailer");

const backoffSeconds = [30, 60, 120, 300, 600];

const buildMessageFromJob = (job) => {
    const payload = job.payload || {};
    if (job.type === "contact_notification") {
        const safeName = String(payload.name || "Unknown");
        const safeEmail = String(payload.email || "unknown@example.com");
        const safeSubject = String(payload.subject || "No subject");
        const safeMessage = String(payload.message || "");
        return {
            to: payload.to || "",
            replyTo: safeEmail,
            subject: `New Contact Message: ${safeSubject}`,
            text: [
                `Name: ${safeName}`,
                `Email: ${safeEmail}`,
                `Subject: ${safeSubject}`,
                "",
                "Message:",
                safeMessage
            ].join("\n")
        };
    }

    if (job.type === "verify_email") {
        const verificationLink = String(payload.verificationLink || "");
        return {
            to: String(payload.to || ""),
            subject: "Verify your email address",
            text: [
                "Please verify your email by opening the link below:",
                verificationLink
            ].join("\n\n")
        };
    }

    throw new Error(`Unsupported email job type: ${job.type}`);
};

const processOneJob = async () => {
    const now = new Date();
    const job = await EmailJob.findOneAndUpdate(
        {
            status: { $in: ["pending", "failed"] },
            nextAttemptAt: { $lte: now }
        },
        {
            status: "processing"
        },
        {
            sort: { createdAt: 1 },
            returnDocument: "after"
        }
    );

    if (!job) return false;

    try {
        const message = buildMessageFromJob(job);
        await sendEmail(message);
        job.status = "sent";
        job.sentAt = new Date();
        job.lastError = "";
    } catch (error) {
        job.attempts += 1;
        job.lastError = String(error?.message || "Unknown email job error");
        if (job.attempts >= job.maxAttempts) {
            job.status = "dead_letter";
        } else {
            const backoffIndex = Math.min(job.attempts - 1, backoffSeconds.length - 1);
            const seconds = backoffSeconds[backoffIndex];
            job.status = "failed";
            job.nextAttemptAt = new Date(Date.now() + seconds * 1000);
        }
    }

    await job.save();
    return true;
};

const startEmailQueueWorker = () => {
    const disabled = String(process.env.DISABLE_EMAIL_WORKER || "").toLowerCase() === "true";
    if (disabled) return null;
    const pollMs = Math.max(1000, Number.parseInt(process.env.EMAIL_WORKER_POLL_MS || "5000", 10) || 5000);

    const timer = setInterval(() => {
        processOneJob().catch((error) => {
            console.error(JSON.stringify({
                level: "error",
                component: "emailQueueWorker",
                message: String(error?.message || error)
            }));
        });
    }, pollMs);

    return timer;
};

module.exports = {
    startEmailQueueWorker,
    processOneJob
};
