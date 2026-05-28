import { execFile, spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import process from "node:process";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const tempDir = path.join(root, ".tmp-store-assets");
const iconSource = path.join(root, "src", "assets", "icon.svg");

async function runChrome(args) {
  await execFileAsync(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    ...args,
  ]);
}

async function waitForUrl(url) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Timed out waiting for ${url}`);
}

await mkdir(tempDir, { recursive: true });
await mkdir(path.join(root, "src", "assets"), { recursive: true });
await mkdir(path.join(root, "store-assets", "screenshots"), { recursive: true });

for (const size of [16, 32, 48, 128]) {
  const iconHtml = path.join(tempDir, `icon-${size}.html`);
  const output = path.join(root, "src", "assets", `icon-${size}.png`);
  const iconUrl = new URL(`file://${iconSource}`).href;

  await writeFile(
    iconHtml,
    `<!doctype html><html><head><meta charset="utf-8"><style>html,body{width:${size}px;height:${size}px;margin:0;overflow:hidden;background:transparent}img{width:${size}px;height:${size}px;display:block}</style></head><body><img src="${iconUrl}" alt=""></body></html>`,
  );

  await runChrome([
    `--window-size=${size},${size}`,
    `--screenshot=${output}`,
    new URL(`file://${iconHtml}`).href,
  ]);
}

await import("./build-extension.mjs");

const server = spawn("npx", ["--yes", "http-server", ".", "-p", "4173", "-c-1"], {
  cwd: root,
  stdio: "ignore",
});

try {
  await waitForUrl("http://127.0.0.1:4173/store-assets/source/screenshot.html");

  await runChrome([
    "--window-size=1280,800",
    `--screenshot=${path.join(root, "store-assets", "screenshots", "excalicon-1280x800.png")}`,
    "http://127.0.0.1:4173/store-assets/source/screenshot.html",
  ]);
} finally {
  server.kill();
}

await rm(tempDir, { recursive: true, force: true });
console.log("Rendered extension icons and Chrome Web Store screenshot.");
