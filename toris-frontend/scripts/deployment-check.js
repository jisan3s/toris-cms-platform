const strict = process.argv.includes("--strict");

const errors = [];
const warnings = [];

const apiOrigin = String(process.env.TORIS_API_ORIGIN || process.env.API_ORIGIN || "").trim();
const nodeEnv = String(process.env.NODE_ENV || "").trim() || "(not set)";
const port = String(process.env.PORT || "").trim();

if (!apiOrigin) {
    const message = "TORIS_API_ORIGIN (or API_ORIGIN) is not set for SSR runtime";
    if (strict) {
        errors.push(message);
    } else {
        warnings.push(message);
    }
} else {
    try {
        // eslint-disable-next-line no-new
        new URL(apiOrigin);
    } catch {
        errors.push("TORIS_API_ORIGIN/API_ORIGIN must be a valid absolute URL");
    }

    if (/localhost|127\.0\.0\.1/i.test(apiOrigin)) {
        const message = `API origin points to local host (${apiOrigin})`;
        if (strict) {
            errors.push(message);
        } else {
            warnings.push(message);
        }
    }
}

if (!port) {
    warnings.push("PORT is not set; frontend server will default to 4000");
}

if (nodeEnv !== "production") {
    const message = `NODE_ENV is ${nodeEnv}`;
    if (strict) {
        errors.push(`${message} (expected production)`);
    } else {
        warnings.push(`${message} (recommended: production for deploy checks)`);
    }
}

if (warnings.length > 0) {
    console.warn("Frontend deployment check warnings:");
    for (const warning of warnings) {
        console.warn(`- ${warning}`);
    }
}

if (errors.length > 0) {
    console.error("Frontend deployment check failed:");
    for (const issue of errors) {
        console.error(`- ${issue}`);
    }
    process.exit(1);
}

console.log(`Frontend deployment check passed${strict ? " (strict)" : ""}.`);
