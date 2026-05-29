import { execFile } from "node:child_process";
import { mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import process from "node:process";
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import zlib from "node:zlib";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const packageJson = JSON.parse(await (await import("node:fs/promises")).readFile(path.join(root, "package.json"), "utf8"));
const releaseDir = path.join(root, "release");
const output = path.join(releaseDir, `excalicon-${packageJson.version}.zip`);
const materialPackage = path.join(root, "material-symbols-svg-400-0.44.10.tgz");

function dosDateTime(date = new Date()) {
  const year = Math.max(date.getFullYear(), 1980);
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosDate, dosTime };
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

class ZipWriter {
  constructor(outputPath) {
    this.output = createWriteStream(outputPath);
    this.offset = 0;
    this.entries = [];
  }

  write(buffer) {
    this.output.write(buffer);
    this.offset += buffer.length;
  }

  addFile(name, data) {
    const nameBuffer = Buffer.from(name);
    const { dosDate, dosTime } = dosDateTime();
    const crc = crc32(data);
    const localOffset = this.offset;

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(data.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);

    this.write(localHeader);
    this.write(nameBuffer);
    this.write(data);
    this.entries.push({ nameBuffer, crc, size: data.length, dosDate, dosTime, localOffset });
  }

  async close() {
    const centralOffset = this.offset;

    for (const entry of this.entries) {
      const centralHeader = Buffer.alloc(46);
      centralHeader.writeUInt32LE(0x02014b50, 0);
      centralHeader.writeUInt16LE(20, 4);
      centralHeader.writeUInt16LE(20, 6);
      centralHeader.writeUInt16LE(0, 8);
      centralHeader.writeUInt16LE(0, 10);
      centralHeader.writeUInt16LE(entry.dosTime, 12);
      centralHeader.writeUInt16LE(entry.dosDate, 14);
      centralHeader.writeUInt32LE(entry.crc, 16);
      centralHeader.writeUInt32LE(entry.size, 20);
      centralHeader.writeUInt32LE(entry.size, 24);
      centralHeader.writeUInt16LE(entry.nameBuffer.length, 28);
      centralHeader.writeUInt16LE(0, 30);
      centralHeader.writeUInt16LE(0, 32);
      centralHeader.writeUInt16LE(0, 34);
      centralHeader.writeUInt16LE(0, 36);
      centralHeader.writeUInt32LE(0, 38);
      centralHeader.writeUInt32LE(entry.localOffset, 42);
      this.write(centralHeader);
      this.write(entry.nameBuffer);
    }

    const centralSize = this.offset - centralOffset;
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(0, 4);
    end.writeUInt16LE(0, 6);
    end.writeUInt16LE(this.entries.length, 8);
    end.writeUInt16LE(this.entries.length, 10);
    end.writeUInt32LE(centralSize, 12);
    end.writeUInt32LE(centralOffset, 16);
    end.writeUInt16LE(0, 20);
    this.write(end);

    this.output.end();
    await new Promise((resolve, reject) => {
      this.output.on("finish", resolve);
      this.output.on("error", reject);
    });
  }
}

async function collectDistFiles(dir, prefix = "") {
  const entries = [];
  for (const name of await readdir(dir)) {
    const fullPath = path.join(dir, name);
    const relativePath = prefix ? `${prefix}/${name}` : name;
    const fileStat = await stat(fullPath);

    if (fileStat.isDirectory()) {
      entries.push(...(await collectDistFiles(fullPath, relativePath)));
    } else if (!relativePath.startsWith("icons/")) {
      entries.push({ fullPath, relativePath });
    }
  }
  return entries;
}

async function materialIconEntries() {
  const tarball = [];
  await pipeline(
    Readable.from((await import("node:fs")).createReadStream(materialPackage)),
    zlib.createGunzip(),
    async function* (source) {
      for await (const chunk of source) {
        tarball.push(chunk);
      }
    },
  );

  const tar = Buffer.concat(tarball);
  const entries = [];
  let offset = 0;

  while (offset + 512 <= tar.length) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) {
      break;
    }

    const rawName = header.subarray(0, 100).toString("utf8").replace(/\0.*$/, "");
    const sizeOctal = header.subarray(124, 136).toString("utf8").replace(/\0.*$/, "").trim();
    const size = Number.parseInt(sizeOctal || "0", 8);
    const dataOffset = offset + 512;
    const nextOffset = dataOffset + Math.ceil(size / 512) * 512;

    if (
      (rawName.startsWith("package/rounded/") ||
        rawName.startsWith("package/sharp/")) &&
      rawName.endsWith(".svg")
    ) {
      entries.push({
        name: rawName.replace("package/", "icons/"),
        data: tar.subarray(dataOffset, dataOffset + size),
      });
    }

    offset = nextOffset;
  }

  return entries;
}

await rm(output, { force: true });
await mkdir(releaseDir, { recursive: true });
await execFileAsync(process.execPath, [path.join(root, "scripts", "build-extension.mjs")]);

if (!(await stat(materialPackage).catch(() => null))) {
  await execFileAsync("npm", ["pack", "@material-symbols/svg-400@0.44.10", "--silent"]);
}

const zip = new ZipWriter(output);
for (const file of await collectDistFiles(path.join(root, "dist"))) {
  zip.addFile(file.relativePath, await (await import("node:fs/promises")).readFile(file.fullPath));
}
for (const entry of await materialIconEntries()) {
  zip.addFile(entry.name, entry.data);
}
await zip.close();

console.log(`Created ${output}`);
