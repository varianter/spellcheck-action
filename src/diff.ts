import { EOL } from "os";

export interface DiffLine {
  text: string;
  diffLineNumber: number;
}

export interface FileDiff {
  path: string;
  addedLines: DiffLine[];
}

export function getDiff(diff: string): FileDiff[] {
  let files: FileDiff[] = [];

  const diffFileMatch = diff.split(/^diff --git a\/(.+?) b\/(.+?)$/gm);
  for (let i = 1; i < diffFileMatch.length; i += 3) {
    const path = diffFileMatch[i + 1]; // taking the b-path in case of rename from a-path
    const actualDiff = diffFileMatch[i + 2];
    const diffLines = actualDiff.split(EOL);
    let diffLineNumber = 0;
    let firstAtAtHunkPassed = false;
    const addedLines: Array<DiffLine> = [];
    for (let line of diffLines) {
      if (firstAtAtHunkPassed) {
        diffLineNumber++;
        if (line.match(/^\+(?!\+\+ [a|b]\/)(.+)/)) {
          addedLines.push({ text: line.slice(1), diffLineNumber });
        }
      } else if (line.match(/^@@ -(\d+,\d+) \+(\d+,\d+) @@/)) {
        firstAtAtHunkPassed = true;
      }
    }
    if (!addedLines.length) {
      continue;
    }
    let fileDiff: FileDiff = { path, addedLines };
    files.push(fileDiff);
  }
  return files;
}
