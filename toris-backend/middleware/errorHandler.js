const { sendErrorResponse } = require("../utils/apiErrors");
const { sendTrackedError } = require("../utils/errorTracker");

const errorHandler = (err, req, res, next) => {
    const log = {
        level: "error",
        requestId: req?.requestId || "",
        message: String(err?.message || "Unhandled error"),
        stack: String(err?.stack || ""),
        path: req?.originalUrl || req?.url || "",
        method: req?.method || ""
    };
    console.error(JSON.stringify(log));
    sendTrackedError(log);

    if (res.headersSent) {
        return next(err);
    }
    const status = err?.status || 500;
    const message = err?.publicMessage || "Internal server error";
    return sendErrorResponse(res, status, message, err, "GlobalErrorHandler");
};

module.exports = errorHandler;
