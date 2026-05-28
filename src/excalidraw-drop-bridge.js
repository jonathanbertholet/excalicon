const ICON_RESOURCE_PREFIX = chrome.runtime.getURL("icons/");
const DEFAULT_COLOR = "#1f1f1f";

function normalizeColor(color) {
  return /^#[0-9a-f]{6}$/i.test(color) ? color : DEFAULT_COLOR;
}

function isExcaliconSvgDrop(dataTransfer) {
  if (!dataTransfer) {
    return false;
  }

  const text = dataTransfer.getData("text/plain");
  if (text.trimStart().startsWith("<svg")) {
    return true;
  }

  const url = dataTransfer.getData("text/uri-list");
  return url.startsWith(ICON_RESOURCE_PREFIX);
}

function fileNameFromDrop(dataTransfer) {
  const downloadUrl = dataTransfer.getData("DownloadURL");
  const match = downloadUrl.match(/^image\/svg\+xml:([^:]+):/);

  if (match?.[1]) {
    return match[1];
  }

  const url = dataTransfer.getData("text/uri-list");
  const pathName = url ? new URL(url).pathname : "";
  const baseName = pathName.split("/").pop()?.replace(/-fill\.svg$|\.svg$/g, "");

  return `${baseName || "material-symbol"}.svg`;
}

async function svgFromDrop(dataTransfer) {
  const color = colorFromDrop(dataTransfer);
  const text = dataTransfer.getData("text/plain");
  if (text.trimStart().startsWith("<svg")) {
    return colorizeSvg(text, color);
  }

  const rawUrl = dataTransfer.getData("text/uri-list");
  if (!rawUrl.startsWith(ICON_RESOURCE_PREFIX)) {
    return null;
  }

  const url = new URL(rawUrl);
  url.hash = "";

  const response = await fetch(url.href);
  return response.ok ? colorizeSvg(await response.text(), color) : null;
}

function colorFromDrop(dataTransfer) {
  const explicitColor = dataTransfer.getData("application/x-excalicon-color");
  if (explicitColor) {
    return normalizeColor(explicitColor);
  }

  const rawUrl = dataTransfer.getData("text/uri-list");
  if (!rawUrl.startsWith(ICON_RESOURCE_PREFIX)) {
    return DEFAULT_COLOR;
  }

  const color = new URL(rawUrl).hash.match(/(?:^#|&)color=([^&]+)/)?.[1] ?? "";
  return normalizeColor(decodeURIComponent(color));
}

function setSvgElementFill(svg, color) {
  return svg.replace(/<(path|circle|rect|polygon|polyline|ellipse|line)\b([^>]*)>/g, (match, tag, attributes) => {
    if (/\sfill="none"/i.test(attributes)) {
      return match;
    }

    const isSelfClosing = /\/\s*$/.test(attributes);
    const editableAttributes = attributes.replace(/\s*\/\s*$/, "");
    const nextAttributes = /\sfill="/i.test(editableAttributes)
      ? editableAttributes.replace(/\sfill="[^"]*"/i, ` fill="${color}"`)
      : `${editableAttributes} fill="${color}"`;

    return `<${tag}${nextAttributes}${isSelfClosing ? "/" : ""}>`;
  });
}

function setSvgRootColor(svg, color) {
  return svg.replace(/<svg\b([^>]*)>/, (match, attributes) => {
    const withFill = /\sfill="/i.test(attributes)
      ? attributes.replace(/\sfill="[^"]*"/i, ` fill="${color}"`)
      : `${attributes} fill="${color}"`;
    const withColor = /\scolor="/i.test(withFill)
      ? withFill.replace(/\scolor="[^"]*"/i, ` color="${color}"`)
      : `${withFill} color="${color}"`;

    return `<svg${withColor}>`;
  });
}

function colorizeSvg(svg, color) {
  const resizedSvg = setSvgRootColor(svg, color)
    .replace(/currentColor/g, color)
    .replace(/\swidth="48"/, ' width="24"')
    .replace(/\sheight="48"/, ' height="24"');

  return setSvgElementFill(resizedSvg, color);
}

function getDropTarget(dropPoint) {
  return (
    document.elementFromPoint(dropPoint.clientX, dropPoint.clientY) ||
    document.activeElement ||
    document.body
  );
}

function focusDropSurface(dropPoint) {
  window.focus();

  const target = getDropTarget(dropPoint);
  const focusTarget =
    target.closest?.("[tabindex], canvas, .excalidraw") ||
    (target instanceof HTMLElement ? target : document.body);

  if (!(focusTarget instanceof HTMLElement) || typeof focusTarget.focus !== "function") {
    return () => {};
  }

  const previousTabIndex = focusTarget.getAttribute("tabindex");
  if (previousTabIndex === null) {
    focusTarget.setAttribute("tabindex", "-1");
  }

  focusTarget.focus({ preventScroll: true });

  return () => {
    if (previousTabIndex === null) {
      focusTarget.removeAttribute("tabindex");
    }
  };
}

function dispatchPointerAtDrop(dropPoint) {
  const target = getDropTarget(dropPoint);
  const eventInit = {
    bubbles: true,
    cancelable: true,
    composed: true,
    clientX: dropPoint.clientX,
    clientY: dropPoint.clientY,
    screenX: dropPoint.screenX,
    screenY: dropPoint.screenY,
    pageX: dropPoint.pageX,
    pageY: dropPoint.pageY,
    button: -1,
    buttons: 0,
  };

  target.dispatchEvent(
    new PointerEvent("pointermove", {
      ...eventInit,
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true,
    }),
  );
  target.dispatchEvent(new MouseEvent("mousemove", eventInit));
}

function waitForAnimationFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

async function waitForFrames(count) {
  for (let index = 0; index < count; index += 1) {
    await waitForAnimationFrame();
  }
}

function getDropPoint(event) {
  return {
    clientX: event.clientX,
    clientY: event.clientY,
    screenX: event.screenX,
    screenY: event.screenY,
    pageX: event.pageX,
    pageY: event.pageY,
  };
}

async function dispatchSvgPaste(dropPoint, svg, fileName) {
  const dataTransfer = new DataTransfer();
  const file = new File([svg], fileName, { type: "image/svg+xml" });
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  dataTransfer.items.add(file);
  dataTransfer.setData("image/svg+xml", svg);
  dataTransfer.setData("text/plain", svg);
  dataTransfer.setData("text/html", `<img src="${dataUrl}" alt="${fileName.replace(/\.svg$/i, "")}">`);

  const cleanupFocus = focusDropSurface(dropPoint);
  await waitForFrames(2);

  dispatchPointerAtDrop(dropPoint);
  await waitForAnimationFrame();

  const target = getDropTarget(dropPoint);
  target.focus?.();

  const pasteEvent = new ClipboardEvent("paste", {
    bubbles: true,
    cancelable: true,
    composed: true,
    clipboardData: dataTransfer,
  });

  if (!pasteEvent.clipboardData) {
    Object.defineProperty(pasteEvent, "clipboardData", {
      value: dataTransfer,
    });
  }

  target.dispatchEvent(pasteEvent);
  cleanupFocus();
}

document.addEventListener(
  "drop",
  (event) => {
    const dataTransfer = event.dataTransfer;
    if (!isExcaliconSvgDrop(dataTransfer)) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    const dropPoint = getDropPoint(event);
    const fileName = fileNameFromDrop(dataTransfer);

    svgFromDrop(dataTransfer).then((svg) => {
      if (svg) {
        dispatchSvgPaste(dropPoint, svg, fileName);
      }
    });
  },
  true,
);
