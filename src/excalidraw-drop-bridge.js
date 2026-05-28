const ICON_RESOURCE_PREFIX = chrome.runtime.getURL("icons/rounded/");

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
  const text = dataTransfer.getData("text/plain");
  if (text.trimStart().startsWith("<svg")) {
    return text;
  }

  const url = dataTransfer.getData("text/uri-list");
  if (!url.startsWith(ICON_RESOURCE_PREFIX)) {
    return null;
  }

  const response = await fetch(url);
  return response.ok ? response.text() : null;
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
