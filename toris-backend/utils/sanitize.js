const sanitizeText = (value, { max = 5000, allowNewlines = true } = {}) => {
    const raw = String(value ?? "");
    const normalized = allowNewlines
        ? raw.replace(/\r\n/g, "\n")
        : raw.replace(/\s+/g, " ");
    const stripped = Array.from(normalized)
        .filter((ch) => {
            const code = ch.charCodeAt(0);
            return !(code <= 31 || code === 127);
        })
        .join("")
        .trim();
    return stripped.slice(0, max);
};

const sanitizeEmail = (value) => sanitizeText(value, { max: 320, allowNewlines: false }).toLowerCase();

module.exports = {
    sanitizeText,
    sanitizeEmail
};
