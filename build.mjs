import fs from "node:fs";
import path from "node:path";
import babel from "@babel/core";

const src = fs.readFileSync("index.html", "utf8");
const re = /<script\s+type=["']text\/babel["'][^>]*>([\s\S]*?)<\/script>/i;
const m = src.match(re);
if (!m) {
  throw new Error('No encontré <script type="text/babel"> en index.html. ¿Subiste el archivo original (no el compilado)?');
}

const { code } = babel.transformSync(m[1], {
  presets: ["@babel/preset-react"],
  sourceType: "script",
  babelrc: false,
  configFile: false,
});

let html = src.replace(re, () => "<script>\n" + code + "\n</script>");
html = html.replace(/<script[^>]*babel[^>]*><\/script>\s*/gi, "");
html = html
  .replace(/react\.development\.js/g, "react.production.min.js")
  .replace(/react-dom\.development\.js/g, "react-dom.production.min.js");

fs.mkdirSync("dist", { recursive: true });
fs.writeFileSync(path.join("dist", "index.html"), html);

// Copia imágenes u otros archivos sueltos de la raíz (si los hay)
for (const f of fs.readdirSync(".")) {
  if (/\.(png|jpe?g|svg|ico|webp)$/i.test(f)) fs.copyFileSync(f, path.join("dist", f));
}

console.log("Listo: dist/index.html (" + Math.round(html.length / 1024) + " KB)");
