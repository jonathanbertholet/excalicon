# Chrome Web Store Listing

## Short Description

Search Google Material Symbols and drag rounded icons directly into Excalidraw.

## Detailed Description

Excalicon adds a focused Chrome side panel for Excalidraw users who want quick access to Google Material Symbols while diagramming.

Open Excalidraw, click the Excalicon toolbar icon, search for a Material Symbol, then drag it onto the canvas. Excalicon inserts the icon where you drop it, so you can keep building diagrams without switching tabs, downloading SVG files, or manually managing icon folders.

Features:

- Search 3,800+ rounded Google Material Symbols
- Drag icons directly into the Excalidraw canvas
- Choose filled or outline variants when available
- Pick the SVG color before dropping
- Works locally in your browser
- No account, tracking, analytics, or external service calls

Excalicon packages the open-source Material Symbols SVG set from Google and runs entirely as a local Chrome extension.

## Category

Productivity

## Language

English

## Permissions Justification

### `sidePanel`

Used to show the searchable icon browser in Chrome’s side panel when the extension toolbar icon is clicked.

### Host Permission: `https://excalidraw.com/*` and `https://*.excalidraw.com/*`

Used only to inject the drag/drop bridge on Excalidraw pages. The bridge converts icons dragged from the side panel into SVG file paste/drop data that Excalidraw can import at the drop location.

### Web Accessible Resources: `icons/rounded/*.svg`

Allows Excalidraw pages to read the SVG icon file that is being dragged from the extension. These resources are limited to Excalidraw origins.

## Data Usage Disclosure

Excalicon does not collect, store, transmit, sell, or share user data.

The extension does not use analytics, remote code, external APIs, cookies, or user accounts. Search queries and color choices stay in the side panel UI and are not persisted or sent anywhere.
