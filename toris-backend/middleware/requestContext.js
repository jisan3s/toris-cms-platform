const crypto = require("crypto");

const withRequestContext = (req, res, next) => {
    const requestId = req.headers["x-request-id"] || crypto.randomUUID();
    req.requestId = String(requestId);
    res.setHeader("x-request-id", req.requestId);
    const start = Date.now();

    res.on("finish", () => {
        const durationMs = Date.now() - start;
        const log = {
            level: "info",
            requestId: req.requestId,
            method: req.method,
            path: req.originalUrl || req.url,
            statusCode: res.statusCode,
            durationMs,
            ip: req.ip
        };
        console.log(JSON.stringify(log));
    });

    next();
};

module.exports = withRequestContext;
