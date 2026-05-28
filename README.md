# Excalicon

Chrome side panel for searching Google Material Symbols and dragging them into Excalidraw.

## Build

```sh
npm install
npm run assets
npm run build
```

Then open `chrome://extensions`, enable Developer Mode, choose **Load unpacked**, and select:

```text
/Users/jonathanbertholet/Documents/Programming/excalicon/dist
```

## Use

1. Open `https://excalidraw.com`.
2. Click the Excalicon toolbar icon to open the side panel.
3. Search for an icon.
4. Drag an icon tile from the side panel onto the Excalidraw canvas.

The extension currently packages the rounded, weight 400 Material Symbols. The fill toggle uses the filled SVG when Google provides one.

For local development, `dist/icons/rounded` is a symlink into `node_modules/@material-symbols/svg-400/rounded` so rebuilds stay fast. Keep `node_modules` in place when loading `dist` as an unpacked extension.

## Package

```sh
npm run package
```

This creates a Chrome Web Store upload ZIP in `release/`.
