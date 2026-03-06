const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const includeDirs = ["config", "controllers", "middleware", "models", "routes", "scripts", "utils", "validators"];
const ignoreDirs = new Set(["node_modules", ".git", "dist", "coverage"]);
const targetExtensions = new Set([".js", ".cjs", ".mjs"]);

const files = [];

const walk = (dirPath) => {
    if (!fs.existsSync(dirPath)) return;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            if (!ignoreDirs.has(entry.name)) {
                walk(fullPath);
            }
            continue;
        }

        if (entry.isFile() && targetExtensions.has(path.extname(entry.name))) {
            files.push(fullPath);
        }
    }
};

includeDirs.forEach((dir) => walk(path.join(rootDir, dir)));
files.push(path.join(rootDir, "server.js"));

const uniqueFiles = Array.from(new Set(files)).sort();
const failures = [];

for (const file of uniqueFiles) {
    const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
    if (result.status !== 0) {
        failures.push({
            file: path.relative(rootDir, file),
            stderr: (result.stderr || "").trim()
        });
    }
}

if (failures.length > 0) {
    console.error(`Syntax lint failed for ${failures.length} file(s):`);
    for (const failure of failures) {
        console.error(`\n- ${failure.file}`);
        if (failure.stderr) {
            console.error(failure.stderr);
        }
    }
    process.exit(1);
}

console.log(`Syntax lint passed for ${uniqueFiles.length} file(s).`);
