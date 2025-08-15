// Prefix /api/* and /uploads/* with window.__API_BASE__ when running locally.
// This makes your existing relative fetch() calls work in local dev.
(function () {
  const BASE = window.__API_BASE__ || "";
  if (!BASE) return;

  const origFetch = window.fetch;
  window.fetch = function (input, init) {
    if (typeof input === "string") {
      if (input.startsWith("/api/") || input.startsWith("/uploads/")) {
        input = BASE + input;
      }
    } else if (input && input.url && typeof input.url === "string") {
      if (input.url.startsWith("/api/") || input.url.startsWith("/uploads/")) {
        input = new Request(BASE + input.url, input);
      }
    }
    return origFetch(input, init);
  };

  // Optional: rewrite <img src="/uploads/..."> that were set directly
  function rewriteImages() {
    document.querySelectorAll('img[src^="/uploads/"]').forEach((img) => {
      img.src = BASE + img.getAttribute("src");
    });
  }
  document.addEventListener("DOMContentLoaded", rewriteImages);
  // Also watch for dynamically added images
  const mo = new MutationObserver(rewriteImages);
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();



