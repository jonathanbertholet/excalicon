import { execFile } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import process from "node:process";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const releaseDir = path.join(root, "release");
const output = path.join(releaseDir, "excalicon-0.2.0.zip");

await rm(output, { force: true });
await mkdir(releaseDir, { recursive: true });

await execFileAsync("node", [path.join(root, "scripts", "build-extension.mjs")]);

const zipper = `
import os
from pathlib import Path
from zipfile import ZipFile, ZIP_STORED

root = Path(${JSON.stringify(path.join(root, "dist"))})
output = Path(${JSON.stringify(output)})

with ZipFile(output, "w", compression=ZIP_STORED) as archive:
    for dir_path, _, file_names in os.walk(root, followlinks=True):
        for file_name in sorted(file_names):
            file_path = Path(dir_path) / file_name
            archive.write(file_path, file_path.relative_to(root).as_posix())
`;

const zipperPath = path.join(root, ".tmp-package-zip.py");
await writeFile(zipperPath, zipper);
try {
  await execFileAsync("python3", [zipperPath]);
} finally {
  await rm(zipperPath, { force: true });
}

console.log(`Created ${output}`);
