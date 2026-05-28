import { ICONS } from "./icon-index.js";

const MAX_RESULTS = 120;
const MAX_RECENTS = 12;
const RECENTS_KEY = "excalicon.recents.v1";
const DEFAULT_QUERY = "mail arrow check close home search account database cloud folder";
const STYLE_LABELS = {
  rounded: "Rounded",
  outlined: "Outlined",
  sharp: "Sharp",
};
const ALIASES = {
  account: ["user", "person", "profile", "avatar"],
  add: ["plus", "create", "new"],
  apps: ["grid", "menu"],
  arrow_back: ["left", "previous", "back"],
  arrow_forward: ["right", "next", "forward"],
  arrow_downward: ["down", "download"],
  arrow_upward: ["up", "upload"],
  cancel: ["close", "x", "remove"],
  check: ["done", "tick", "yes", "confirm", "success"],
  close: ["x", "cancel", "dismiss"],
  cloud: ["server", "host", "storage"],
  code: ["developer", "programming", "brackets"],
  content_copy: ["copy", "duplicate"],
  delete: ["trash", "remove", "bin"],
  description: ["document", "file", "page"],
  edit: ["pencil", "write"],
  error: ["warning", "alert", "danger"],
  favorite: ["heart", "like"],
  folder: ["directory", "files"],
  home: ["house", "start"],
  image: ["photo", "picture", "media"],
  info: ["help", "about"],
  link: ["url", "chain"],
  lock: ["secure", "private", "password"],
  mail: ["email", "envelope", "message", "inbox"],
  menu: ["hamburger", "nav", "navigation"],
  more_horiz: ["ellipsis", "dots", "more"],
  more_vert: ["kebab", "dots", "more"],
  notifications: ["bell", "alert"],
  open_in_new: ["external", "launch"],
  payments: ["money", "card", "cash"],
  person: ["user", "account", "profile", "avatar"],
  public: ["globe", "world", "web"],
  remove: ["minus", "delete"],
  search: ["find", "magnify", "lookup"],
  settings: ["gear", "cog", "preferences"],
  share: ["send", "export"],
  shopping_cart: ["cart", "shop", "basket"],
  star: ["favorite", "rating"],
  sync: ["refresh", "reload"],
  upload_file: ["upload", "import"],
  visibility: ["eye", "show", "view"],
  visibility_off: ["hide", "hidden", "eye off"],
  warning: ["alert", "error", "danger"],
};

const searchInput = document.querySelector("#searchInput");
const styleInput = document.querySelector("#styleInput");
const fillInput = document.querySelector("#fillInput");
const colorInput = document.querySelector("#colorInput");
const iconGrid = document.querySelector("#iconGrid");
const resultCount = document.querySelector("#resultCount");
const recentsSection = document.querySelector("#recentsSection");
const recentsGrid = document.querySelector("#recentsGrid");

const svgCache = new Map();
let recents = loadRecents();

const normalize = (value) => value.toLowerCase().replace(/[\s-]+/g, "_").trim();

function styleAvailability(icon) {
  return icon.styles[styleInput.value] ?? icon.styles.rounded;
}

function preferredFileName(icon, filled = fillInput.checked) {
  const availability = styleAvailability(icon);
  if (filled && availability.filled) {
    return `${icon.name}-fill.svg`;
  }

  return availability.regular ? `${icon.name}.svg` : `${icon.name}-fill.svg`;
}

function iconPath(icon, style = styleInput.value, filled = fillInput.checked) {
  return `icons/${style}/${preferredFileName(icon, filled)}`;
}

function colorizeSvg(svg, color = colorInput.value || "#1f1f1f") {
  return svg
    .replace(/<svg\b([^>]*)>/, `<svg$1 fill="${color}">`)
    .replace(/\swidth="48"/, ' width="24"')
    .replace(/\sheight="48"/, ' height="24"');
}

async function loadSvg(icon, options = {}) {
  const style = options.style ?? styleInput.value;
  const filled = options.filled ?? fillInput.checked;
  const color = options.color ?? colorInput.value;
  const path = iconPath(icon, style, filled);
  const cacheKey = `${path}:${color}`;

  if (svgCache.has(cacheKey)) {
    return svgCache.get(cacheKey);
  }

  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Could not load ${path}`);
  }

  const svg = colorizeSvg(await response.text(), color);
  svgCache.set(cacheKey, svg);
  return svg;
}

function svgToDataUrl(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function searchableTerms(icon) {
  const terms = new Set([icon.name, icon.label, ...icon.name.split("_"), ...(ALIASES[icon.name] ?? [])]);

  for (const [name, aliases] of Object.entries(ALIASES)) {
    if (name.includes(icon.name) || icon.name.includes(name)) {
      aliases.forEach((alias) => terms.add(alias));
    }
  }

  return [...terms].flatMap((term) => [term, normalize(term)]).filter(Boolean);
}

function scoreIcon(icon, query) {
  if (!styleAvailability(icon)) {
    return null;
  }

  if (!query) {
    return DEFAULT_QUERY.includes(icon.name) ? 0 : icon.name.length;
  }

  const tokens = query.split("_").filter(Boolean);
  const name = icon.name;
  const terms = searchableTerms(icon);
  let score = 0;

  for (const token of tokens) {
    if (name === token) {
      score -= 120;
    } else if (name.startsWith(token)) {
      score -= 80;
    } else if (name.includes(`_${token}`)) {
      score -= 55;
    } else if (name.includes(token)) {
      score -= 35;
    } else {
      const matchingTerm = terms.find((term) => term === token || term.startsWith(token) || term.includes(token));
      if (!matchingTerm) {
        return null;
      }

      score -= ALIASES[name]?.some((alias) => normalize(alias).includes(token)) ? 45 : 22;
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
  button.querySelector(".icon-preview").innerHTML = svg;
}

async function hydrateTile(button, icon, options = {}) {
  try {
    applyTileSvg(button, await loadSvg(icon, options));
  } catch {
    button.querySelector(".icon-preview").textContent = "?";
  }
}

function primeDragData(event, icon, options = {}) {
  const style = options.style ?? styleInput.value;
  const filled = options.filled ?? fillInput.checked;
  const color = options.color ?? colorInput.value;
  const path = iconPath(icon, style, filled);
  const url = chrome.runtime.getURL(path);
  const cachedSvg = svgCache.get(`${path}:${color}`);

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

  rememberRecent(icon, { style, filled, color });
}

function loadRecents() {
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveRecents() {
  localStorage.setItem(RECENTS_KEY, JSON.stringify(recents));
}

function iconByName(name) {
  return ICONS.find((icon) => icon.name === name);
}

function rememberRecent(icon, options) {
  const recent = {
    name: icon.name,
    style: options.style,
    filled: Boolean(options.filled),
    color: options.color,
  };
  const key = JSON.stringify(recent);
  recents = [recent, ...recents.filter((item) => JSON.stringify(item) !== key)].slice(0, MAX_RECENTS);
  saveRecents();
  renderRecents();
}

function createTile(icon, options = {}) {
  const button = document.createElement("button");
  const style = options.style ?? styleInput.value;
  const filled = options.filled ?? fillInput.checked;
  const color = options.color ?? colorInput.value;
  button.className = "icon-tile";
  button.type = "button";
  button.draggable = true;
  button.title = `Drag ${labelFor(icon)} (${STYLE_LABELS[style]}) onto Excalidraw.`;
  button.innerHTML = `
    <span class="icon-preview" aria-hidden="true"></span>
    <span class="icon-label">${labelFor(icon)}</span>
  `;

  const tileOptions = { style, filled, color };
  button.addEventListener("pointerenter", () => hydrateTile(button, icon, tileOptions), { once: true });
  button.addEventListener("pointerdown", () => hydrateTile(button, icon, tileOptions), { once: true });
  button.addEventListener("focus", () => hydrateTile(button, icon, tileOptions), { once: true });
  button.addEventListener("dragstart", (event) => primeDragData(event, icon, tileOptions));

  hydrateTile(button, icon, tileOptions);
  return button;
}

function renderRecents() {
  recentsGrid.replaceChildren();
  const validRecents = recents.map((recent) => ({ recent, icon: iconByName(recent.name) })).filter((entry) => entry.icon);
  recentsSection.hidden = validRecents.length === 0;

  const fragment = document.createDocumentFragment();
  for (const { recent, icon } of validRecents) {
    fragment.append(createTile(icon, recent));
  }
  recentsGrid.append(fragment);
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
styleInput.addEventListener("change", () => {
  svgCache.clear();
  render();
});
fillInput.addEventListener("change", render);
colorInput.addEventListener("input", () => {
  svgCache.clear();
  render();
});

renderRecents();
render();
searchInput.focus();
