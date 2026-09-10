import fs from "node:fs";

const js = fs.readFileSync("dist/widget.js", "utf8");
const css = fs.existsSync("dist/widget.css") ? fs.readFileSync("dist/widget.css", "utf8") : "";
const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><div id="root"></div><script type="module">${js}</script></body></html>`;
fs.writeFileSync("dist/article-cards.html", html);
