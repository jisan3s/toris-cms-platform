const normalize = (value) => (value || "").toString().trim().toLowerCase();

const ownerEmail = normalize(process.env.OWNER_EMAIL);
const ownerPassword = process.env.OWNER_PASSWORD || "";
const ownerName = process.env.OWNER_NAME || "Owner";

const allowedAdminEmails = (process.env.ALLOWED_ADMIN_EMAILS || "")
    .split(",")
    .map(normalize)
    .filter(Boolean);

const isAdminEmailAllowed = (email) => {
    if (!email) return false;
    if (!allowedAdminEmails.length) return true;
    return allowedAdminEmails.includes(normalize(email));
};

module.exports = {
    ownerEmail,
    ownerPassword,
    ownerName,
    allowedAdminEmails,
    normalize,
    isAdminEmailAllowed
};
