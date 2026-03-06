const test = require("node:test");
const assert = require("node:assert/strict");

const {
    validateSiteSectionData,
    getSectionSchema,
    isPlainObject
} = require("../validators/siteSectionValidation");

test("isPlainObject detects plain objects only", () => {
    assert.equal(isPlainObject({ a: 1 }), true);
    assert.equal(isPlainObject([]), false);
    assert.equal(isPlainObject(null), false);
    assert.equal(isPlainObject("x"), false);
});

test("getSectionSchema returns schema for known page/section", () => {
    const schema = getSectionSchema("careers", "jobs");
    assert.ok(schema);
    assert.ok(Array.isArray(schema.items));
});

test("validateSiteSectionData accepts valid careers jobs payload", () => {
    const result = validateSiteSectionData("careers", "jobs", {
        items: [
            {
                title: "Frontend Developer",
                location: "Remote",
                type: "Full-time",
                applyText: "Apply Now",
                applyLink: "/careers/frontend-developer"
            }
        ]
    });

    assert.equal(result.valid, true);
    assert.deepEqual(result.errors, []);
});

test("validateSiteSectionData rejects unsupported section", () => {
    const result = validateSiteSectionData("careers", "unknown", {});
    assert.equal(result.valid, false);
    assert.match(result.errors[0], /Unsupported section/);
});

test("validateSiteSectionData rejects invalid payload type", () => {
    const result = validateSiteSectionData("careers", "jobs", null);
    assert.equal(result.valid, false);
    assert.deepEqual(result.errors, ["data must be a plain JSON object"]);
});

test("validateSiteSectionData rejects unknown keys and wrong types", () => {
    const result = validateSiteSectionData("careers", "jobs", {
        items: [
            {
                title: "Designer",
                location: "Dhaka",
                type: "Contract",
                applyText: 123,
                applyLink: "/careers/designer",
                extra: "not-allowed"
            }
        ]
    });

    assert.equal(result.valid, false);
    assert.ok(result.errors.some((item) => item.includes("data.items[0].extra is not allowed")));
    assert.ok(result.errors.some((item) => item.includes("data.items[0].applyText must be a string")));
});
