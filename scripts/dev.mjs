#!/usr/bin/env node
// Local server that mirrors Vercel: static files from the project root, /api/* from the api/ folder.
// Usage: GITHUB_CLIENT_ID=... GITHUB_CLIENT_SECRET=... SESSION_SECRET=... node scripts/dev.mjs [port]
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const port = Number(process.argv[2] || process.env.PORT || 3000);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json", ".xml": "application/xml", ".txt": "text/plain", ".pdf": "application/pdf" };

// Apply vercel.json rewrites (":param" segments) so pretty URLs work locally like on Vercel.
const vercel = JSON.parse(await readFile(join(root, "vercel.json"), "utf8").catch(() => "{}"));
const rewrites = (vercel.rewrites || []).map(r => ({ re: new RegExp("^" + r.source.replace(/:(\w+)/g, "(?<$1>[^/]+)") + "$"), dest: r.destination }));
function rewrite(url) {
  const u = new URL(url, "http://x");
  for (const r of rewrites) {
    const m = u.pathname.match(r.re);
    if (!m) continue;
    let dest = r.dest;
    for (const [k, v] of Object.entries(m.groups || {})) dest = dest.replace(":" + k, encodeURIComponent(v));
    const d = new URL(dest, "http://x");
    u.searchParams.forEach((v, k) => d.searchParams.set(k, v));
    return d.pathname + d.search;
  }
  return url;
}

http.createServer(async (req, res) => {
  req.url = rewrite(req.url);
  const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  try {
    if (path.startsWith("/api/")) {
      const name = path.slice(5).replace(/\/$/, "");
      if (!/^[a-z/]+$/.test(name) || name.split("/").some(p => p.startsWith("_"))) { res.statusCode = 404; return res.end("Not found"); }
      const mod = await import(pathToFileURL(join(root, "api", name + ".js")).href);
      return await mod.default(req, res);
    }
    let file = normalize(join(root, path));
    if (!file.startsWith(root)) { res.statusCode = 403; return res.end(); }
    if ((await stat(file).catch(() => null))?.isDirectory()) file = join(file, "index.html");
    const body = await readFile(file);
    res.setHeader("Content-Type", types[extname(file)] || "application/octet-stream");
    res.end(body);
  } catch (e) {
    res.statusCode = e.code === "ENOENT" || e.code === "ERR_MODULE_NOT_FOUND" ? 404 : 500;
    if (res.statusCode === 500) console.error(e);
    res.end(res.statusCode === 404 ? "Not found" : "Server error");
  }
}).listen(port, () => console.log(`Giverny dev server on http://localhost:${port}`));
