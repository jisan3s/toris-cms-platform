const test = require("node:test");
const assert = require("node:assert/strict");

const ContactSubmission = require("../../models/ContactSubmission");
const EmailJob = require("../../models/EmailJob");
const { submitContact } = require("../../controllers/contactController");

const originalContactCreate = ContactSubmission.create;
const originalEmailJobCreate = EmailJob.create;

const mockRes = () => {
    const state = { statusCode: 200, body: null };
    return {
        state,
        status(code) {
            state.statusCode = code;
            return this;
        },
        json(payload) {
            state.body = payload;
            return this;
        }
    };
};

test.afterEach(() => {
    ContactSubmission.create = originalContactCreate;
    EmailJob.create = originalEmailJobCreate;
});

test("submitContact rejects invalid email", async () => {
    const req = {
        ip: "127.0.0.1",
        headers: {},
        body: {
            name: "John",
            email: "bad-email",
            subject: "Need Help",
            message: "Hello"
        }
    };
    const res = mockRes();
    await submitContact(req, res);
    assert.equal(res.state.statusCode, 400);
});

test("submitContact stores submission and creates email job", async () => {
    let createdSubmissionPayload = null;
    let createdJobPayload = null;
    ContactSubmission.create = async (payload) => {
        createdSubmissionPayload = payload;
        return { _id: "submission-id-1", ...payload };
    };
    EmailJob.create = async (payload) => {
        createdJobPayload = payload;
        return { _id: "job-id-1", ...payload };
    };

    const req = {
        ip: "127.0.0.1",
        headers: { "user-agent": "node-test" },
        body: {
            name: "Jane Doe",
            email: "jane@example.com",
            subject: "Project Inquiry",
            message: "Need your service."
        }
    };
    const res = mockRes();
    await submitContact(req, res);

    assert.equal(res.state.statusCode, 201);
    assert.equal(res.state.body.message, "Message submitted successfully");
    assert.ok(createdSubmissionPayload);
    assert.ok(createdJobPayload);
    assert.equal(createdJobPayload.type, "contact_notification");
});
