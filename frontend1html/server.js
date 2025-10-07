const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

// ====== CONFIG ======
const BACKEND = 'http://3.109.207.179';     // your API origin
const PORT = 5501;                           // same port you were using
const ROOT = __dirname;                      // serve this folder statically
// ====================

// Proxy all API calls (CORS solved)
app.use('/api', createProxyMiddleware({
  target: BACKEND,
  changeOrigin: true,
  xfwd: true,
  onProxyReq(proxyReq, req) {
    // ensure no caching
    proxyReq.setHeader('cache-control', 'no-store');
  }
}));

// Serve static files (index.html, css, js, img, lib…)
app.use(express.static(ROOT, {
  extensions: ['html'],
  setHeaders(res) {
    res.setHeader('cache-control', 'no-store');
  }
}));
// add below express.static in server.js
const path = require("path");
app.get(["/", "/index.html"], (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`→ http://127.0.0.1:${PORT}/index.html`);
});
