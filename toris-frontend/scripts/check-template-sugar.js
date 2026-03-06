#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const DISALLOWED_PATTERNS = ['*ngIf', '*ngFor', '*ngSwitch'];

const rootDir = path.resolve(__dirname, '..', 'src');

function walk(dir, callback) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const entryPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(entryPath, callback);
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            callback(entryPath);
        }
    }
}

const violations = [];
walk(rootDir, (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        for (const pattern of DISALLOWED_PATTERNS) {
            if (line.includes(pattern)) {
                violations.push({
                    file: path.relative(rootDir, filePath),
                    line: index + 1,
                    pattern,
                    snippet: line.trim()
                });
            }
        }
    }
});

if (violations.length) {
    console.error('\nTemplate sugar enforcement failed:');
    for (const item of violations) {
        console.error(`  ${item.file}:${item.line} contains "${item.pattern}" -> ${item.snippet}`);
    }
    console.error('\nReplace these directives with `@if/@for/@switch` syntax before continuing.\n');
    process.exit(1);
}
process.exit(0);
