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
  account_balance: ["bank", "finance", "institution"],
  account_balance_wallet: ["wallet", "money", "balance"],
  account_circle: ["user", "profile", "avatar", "person"],
  account_tree: ["hierarchy", "org chart", "tree", "sitemap"],
  add: ["plus", "create", "new"],
  add_card: ["payment method", "card field", "billing field"],
  add_comment: ["note", "annotation", "comment field"],
  add_notes: ["note", "notes", "add note"],
  add_a_photo: ["camera", "photo", "image"],
  add_box: ["plus square", "create box"],
  add_circle: ["plus circle", "create"],
  add_link: ["link", "chain", "url"],
  add_location: ["pin", "map", "place"],
  add_photo_alternate: ["image", "photo", "picture"],
  add_shopping_cart: ["cart", "basket", "buy"],
  add_task: ["todo", "checklist", "done"],
  admin_panel_settings: ["admin", "shield", "security"],
  analytics: ["chart", "metrics", "dashboard", "report"],
  approval: ["approve", "review", "accepted"],
  archive: ["box", "store", "save"],
  apps: ["grid", "menu"],
  arrow_back_ios: ["chevron left", "back", "previous"],
  arrow_back_ios_new: ["chevron left", "back", "previous"],
  arrow_back: ["left", "previous", "back"],
  arrow_circle_down: ["down", "download", "expand"],
  arrow_circle_left: ["left", "previous", "back"],
  arrow_circle_right: ["right", "next", "forward"],
  arrow_circle_up: ["up", "upload", "collapse"],
  arrow_downward: ["down", "download"],
  arrow_drop_down: ["caret", "dropdown", "chevron down"],
  arrow_drop_up: ["caret", "dropdown", "chevron up"],
  arrow_forward: ["right", "next", "forward"],
  arrow_forward_ios: ["chevron right", "next", "forward"],
  arrow_outward: ["external", "open", "launch"],
  arrow_right_alt: ["right", "next", "forward"],
  arrow_upward: ["up", "upload"],
  article: ["document", "news", "post", "file"],
  attach_file: ["attachment", "paperclip", "clip"],
  attach_email: ["email attachment", "mail attachment", "forward"],
  attachment: ["paperclip", "file", "clip"],
  auto_awesome: ["magic", "sparkle", "ai"],
  backup: ["cloud upload", "save", "sync"],
  bar_chart: ["chart", "graph", "metrics"],
  block: ["ban", "forbidden", "disabled"],
  bolt: ["lightning", "fast", "energy"],
  bookmark: ["save", "favorite", "marker"],
  browse_gallery: ["gallery", "images", "media picker"],
  bug_report: ["bug", "issue", "debug"],
  build: ["tool", "wrench", "repair"],
  calendar_month: ["calendar", "date", "schedule"],
  call: ["phone", "telephone", "contact"],
  call_end: ["hang up", "end call", "phone off"],
  campaign: ["announcement", "megaphone", "marketing"],
  cancel: ["close", "x", "remove"],
  category: ["tags", "group", "type"],
  check: ["done", "tick", "yes", "confirm", "success"],
  check_box: ["checkbox", "selected", "done"],
  check_circle: ["success", "approved", "complete"],
  checklist: ["todo", "tasks", "checkbox list"],
  checklist_rtl: ["todo", "tasks", "checklist"],
  chevron_left: ["left", "back", "previous"],
  chevron_right: ["right", "next", "forward"],
  close: ["x", "cancel", "dismiss"],
  close_fullscreen: ["collapse", "minimize", "shrink"],
  cloud: ["server", "host", "storage"],
  cloud_done: ["cloud success", "synced", "backup complete"],
  cloud_download: ["download", "restore", "import"],
  cloud_off: ["offline", "no cloud", "disconnected"],
  cloud_upload: ["upload", "backup", "sync"],
  code: ["developer", "programming", "brackets"],
  comment: ["message", "chat", "note"],
  comment_bank: ["saved replies", "comment templates", "notes"],
  compare_arrows: ["swap", "exchange", "transfer"],
  construction: ["tools", "build", "work"],
  contact_mail: ["email", "address", "contact"],
  contact_page: ["contact", "profile", "address card"],
  contact_phone: ["phone", "contact", "telephone"],
  contacts: ["address book", "people", "users"],
  content_copy: ["copy", "duplicate"],
  content_cut: ["cut", "scissors"],
  content_paste: ["paste", "clipboard"],
  credit_card: ["card", "payment", "billing"],
  dashboard: ["overview", "grid", "metrics"],
  dataset: ["data", "table", "records"],
  data_array: ["array", "list", "data"],
  data_object: ["json", "object", "code"],
  database: ["db", "storage", "sql", "data"],
  date_range: ["date", "calendar", "date field", "range"],
  delete: ["trash", "remove", "bin"],
  delete_forever: ["trash", "remove", "destroy"],
  deployed_code: ["package", "box", "deploy"],
  description: ["document", "file", "page"],
  dialpad: ["phone keypad", "keypad", "pin input"],
  devices: ["screens", "hardware", "responsive"],
  dns: ["server", "database", "storage"],
  done_all: ["double check", "complete", "read"],
  download: ["save", "export", "down"],
  drafts: ["draft", "unsent", "mail draft"],
  drag_indicator: ["handle", "grip", "move"],
  edit: ["pencil", "write"],
  edit_note: ["note", "notes", "textarea", "comment"],
  edit_document: ["write", "document", "compose"],
  edit_square: ["compose", "pencil", "write"],
  email: ["mail", "envelope", "message"],
  emergency_home: ["address", "home field", "location"],
  error: ["warning", "alert", "danger"],
  event: ["calendar", "date", "schedule"],
  event_available: ["available date", "confirmed event", "calendar check"],
  event_busy: ["unavailable date", "blocked date", "calendar error"],
  event_note: ["calendar note", "date note", "appointment"],
  expand_less: ["collapse", "chevron up", "less"],
  expand_more: ["dropdown", "chevron down", "more"],
  extension: ["plugin", "addon", "puzzle"],
  fact_check: ["checklist", "validation", "review"],
  favorite: ["heart", "like"],
  feed: ["rss", "news", "blog"],
  field_prediction: ["form field", "input field", "autocomplete"],
  file_open: ["open file", "folder", "document"],
  file_present: ["attached file", "attachment", "document"],
  filter_alt: ["filter", "funnel", "refine"],
  filter_list: ["filter", "list filter", "funnel"],
  flag: ["marker", "report", "milestone"],
  folder: ["directory", "files"],
  folder_open: ["directory", "open files"],
  format_list_bulleted: ["list", "bullets"],
  format_list_numbered: ["list", "numbers", "ordered"],
  format_quote: ["quote", "blockquote", "testimonial"],
  forms_add_on: ["form", "fields", "survey"],
  forum: ["chat", "comments", "discussion"],
  fullscreen: ["expand", "maximize"],
  groups: ["team", "people", "users"],
  group_add: ["invite", "add people", "add team"],
  hand_gesture: ["hand", "gesture", "touch"],
  help: ["question", "support", "info"],
  help_center: ["faq", "support", "documentation"],
  history: ["recent", "clock", "past"],
  hourglass_empty: ["loading", "waiting", "pending"],
  hourglass_top: ["loading", "waiting", "progress"],
  home: ["house", "start"],
  image: ["photo", "picture", "media"],
  inbox: ["mail", "tray", "messages"],
  info: ["help", "about"],
  input: ["enter", "import", "login", "text field", "form field"],
  inventory_2: ["box", "archive", "package"],
  key: ["password", "secret", "access"],
  keyboard: ["keys", "typing", "shortcut"],
  lan: ["network", "nodes", "topology"],
  label: ["tag", "category", "badge", "chip", "field label"],
  label_important: ["important tag", "priority label", "badge"],
  label_off: ["untagged", "remove label", "no tag"],
  language: ["translate", "globe", "locale"],
  layers: ["stack", "levels", "overlap"],
  link: ["url", "chain"],
  list: ["rows", "menu", "items", "list view"],
  list_alt: ["form", "checklist", "details", "fields"],
  location_on: ["pin", "map", "place"],
  location_city: ["city", "address", "company"],
  low_priority: ["priority", "reorder", "sort"],
  lock: ["secure", "private", "password"],
  login: ["sign in", "enter", "auth"],
  logout: ["sign out", "exit"],
  mail: ["email", "envelope", "message", "inbox"],
  manage_accounts: ["account settings", "user settings", "profile settings"],
  mark_email_read: ["read mail", "email done", "message read"],
  mark_email_unread: ["unread mail", "email", "message"],
  memory: ["chip", "cpu", "processor"],
  menu: ["hamburger", "nav", "navigation"],
  menu_open: ["sidebar", "drawer", "navigation open"],
  mic: ["microphone", "voice", "audio"],
  monetization_on: ["money", "coin", "revenue"],
  more_horiz: ["ellipsis", "dots", "more"],
  more_vert: ["kebab", "dots", "more"],
  mouse: ["cursor", "click", "pointer"],
  move_down: ["down", "reorder", "move"],
  move_up: ["up", "reorder", "move"],
  network_check: ["wifi", "connection", "speed"],
  notifications: ["bell", "alert"],
  notification_important: ["important alert", "bell alert", "urgent"],
  notes: ["note", "text", "memo", "description"],
  open_in_full: ["expand", "maximize"],
  open_in_new: ["external", "launch"],
  palette: ["color", "paint", "theme"],
  pan_tool: ["hand", "grab", "move"],
  password: ["secret", "login", "credentials"],
  payments: ["money", "card", "cash"],
  pending: ["waiting", "clock", "loading"],
  pending_actions: ["todo", "task", "waiting"],
  person: ["user", "account", "profile", "avatar"],
  person_add: ["add user", "invite", "new user"],
  person_pin: ["contact pin", "profile location", "assigned user"],
  person_search: ["find user", "people search", "contact search"],
  pin_drop: ["map pin", "location", "address"],
  phone_iphone: ["mobile", "iphone", "smartphone"],
  pie_chart: ["chart", "graph", "analytics"],
  play_arrow: ["play", "start", "run"],
  power_settings_new: ["power", "shutdown", "logout"],
  print: ["printer", "paper"],
  priority_high: ["important", "alert", "warning"],
  public: ["globe", "world", "web"],
  push_pin: ["pin", "pinned", "attach"],
  qr_code: ["qr", "barcode", "scan"],
  qr_code_scanner: ["scan", "barcode scanner", "qr scanner"],
  radio_button_checked: ["radio", "selected", "circle"],
  radio_button_unchecked: ["radio", "circle", "unselected"],
  receipt_long: ["invoice", "receipt", "bill"],
  redo: ["repeat", "forward"],
  refresh: ["reload", "sync"],
  remove: ["minus", "delete"],
  restart_alt: ["restart", "reset", "reload"],
  rocket_launch: ["rocket", "launch", "startup"],
  route: ["path", "map", "directions"],
  save: ["disk", "floppy", "store"],
  schedule: ["clock", "time", "calendar"],
  score: ["rating", "points", "grade"],
  search: ["find", "magnify", "lookup"],
  search_off: ["no results", "not found", "empty search"],
  security: ["shield", "safe", "secure"],
  send: ["paper plane", "share", "submit"],
  settings: ["gear", "cog", "preferences"],
  settings_applications: ["app settings", "configuration", "preferences"],
  settings_suggest: ["recommendations", "smart settings", "suggestions"],
  share: ["send", "export"],
  shield: ["security", "protect", "safe"],
  shopping_cart: ["cart", "shop", "basket"],
  side_navigation: ["sidebar", "nav", "drawer"],
  signature: ["sign", "signed", "approval"],
  sms: ["text message", "message", "chat"],
  smart_toy: ["bot", "robot", "ai"],
  sort: ["order", "arrange"],
  sort_by_alpha: ["alphabetical", "sort az", "name sort"],
  star: ["favorite", "rating"],
  storage: ["database", "disk", "server"],
  subject: ["text", "paragraph", "body copy"],
  support_agent: ["support", "helpdesk", "headset"],
  sync: ["refresh", "reload"],
  table_chart: ["table", "spreadsheet", "grid"],
  tag: ["label", "hashtag", "chip", "badge"],
  tag_faces: ["emoji", "reaction", "mood"],
  task_alt: ["done", "success", "complete"],
  text_fields: ["text", "input", "field", "typography"],
  text_snippet: ["text file", "note", "document"],
  title: ["heading", "text", "label"],
  terminal: ["console", "command line", "cli"],
  toc: ["table of contents", "list", "outline"],
  thumb_down: ["dislike", "bad"],
  thumb_up: ["like", "good"],
  timeline: ["history", "roadmap", "sequence"],
  toggle_off: ["switch off", "disabled"],
  toggle_on: ["switch on", "enabled"],
  translate: ["language", "locale"],
  trending_down: ["down", "decline", "chart"],
  trending_up: ["up", "growth", "chart"],
  undo: ["back", "reverse"],
  upload_file: ["upload", "import"],
  upload: ["upload", "send file", "import"],
  view_agenda: ["agenda", "cards", "schedule"],
  view_column: ["columns", "kanban", "layout"],
  view_headline: ["rows", "list", "text list"],
  view_kanban: ["kanban", "board", "columns"],
  view_list: ["list view", "rows", "table"],
  view_module: ["grid view", "cards", "tiles"],
  view_sidebar: ["sidebar", "drawer", "panel"],
  verified: ["check", "badge", "approved"],
  visibility: ["eye", "show", "view"],
  visibility_off: ["hide", "hidden", "eye off"],
  volume_off: ["mute", "silent", "audio off"],
  volume_up: ["sound", "audio", "speaker"],
  warning: ["alert", "error", "danger"],
  web: ["browser", "site", "page"],
  web_asset: ["window", "browser window", "screen"],
  wifi: ["wireless", "network", "connection"],
  work: ["briefcase", "job", "business"],
  zoom_in: ["magnify", "search plus"],
  zoom_out: ["magnify", "search minus"],
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

function primeDragData(event, icon, options = {}, dragOptions = {}) {
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

  if (dragOptions.remember !== false) {
    rememberRecent(icon, { style, filled, color });
  }
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

function createTile(icon, options = {}, tileContext = {}) {
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
  button.addEventListener("dragstart", (event) => primeDragData(event, icon, tileOptions, tileContext));

  hydrateTile(button, icon, tileOptions);
  return button;
}

function renderRecents() {
  recentsGrid.replaceChildren();
  const validRecents = recents.map((recent) => ({ recent, icon: iconByName(recent.name) })).filter((entry) => entry.icon);
  recentsSection.hidden = validRecents.length === 0;

  const fragment = document.createDocumentFragment();
  for (const { recent, icon } of validRecents) {
    fragment.append(createTile(icon, recent, { remember: false }));
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
