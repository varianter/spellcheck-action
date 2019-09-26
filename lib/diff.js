"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
function getDiff(diff) {
    let files = [];
    const diffFileMatch = diff.split(/^diff --git a\/(.+?) b\/(.+?)$/gm);
    for (let i = 1; i < diffFileMatch.length; i += 3) {
        const path = diffFileMatch[i + 1]; // taking the b-path in case of rename from a-path
        const actualDiff = diffFileMatch[i + 2];
        const diffLines = actualDiff.split(os_1.EOL);
        let diffLineNumber = 0;
        let firstAtAtHunkPassed = false;
        const addedLines = [];
        for (let line of diffLines) {
            if (firstAtAtHunkPassed) {
                diffLineNumber++;
                if (line.match(/^\+(?!\+\+ [a|b]\/)(.+)/)) {
                    console.log(line)
                    addedLines.push({ text: line.slice(1), diffLineNumber });
                }
            }
            else if (line.match(/^@@ -(\d+,\d+) \+(\d+,\d+) @@/)) {
                firstAtAtHunkPassed = true;
            }
        }
        if (!addedLines.length) {
            continue;
        }
        let fileDiff = { path, addedLines };
        files.push(fileDiff);
    }
    return files;
}
exports.getDiff = getDiff;
