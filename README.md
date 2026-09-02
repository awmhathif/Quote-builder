# Quote Studio

A dependency-light, browser-based quote image designer built with **HTML, CSS and vanilla JavaScript**.

This repository started as a small neon quote canvas experiment. It has been rebuilt into a more complete design tool with a cleaner interface, exact social-media output sizes, reusable templates, local drafts and much stronger typography/background controls.

## Features

- Live high-resolution canvas preview
- Social presets: square, 4:5 portrait, story/reel, landscape and Open Graph
- Custom canvas dimensions up to 4096 × 4096
- Automatic multiline word wrapping
- Quote + author/source fields
- Font family, weight, size, line height and letter spacing
- Adjustable text width, alignment and X/Y position
- Separate quote and author colors
- Optional text shadow with strength control
- Solid, gradient and local image backgrounds
- Gradient direction, image zoom and dark overlay controls
- Four starter design templates
- Undo / redo
- Local draft saving with no account or backend
- PNG and JPEG export at the canvas's real resolution
- Keyboard shortcuts for save and undo/redo

## Run locally

No build step is required.

```bash
git clone https://github.com/awmhathif/Quote-builder.git
cd Quote-builder
```

Open `index.html` in a modern browser, or serve the folder with any static server.

## Privacy

Quote Studio is client-side. Text, uploaded background images and draft data are handled in the browser. Saved drafts use `localStorage`; exporting creates the image locally through the Canvas API.

Google Fonts are loaded from Google when the app is online. The core editor still works with fallback fonts if they are unavailable.

## Tech

- Semantic HTML
- Responsive CSS
- Vanilla JavaScript
- Canvas 2D API
- FileReader API
- localStorage

## Project direction

The point of this project is to keep the editing workflow fast without turning a small quote builder into a heavy design suite. Future improvements should stay focused on typography, composition and export quality rather than adding unrelated features.

Built by [@awmhathif](https://github.com/awmhathif).
