const test = require("node:test");
const assert = require("node:assert/strict");

const {
    validateType,
    toSlug,
    normalizeServiceFeatures,
    hasPermission,
    canAccess
} = require("../controllers/owner/contentUtils");

test("validateType allows known CMS item types", () => {
    assert.equal(validateType("blog"), true);
    assert.equal(validateType("services"), true);
    assert.equal(validateType("portfolio"), true);
    assert.equal(validateType("unknown"), false);
});

test("toSlug normalizes mixed content to URL slug", () => {
    assert.equal(toSlug("  Build Digital Momentum  "), "build-digital-momentum");
    assert.equal(toSlug("UI/UX & SEO"), "ui-ux-seo");
    assert.equal(toSlug(""), "");
});

test("normalizeServiceFeatures supports array and newline text", () => {
    assert.deepEqual(normalizeServiceFeatures([" A ", "", "B"]), ["A", "B"]);
    assert.deepEqual(normalizeServiceFeatures("A\n\n B \nC"), ["A", "B", "C"]);
});

test("hasPermission allows owner/admin and rejects others", () => {
    assert.equal(hasPermission({ role: "owner" }, "about"), true);
    assert.equal(hasPermission({ role: "admin" }, "about"), true);
    assert.equal(hasPermission({ role: "user" }, "about"), false);
    assert.equal(hasPermission(null, "about"), false);
});

test("canAccess returns false and responds 403 when user is unauthorized", () => {
    const calls = { status: 0, body: null };
    const res = {
        status(code) {
            calls.status = code;
            return this;
        },
        json(payload) {
            calls.body = payload;
            return this;
        }
    };

    const ok = canAccess({ cmsUser: { role: "user" } }, res, "about");
    assert.equal(ok, false);
    assert.equal(calls.status, 403);
    assert.equal(calls.body.message, "Access denied for about content");
});
