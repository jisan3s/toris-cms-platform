const isProduction = process.env.NODE_ENV === "production";

const logError = (error, context) => {
    if (!error) return;
    const prefix = context ? `[${context}]` : "[API ERROR]";
    console.error(`${prefix} ${error.message || error}`);
    if (error.stack) {
        console.error(error.stack);
    }
};

const sendErrorResponse = (res, status = 500, message = "An unexpected error occurred", error = null, context = null) => {
    if (error) {
        logError(error, context);
    }

    const payload = {
        message: isProduction ? message : (error?.message || message)
    };

    return res.status(status).json(payload);
};

module.exports = {
    sendErrorResponse
};
