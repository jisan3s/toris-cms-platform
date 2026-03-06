const { sendErrorResponse } = require("../utils/apiErrors");

const MIN_PASSWORD_LENGTH = 8;

const isValidEmail = (value) => {
    if (typeof value !== "string") return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
};

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const sendValidationError = (res, message) => {
    return sendErrorResponse(res, 400, message);
};

const requireOwnerLoginPayload = (req, res, next) => {
    const { email, password } = req.body || {};
    if (!isValidEmail(email)) {
        return sendValidationError(res, "Valid owner email is required");
    }
    if (!isNonEmptyString(password)) {
        return sendValidationError(res, "Owner password is required");
    }
    return next();
};

const requireAdminLoginPayload = (req, res, next) => {
    const { email, password } = req.body || {};
    if (!isValidEmail(email)) {
        return sendValidationError(res, "Valid admin email is required");
    }
    if (!isNonEmptyString(password)) {
        return sendValidationError(res, "Admin password is required");
    }
    return next();
};

const requireAdminRegistrationPayload = (req, res, next) => {
    const { name, email, password } = req.body || {};
    if (!isNonEmptyString(name)) {
        return sendValidationError(res, "Admin name is required");
    }
    if (!isValidEmail(email)) {
        return sendValidationError(res, "Valid admin email is required");
    }
    if (!isNonEmptyString(password) || password.length < MIN_PASSWORD_LENGTH) {
        return sendValidationError(res, `Admin password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }
    return next();
};

module.exports = {
    requireOwnerLoginPayload,
    requireAdminLoginPayload,
    requireAdminRegistrationPayload
};
