import { copyFile, mkdir, readdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourceDir = path.join(root, "src");
const packageDir = path.join(root, "node_modules", "@material-symbols", "svg-400");
const iconSourceDir = path.join(packageDir, "rounded");
const distDir = path.join(root, "dist");
const iconDistRoot = path.join(distDir, "icons");
const iconDistDir = path.join(iconDistRoot, "rounded");
const assetDistDir = path.join(distDir, "assets");

if (!existsSync(iconSourceDir)) {
  throw new Error("Missing @material-symbols/svg-400. Run `npm install` first.");
}

await rm(distDir, { recursive: true, force: true });
await mkdir(iconDistRoot, { recursive: true });
await mkdir(assetDistDir, { recursive: true });

const filesToCopy = [
  "manifest.json",
  "service-worker.js",
  "excalidraw-drop-bridge.js",
  "sidepanel.html",
  "sidepanel.css",
  "sidepanel.js",
];

for (const file of filesToCopy) {
  await copyFile(path.join(sourceDir, file), path.join(distDir, file));
}

for (const file of ["icon-16.png", "icon-32.png", "icon-48.png", "icon-128.png"]) {
  await copyFile(path.join(sourceDir, "assets", file), path.join(assetDistDir, file));
}

await copyFile(path.join(packageDir, "LICENSE"), path.join(distDir, "MATERIAL_SYMBOLS_LICENSE"));

const iconFiles = (await readdir(iconSourceDir)).filter((fileName) => fileName.endsWith(".svg"));
const iconsByName = new Map();

for (const fileName of iconFiles) {
  const filled = fileName.endsWith("-fill.svg");
  const name = fileName.replace(/-fill\.svg$|\.svg$/g, "");
  const current = iconsByName.get(name) ?? {
    name,
    label: name.replace(/_/g, " "),
    regular: false,
    filled: false,
  };

  if (filled) {
    current.filled = true;
  } else {
    current.regular = true;
  }

  iconsByName.set(name, current);
}

await symlink(iconSourceDir, iconDistDir, "dir");

const icons = [...iconsByName.values()].sort((a, b) => a.name.localeCompare(b.name));
const indexSource = `export const ICONS = ${JSON.stringify(icons)};\n`;

await writeFile(path.join(distDir, "icon-index.js"), indexSource);

const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
await writeFile(
  path.join(distDir, "ABOUT.txt"),
  [
    `${packageJson.name} ${packageJson.version}`,
    "",
    "Load this directory as an unpacked Chrome extension.",
    "Material Symbols are provided by Google under the Apache License 2.0.",
  ].join("\n"),
);

console.log(`Built ${icons.length} searchable rounded Material Symbols into ${distDir}`);
