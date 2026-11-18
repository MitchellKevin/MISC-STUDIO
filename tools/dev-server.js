#!/usr/bin/env node
// ------------------------------------------------------------------
// Local dev server — resolves URLs the way GitHub Pages does, so the
// extensionless links (/about, /detail-pages/work/case-study?project=sron)
// work locally too. VS Code Live Server can't do that ("Cannot GET").
//
//   node tools/dev-server.js          → http://localhost:5501
//   PORT=3000 node tools/dev-server.js
//
// /about → about.html, /blog/ → blog/index.html, files as-is.
// Saving any file reloads open pages (a tiny script is injected into
// every HTML response). No dependencies.
// ------------------------------------------------------------------
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT) || 5501;
const IGNORE = /(^|[\\/])(\.git|node_modules|\.next)([\\/]|$)/;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
  '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.pdf': 'application/pdf',
};

const RELOAD = `<script>(function(){var s=new EventSource('/__reload');s.onmessage=function(){location.reload()};})();</script>`;
const clients = new Set();

function isFile(p) {
  try { return fs.statSync(p).isFile(); } catch { return false; }
}

// GitHub Pages order: exact file, then <path>.html, then <path>/index.html
function resolve(urlPath) {
  const p = path.join(ROOT, decodeURIComponent(urlPath));
  if (!p.startsWith(ROOT)) return null;
  if (urlPath.endsWith('/')) return isFile(path.join(p, 'index.html')) ? path.join(p, 'index.html') : null;
  if (isFile(p)) return p;
  if (isFile(p + '.html')) return p + '.html';
  if (isFile(path.join(p, 'index.html'))) return { redirect: urlPath + '/' };
  return null;
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/__reload') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write(': hi\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  const file = resolve(url.pathname);
  if (file && file.redirect) {
    res.writeHead(301, { Location: file.redirect + url.search });
    return res.end();
  }
  if (!file) {
    const notFound = path.join(ROOT, '404.html');
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(isFile(notFound) ? fs.readFileSync(notFound, 'utf8') + RELOAD : `<h1>404</h1><p>${url.pathname}</p>`);
  }

  const ext = path.extname(file).toLowerCase();
  const type = TYPES[ext] || 'application/octet-stream';
  if (ext === '.html') {
    let html = fs.readFileSync(file, 'utf8');
    html = html.includes('</body>') ? html.replace(/<\/body>(?![\s\S]*<\/body>)/, RELOAD + '</body>') : html + RELOAD;
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    return res.end(html);
  }

  // stream everything else; support Range so videos can seek
  const size = fs.statSync(file).size;
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  if (range) {
    const start = range[1] ? Number(range[1]) : size - Number(range[2]);
    const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1, 'Cache-Control': 'no-store' });
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`MISC STUDIO dev server → http://localhost:${PORT}`);
});

// live reload: debounce bursts of saves into one reload
let timer;
fs.watch(ROOT, { recursive: true }, (_event, name) => {
  if (!name || IGNORE.test(name)) return;
  clearTimeout(timer);
  timer = setTimeout(() => clients.forEach((c) => c.write('data: reload\n\n')), 80);
});
