import { ICONS } from "./icon-index.js";

const MAX_RESULTS = 120;
const DEFAULT_QUERY = "mail arrow check close home search account database cloud folder";

const searchInput = document.querySelector("#searchInput");
const fillInput = document.querySelector("#fillInput");
const colorInput = document.querySelector("#colorInput");
const iconGrid = document.querySelector("#iconGrid");
const resultCount = document.querySelector("#resultCount");

const svgCache = new Map();

const normalize = (value) => value.toLowerCase().replace(/[\s-]+/g, "_").trim();

function preferredFileName(icon) {
  if (fillInput.checked && icon.filled) {
    return `${icon.name}-fill.svg`;
  }

  return icon.regular ? `${icon.name}.svg` : `${icon.name}-fill.svg`;
}

function iconPath(icon) {
  return `icons/rounded/${preferredFileName(icon)}`;
}

function colorizeSvg(svg) {
  const color = colorInput.value || "#1f1f1f";
  return svg
    .replace(/<svg\b([^>]*)>/, `<svg$1 fill="${color}">`)
    .replace(/\swidth="48"/, ' width="24"')
    .replace(/\sheight="48"/, ' height="24"');
}

async function loadSvg(icon) {
  const path = iconPath(icon);
  const cacheKey = `${path}:${colorInput.value}`;

  if (svgCache.has(cacheKey)) {
    return svgCache.get(cacheKey);
  }

  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Could not load ${path}`);
  }

  const svg = colorizeSvg(await response.text());
  svgCache.set(cacheKey, svg);
  return svg;
}

function svgToDataUrl(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function scoreIcon(icon, query) {
  if (!query) {
    return DEFAULT_QUERY.includes(icon.name) ? 0 : icon.name.length;
  }

  const name = icon.name;
  const label = icon.label;
  const tokens = query.split("_").filter(Boolean);
  let score = 0;

  for (const token of tokens) {
    if (name === token) {
      score -= 100;
    } else if (name.startsWith(token)) {
      score -= 60;
    } else if (name.includes(`_${token}`)) {
      score -= 35;
    } else if (name.includes(token) || label.includes(token)) {
      score -= 18;
    } else {
      return null;
    }
  }

  return score + name.length / 100;
}

function searchIcons() {
  const query = normalize(searchInput.value);
  return ICONS
    .map((icon) => ({ icon, score: scoreIcon(icon, query) }))
    .filter((entry) => entry.score !== null)
    .sort((a, b) => a.score - b.score || a.icon.name.localeCompare(b.icon.name))
    .slice(0, MAX_RESULTS)
    .map((entry) => entry.icon);
}

function labelFor(icon) {
  return icon.name.replace(/_/g, " ");
}

function applyTileSvg(button, svg) {
  const preview = button.querySelector(".icon-preview");
  preview.innerHTML = svg;
}

async function hydrateTile(button, icon) {
  try {
    applyTileSvg(button, await loadSvg(icon));
  } catch {
    button.querySelector(".icon-preview").textContent = "?";
  }
}

function primeDragData(event, icon) {
  const path = iconPath(icon);
  const url = chrome.runtime.getURL(path);
  const cachedSvg = [...svgCache.entries()].find(([key]) => key.startsWith(`${path}:`))?.[1];

  event.dataTransfer.effectAllowed = "copy";
  event.dataTransfer.setData("text/uri-list", url);
  event.dataTransfer.setData("DownloadURL", `image/svg+xml:${icon.name}.svg:${url}`);

  if (!cachedSvg) {
    return;
  }

  const dataUrl = svgToDataUrl(cachedSvg);
  event.dataTransfer.setData("text/plain", cachedSvg);
  event.dataTransfer.setData("text/html", `<img src="${dataUrl}" alt="${icon.name}">`);

  if (event.dataTransfer.items?.add) {
    try {
      event.dataTransfer.items.add(new File([cachedSvg], `${icon.name}.svg`, { type: "image/svg+xml" }));
    } catch {
      // Some Chromium drag targets reject programmatic File items; URL and HTML fallbacks remain.
    }
  }
}

function createTile(icon) {
  const button = document.createElement("button");
  button.className = "icon-tile";
  button.type = "button";
  button.draggable = true;
  button.title = `Drag ${labelFor(icon)} onto Excalidraw to insert.`;
  button.innerHTML = `
    <span class="icon-preview" aria-hidden="true"></span>
    <span class="icon-label">${labelFor(icon)}</span>
  `;

  button.addEventListener("pointerenter", () => hydrateTile(button, icon), { once: true });
  button.addEventListener("pointerdown", () => hydrateTile(button, icon), { once: true });
  button.addEventListener("focus", () => hydrateTile(button, icon), { once: true });
  button.addEventListener("dragstart", (event) => primeDragData(event, icon));

  hydrateTile(button, icon);
  return button;
}

function render() {
  const results = searchIcons();
  iconGrid.replaceChildren();
  resultCount.textContent = `${results.length} of ${ICONS.length} icons`;

  if (results.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No matching icons.";
    iconGrid.append(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const icon of results) {
    fragment.append(createTile(icon));
  }

  iconGrid.append(fragment);
}

searchInput.addEventListener("input", render);
fillInput.addEventListener("change", render);
colorInput.addEventListener("input", () => {
  svgCache.clear();
  render();
});

render();
searchInput.focus();
