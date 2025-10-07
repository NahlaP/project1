// (() => {
//   const BASE  = window.__API_BASE__  || "";             // for localhost -> EC2
//   const PROXY = window.__API_PROXY__ || "/api-proxy.php"; // for cPanel
//   const ABS_API_RE = /^https?:\/\/[^/]+\/api(\/|$)/i;
//   const origFetch = window.fetch;

//   function toProxy(urlLike) {
//     const u = new URL(urlLike, location.origin);          // works for abs/rel
//     const tail = u.pathname.replace(/^\/api/i, "");       // "/sections" etc
//     const qs   = u.search ? "&" + u.search.slice(1) : "";
//     return `${PROXY}?path=${tail}${qs}`;
//   }

//   window.fetch = function (input, init) {
//     try {
//       const url = (typeof input === "string") ? input : input.url;

//       // 1) Local dev: forward /api/* (abs or rel) to BASE (EC2/IP)
//       if (BASE && (url.startsWith("/api/") || ABS_API_RE.test(url))) {
//         const u = new URL(url, location.origin);
//         const forward = `${BASE}${u.pathname}${u.search}`;
//         return (input instanceof Request)
//           ? origFetch(new Request(forward, input), init)
//           : origFetch(forward, init);
//       }

//       // 2) cPanel: rewrite /api/* (abs or rel) to PHP proxy
//       if (!BASE && (url.startsWith("/api/") || ABS_API_RE.test(url))) {
//         const proxyUrl = toProxy(url);
//         return (input instanceof Request)
//           ? origFetch(new Request(proxyUrl, input), init)
//           : origFetch(proxyUrl, init);
//       }
//     } catch (_) {}
//     return origFetch(input, init);
//   };

//   // Optional: in local dev, rewrite <img src="/uploads/...">
//   if (BASE) {
//     const rewriteImages = () =>
//       document.querySelectorAll('img[src^="/uploads/"]').forEach(img => {
//         img.src = BASE + img.getAttribute("src");
//       });
//     document.addEventListener("DOMContentLoaded", rewriteImages);
//     new MutationObserver(rewriteImages)
//       .observe(document.documentElement, { childList: true, subtree: true });
//   }
// })();




























// dev-proxy.js — make /api/* work on both cPanel and localhost
(() => {
  const BASE  = window.__API_BASE__  || "";               // when on localhost
  const PROXY = window.__API_PROXY__ || "/api-proxy.php"; // when on cPanel
  const ABS_API_RE = /^https?:\/\/[^/]+\/api(\/|$)/i;
  const origFetch = window.fetch;

  function toProxy(urlLike) {
    const u = new URL(urlLike, location.origin);
    const tail = u.pathname.replace(/^\/api/i, ""); // "/sections" etc
    const qs   = u.search ? "&" + u.search.slice(1) : "";
    return `${PROXY}?path=${tail}${qs}`;
  }

  window.fetch = function (input, init) {
    try {
      const url = (typeof input === "string") ? input : input.url;

      // Local dev: forward /api/* (abs/rel) to EC2 BASE
      if (BASE && (url.startsWith("/api/") || ABS_API_RE.test(url))) {
        const u = new URL(url, location.origin);
        const forward = `${BASE}${u.pathname}${u.search}`;
        return (input instanceof Request)
          ? origFetch(new Request(forward, input), init)
          : origFetch(forward, init);
      }

      // cPanel: rewrite /api/* to PHP proxy
      if (!BASE && (url.startsWith("/api/") || ABS_API_RE.test(url))) {
        const proxyUrl = toProxy(url);
        return (input instanceof Request)
          ? origFetch(new Request(proxyUrl, input), init)
          : origFetch(proxyUrl, init);
      }
    } catch (_) {}
    return origFetch(input, init);
  };
})();





















