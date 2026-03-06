const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");

process.env.JWT_SECRET = process.env.JWT_SECRET || "integration_test_jwt_secret_value_123456789";
process.env.USER_JWT_SECRET = process.env.USER_JWT_SECRET || "integration_test_user_jwt_secret_123456789";
process.env.USER_REFRESH_JWT_SECRET = process.env.USER_REFRESH_JWT_SECRET || "integration_test_user_refresh_secret_123456789";
process.env.USER_EMAIL_VERIFY_REQUIRED = "false";

const User = require("../../models/User");
const UserSession = require("../../models/UserSession");
const {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword
} = require("../../controllers/userAuthController");

const originalFindOne = User.findOne;
const originalCreate = User.create;
const originalUpdateMany = UserSession.updateMany;
const originalSessionCreate = UserSession.create;

const mockRes = () => {
    const state = {
        statusCode: 200,
        body: null
    };
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
    User.findOne = originalFindOne;
    User.create = originalCreate;
    UserSession.updateMany = originalUpdateMany;
    UserSession.create = originalSessionCreate;
});

test("registerUser returns duplicate error if user exists", async () => {
    User.findOne = async () => ({ _id: "existing-id" });
    const req = { body: { name: "Demo", email: "demo@example.com", password: "password123" } };
    const res = mockRes();

    await registerUser(req, res);

    assert.equal(res.state.statusCode, 400);
    assert.equal(res.state.body.message, "User already exists");
});

test("registerUser succeeds and returns token + user payload", async () => {
    User.findOne = async () => null;
    UserSession.create = async () => ({ _id: "session-1" });
    User.create = async (payload) => ({
        _id: "new-user-id",
        name: payload.name,
        email: payload.email
    });

    const req = { body: { name: "Demo", email: "demo@example.com", password: "password123" } };
    const res = mockRes();

    await registerUser(req, res);

    assert.equal(res.state.statusCode, 201);
    assert.equal(res.state.body.message, "User registered successfully");
    assert.ok(res.state.body.token);
    assert.equal(res.state.body.user.email, "demo@example.com");
});

test("loginUser fails with invalid credentials when no user is found", async () => {
    User.findOne = async () => null;
    const req = { body: { email: "missing@example.com", password: "x" } };
    const res = mockRes();

    await loginUser(req, res);

    assert.equal(res.state.statusCode, 401);
    assert.equal(res.state.body.message, "Invalid credentials");
});

test("forgotPassword returns 404 when email is not found", async () => {
    User.findOne = async () => null;
    const req = { body: { email: "missing@example.com" } };
    const res = mockRes();

    await forgotPassword(req, res);

    assert.equal(res.state.statusCode, 404);
    assert.equal(res.state.body.message, "No account found with this email");
});

test("forgotPassword returns success when email exists", async () => {
    let saveCalled = false;
    const fakeUser = {
        _id: "u1",
        email: "user@example.com",
        resetPasswordTokenHash: "",
        resetPasswordExpiresAt: null,
        save: async () => {
            saveCalled = true;
        }
    };
    User.findOne = async () => fakeUser;
    const req = { body: { email: "user@example.com" } };
    const res = mockRes();

    await forgotPassword(req, res);

    assert.equal(res.state.statusCode, 200);
    assert.equal(res.state.body.message, "Email verified");
    assert.equal(typeof res.state.body.resetToken, "string");
    assert.ok(res.state.body.resetToken.length > 0);
    assert.ok(res.state.body.expiresAt);
    assert.equal(saveCalled, true);
    assert.notEqual(fakeUser.resetPasswordTokenHash, "");
    assert.notEqual(fakeUser.resetPasswordExpiresAt, null);
});

test("resetPassword rejects mismatched passwords", async () => {
    const req = {
        body: {
            token: "valid-token",
            password: "new-pass-123",
            confirmPassword: "different-pass-123"
        }
    };
    const res = mockRes();

    await resetPassword(req, res);

    assert.equal(res.state.statusCode, 400);
    assert.equal(res.state.body.message, "Passwords do not match");
});

test("resetPassword returns error for invalid token", async () => {
    User.findOne = async () => null;
    const req = {
        body: {
            token: "invalid-token",
            password: "new-pass-123",
            confirmPassword: "new-pass-123"
        }
    };
    const res = mockRes();

    await resetPassword(req, res);

    assert.equal(res.state.statusCode, 400);
    assert.equal(res.state.body.message, "Reset token is invalid or expired");
});

test("resetPassword updates password successfully with valid token", async () => {
    let saveCalled = false;
    const token = "valid-reset-token";
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const fakeUser = {
        email: "user@example.com",
        password: "",
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
        save: async () => {
            saveCalled = true;
        }
    };
    User.findOne = async () => fakeUser;
    UserSession.updateMany = async () => ({ modifiedCount: 1 });

    const req = {
        body: {
            token,
            password: "new-pass-123",
            confirmPassword: "new-pass-123"
        }
    };
    const res = mockRes();

    await resetPassword(req, res);

    assert.equal(res.state.statusCode, 200);
    assert.equal(res.state.body.message, "Password reset successful");
    assert.equal(saveCalled, true);
    assert.notEqual(fakeUser.password, "");
    assert.equal(fakeUser.resetPasswordTokenHash, "");
    assert.equal(fakeUser.resetPasswordExpiresAt, null);
});
