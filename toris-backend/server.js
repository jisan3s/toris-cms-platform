require("dotenv").config();
const connectDB = require("./config/db");
const { bootstrapOwner } = require("./controllers/ownerAuthController");
const { createApp } = require("./app");
const { startEmailQueueWorker } = require("./workers/emailQueueWorker");

const { app, allowedOrigins } = createApp();

const PORT = process.env.PORT || 5001;

const startServer = async () => {
    await connectDB();
    await bootstrapOwner();

    if (allowedOrigins.size === 0) {
        console.warn("CORS_ALLOWED_ORIGINS is empty. Cross-origin browser access is blocked.");
    } else {
        console.log(`CORS allowed origins: ${Array.from(allowedOrigins).join(", ")}`);
    }

    app.listen(PORT, () =>
        console.log(`Server running on port ${PORT}`)
    );
    startEmailQueueWorker();
};

startServer().catch((error) => {
    console.error("Server startup failed:", error.message);
    process.exit(1);
});
