const https = require("https");
const http = require("http");

const sendTrackedError = (payload) => {
    const webhook = String(process.env.ERROR_TRACKER_WEBHOOK || "").trim();
    if (!webhook) return;

    try {
        const url = new URL(webhook);
        const body = JSON.stringify(payload);
        const client = url.protocol === "https:" ? https : http;
        const req = client.request(
            {
                method: "POST",
                hostname: url.hostname,
                port: url.port || (url.protocol === "https:" ? 443 : 80),
                path: `${url.pathname}${url.search}`,
                headers: {
                    "content-type": "application/json",
                    "content-length": Buffer.byteLength(body)
                }
            },
            () => {}
        );
        req.on("error", () => {});
        req.write(body);
        req.end();
    } catch {
        // intentionally swallow tracking errors
    }
};

module.exports = {
    sendTrackedError
};
