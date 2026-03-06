const test = require("node:test");
const assert = require("node:assert/strict");

const loadApiErrors = (env) => {
    const filePath = require.resolve("../utils/apiErrors");
    delete require.cache[filePath];
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = env;
    const mod = require("../utils/apiErrors");
    process.env.NODE_ENV = previous;
    return mod;
};

test("sendErrorResponse returns safe production message", () => {
    const { sendErrorResponse } = loadApiErrors("production");
    const res = {
        statusCode: 0,
        payload: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.payload = body;
            return this;
        }
    };

    sendErrorResponse(res, 500, "Internal server error", new Error("database failed"));
    assert.equal(res.statusCode, 500);
    assert.equal(res.payload.message, "Internal server error");
});

test("sendErrorResponse returns detailed message outside production", () => {
    const { sendErrorResponse } = loadApiErrors("development");
    const res = {
        statusCode: 0,
        payload: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.payload = body;
            return this;
        }
    };

    sendErrorResponse(res, 400, "Bad request", new Error("validation failed"));
    assert.equal(res.statusCode, 400);
    assert.equal(res.payload.message, "validation failed");
});
