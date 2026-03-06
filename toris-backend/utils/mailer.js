const nodemailer = require("nodemailer");

const getGmailConfig = () => {
    const user = String(process.env.GMAIL_USER || "").trim();
    const appPassword = String(process.env.GMAIL_APP_PASSWORD || "").trim();
    const from = String(process.env.CONTACT_FROM_EMAIL || user || "").trim();
    const to = String(process.env.CONTACT_NOTIFY_TO || process.env.OWNER_EMAIL || "").trim();
    const hasRequired = Boolean(user && appPassword && from && to);

    return { hasRequired, user, appPassword, from, to };
};

const sendEmail = async ({ to, replyTo, subject, text }) => {
    const gmail = getGmailConfig();
    if (!gmail.hasRequired) {
        throw new Error("Gmail SMTP not configured. Set GMAIL_USER, GMAIL_APP_PASSWORD, CONTACT_NOTIFY_TO.");
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: gmail.user,
            pass: gmail.appPassword
        }
    });

    await transporter.sendMail({
        from: gmail.from,
        to: to || gmail.to,
        replyTo: replyTo || undefined,
        subject,
        text
    });
};

module.exports = {
    getGmailConfig,
    sendEmail
};
