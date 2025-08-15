
// document.addEventListener("DOMContentLoaded", async () => {
//   const userId = "demo-user";
//   const templateId = "gym-template-1";

//   const NAVBAR_URL = `http://localhost:5000/api/navbar/${userId}/${templateId}`;
//   const SECTIONS_URL = `http://localhost:5000/api/sections/${userId}/${templateId}`;

//   const navbarElement = document.getElementById("navbarCollapse");

//   const slugify = (str = "") =>
//     str
//       .toLowerCase()
//       .trim()
//       .replace(/[^a-z0-9]+/g, "-")
//       .replace(/^-+|-+$/g, "");

//   const normalizeHref = (href = "") =>
//     href.replace(/^\/|\.html$/g, "").replace("page.html?slug=", "");

//   try {
//     // 1) Fetch configured navbar items
//     const navRes = await fetch(NAVBAR_URL);
//     const navItems = await navRes.json();

//     // 2) Fetch CMS sections and filter pages
//     const sectionsRes = await fetch(SECTIONS_URL);
//     const sections = await sectionsRes.json();
//     const pages = sections
//       .filter((s) => s.type === "page" && s.visible !== false)
//       .sort((a, b) => a.order - b.order)
//       .map((p) => ({
//         label: p.title || p.slug || "Untitled Page",
//         href: `page.html?slug=${p.slug || slugify(p.title || "page")}`,
//       }));

//     // 3) Build navbar container
//     const navContainer = document.createElement("ul");
//     navContainer.className = "navbar-nav";

//     // 4) Render saved CMS navbar items
//     navItems.forEach((item) => {
//       if (item.dropdown && Array.isArray(item.children) && item.children.length > 0) {
//         const dropdown = document.createElement("li");
//         dropdown.className = "nav-item dropdown";

//         const toggle = document.createElement("a");
//         toggle.className = "nav-link dropdown-toggle";
//         toggle.href = "#";
//         toggle.setAttribute("role", "button");
//         toggle.setAttribute("data-bs-toggle", "dropdown");
//         toggle.setAttribute("aria-expanded", "false");
//         toggle.textContent = item.label;

//         const dropdownMenu = document.createElement("ul");
//         dropdownMenu.className = "dropdown-menu";

//         item.children.forEach((child) => {
//           const childLi = document.createElement("li");
//           const childLink = document.createElement("a");
//           childLink.className = "dropdown-item";
//           childLink.textContent = child.label;

//           const path = child.href?.replace(/^\//, "") || "#";
//           // childLink.href = `${path}.html`;
// childLink.href = path.includes("page.html?slug=") ? path : `${path}.html`;

//           childLi.appendChild(childLink);
//           dropdownMenu.appendChild(childLi);
//         });

//         dropdown.appendChild(toggle);
//         dropdown.appendChild(dropdownMenu);
//         navContainer.appendChild(dropdown);
//       } else {
//         const linkItem = document.createElement("li");
//         linkItem.className = "nav-item";

//         const link = document.createElement("a");
//         link.className = "nav-link";
//         link.textContent = item.label;

//         // const path = item.href?.replace(/^\//, "") || "#";
//         // link.href = `${path}.html`;

//         const path = item.href || "#";
// link.href = path.includes("page.html?slug=") ? path : `${path}.html`;


//         linkItem.appendChild(link);
//         navContainer.appendChild(linkItem);
//       }
//     });

//     // 5) Render dynamic CMS pages if not already in navItems
//     pages.forEach((p) => {
//       const alreadyExists = navItems.some(
//         (item) => normalizeHref(item.href) === normalizeHref(p.href)
//       );

//       if (!alreadyExists) {
//         const li = document.createElement("li");
//         li.className = "nav-item";
//         const a = document.createElement("a");
//         a.className = "nav-link";
//         a.href = p.href;
//         a.textContent = p.label;
//         li.appendChild(a);
//         navContainer.appendChild(li);
//       }
//     });

//     // 6) Render final navbar
//     navbarElement.innerHTML = "";
//     navbarElement.appendChild(navContainer);

//     // 7) Add CTA button
//     const quoteDiv = document.createElement("div");
//     quoteDiv.className = "ms-auto d-none d-lg-block";
//     quoteDiv.innerHTML = `<a href="#" class="btn btn-primary py-2 px-3">Get A Quote</a>`;
//     navbarElement.appendChild(quoteDiv);
//   } catch (error) {
//     console.error("❌ Error loading navbar:", error);
//   }
// });


// document.addEventListener("DOMContentLoaded", async () => {
//   const userId = "demo-user";
//   const templateId = "gym-template-1";

//   const BACKEND = "https://project1backend-2xvq.onrender.com"; // ✅ LIVE backend
//   const NAVBAR_URL = `${BACKEND}/api/navbar/${userId}/${templateId}`;
//   const SECTIONS_URL = `${BACKEND}/api/sections/${userId}/${templateId}`;

//   const navbarElement = document.getElementById("navbarCollapse");

//   const slugify = (str = "") =>
//     str
//       .toLowerCase()
//       .trim()
//       .replace(/[^a-z0-9]+/g, "-")
//       .replace(/^-+|-+$/g, "");

//   const normalizeHref = (href = "") =>
//     href.replace(/^\/|\.html$/g, "").replace("page.html?slug=", "");

//   try {
//     // 1) Fetch configured navbar items
//     const navRes = await fetch(NAVBAR_URL);
//     const navItems = await navRes.json();

//     // 2) Fetch CMS sections and filter pages
//     const sectionsRes = await fetch(SECTIONS_URL);
//     const sections = await sectionsRes.json();
//     const pages = sections
//       .filter((s) => s.type === "page" && s.visible !== false)
//       .sort((a, b) => a.order - b.order)
//       .map((p) => ({
//         label: p.title || p.slug || "Untitled Page",
//         href: `page.html?slug=${p.slug || slugify(p.title || "page")}`,
//       }));

//     // 3) Build navbar container
//     const navContainer = document.createElement("ul");
//     navContainer.className = "navbar-nav";

//     // 4) Render saved CMS navbar items
//     navItems.forEach((item) => {
//       if (item.dropdown && Array.isArray(item.children) && item.children.length > 0) {
//         const dropdown = document.createElement("li");
//         dropdown.className = "nav-item dropdown";

//         const toggle = document.createElement("a");
//         toggle.className = "nav-link dropdown-toggle";
//         toggle.href = "#";
//         toggle.setAttribute("role", "button");
//         toggle.setAttribute("data-bs-toggle", "dropdown");
//         toggle.setAttribute("aria-expanded", "false");
//         toggle.textContent = item.label;

//         const dropdownMenu = document.createElement("ul");
//         dropdownMenu.className = "dropdown-menu";

//         item.children.forEach((child) => {
//           const childLi = document.createElement("li");
//           const childLink = document.createElement("a");
//           childLink.className = "dropdown-item";
//           childLink.textContent = child.label;

//           const path = child.href?.replace(/^\//, "") || "#";
//           childLink.href = path.includes("page.html?slug=") ? path : `${path}.html`;

//           childLi.appendChild(childLink);
//           dropdownMenu.appendChild(childLi);
//         });

//         dropdown.appendChild(toggle);
//         dropdown.appendChild(dropdownMenu);
//         navContainer.appendChild(dropdown);
//       } else {
//         const linkItem = document.createElement("li");
//         linkItem.className = "nav-item";

//         const link = document.createElement("a");
//         link.className = "nav-link";
//         link.textContent = item.label;

//         const path = item.href || "#";
//         link.href = path.includes("page.html?slug=") ? path : `${path}.html`;

//         linkItem.appendChild(link);
//         navContainer.appendChild(linkItem);
//       }
//     });

//     // 5) Render dynamic CMS pages if not already in navItems
//     pages.forEach((p) => {
//       const alreadyExists = navItems.some(
//         (item) => normalizeHref(item.href) === normalizeHref(p.href)
//       );

//       if (!alreadyExists) {
//         const li = document.createElement("li");
//         li.className = "nav-item";
//         const a = document.createElement("a");
//         a.className = "nav-link";
//         a.href = p.href;
//         a.textContent = p.label;
//         li.appendChild(a);
//         navContainer.appendChild(li);
//       }
//     });

//     // 6) Render final navbar
//     navbarElement.innerHTML = "";
//     navbarElement.appendChild(navContainer);

//     // 7) Add CTA button
//     const quoteDiv = document.createElement("div");
//     quoteDiv.className = "ms-auto d-none d-lg-block";
//     quoteDiv.innerHTML = `<a href="#" class="btn btn-primary py-2 px-3">Get A Quote</a>`;
//     navbarElement.appendChild(quoteDiv);
//   } catch (error) {
//     console.error("❌ Error loading navbar:", error);
//   }
// });




document.addEventListener("DOMContentLoaded", initNavbar);

async function initNavbar() {
  const userId = "demo-user";
  const templateId = "gym-template-1";

  // Same-origin paths → Vercel rewrites to EC2
  const NAVBAR_URL = `/api/navbar/${userId}/${templateId}`;
  const SECTIONS_URL = `/api/sections/${userId}/${templateId}`;

  const navbarElement = document.getElementById("navbarCollapse");
  if (!navbarElement) return;

  try {
    const [navRes, sectionsRes] = await Promise.all([
      fetch(NAVBAR_URL, { cache: "no-store", headers: { Accept: "application/json" } }),
      fetch(SECTIONS_URL, { cache: "no-store", headers: { Accept: "application/json" } })
    ]);

    if (!navRes.ok) throw new Error(`Navbar HTTP ${navRes.status}`);
    if (!sectionsRes.ok) throw new Error(`Sections HTTP ${sectionsRes.status}`);

    const navItemsRaw = await navRes.json();
    const sectionsRaw = await sectionsRes.json();

    const navItems = Array.isArray(navItemsRaw) ? navItemsRaw : [];
    const sections = Array.isArray(sectionsRaw) ? sectionsRaw : [];

    // Build "pages" list from CMS sections (only visible pages)
    const pages = sections
      .filter((s) => (s.type === "page" || s.type === "PAGE") && s.visible !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((p) => ({
        label: p.title || p.slug || "Untitled Page",
        href: `page.html?slug=${p.slug || slugify(p.title || "page")}`,
      }));

    // Container for nav links
    const navContainer = document.createElement("ul");
    navContainer.className = "navbar-nav";

    // 1) Render saved CMS navbar items
    navItems.forEach((item) => {
      if (item?.dropdown && Array.isArray(item.children) && item.children.length > 0) {
        const dropdown = document.createElement("li");
        dropdown.className = "nav-item dropdown";

        const toggle = document.createElement("a");
        toggle.className = "nav-link dropdown-toggle";
        toggle.href = "#";
        toggle.setAttribute("role", "button");
        toggle.setAttribute("data-bs-toggle", "dropdown");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = item.label || "Menu";

        const dropdownMenu = document.createElement("ul");
        dropdownMenu.className = "dropdown-menu";

        item.children.forEach((child) => {
          const childLi = document.createElement("li");
          const childLink = document.createElement("a");
          childLink.className = "dropdown-item";
          childLink.textContent = child?.label || "Item";
          childLink.href = toHref(child?.href);
          childLi.appendChild(childLink);
          dropdownMenu.appendChild(childLi);
        });

        dropdown.appendChild(toggle);
        dropdown.appendChild(dropdownMenu);
        navContainer.appendChild(dropdown);
      } else {
        const linkItem = document.createElement("li");
        linkItem.className = "nav-item";

        const link = document.createElement("a");
        link.className = "nav-link";
        link.textContent = item?.label || "Item";
        link.href = toHref(item?.href);

        linkItem.appendChild(link);
        navContainer.appendChild(linkItem);
      }
    });

    // 2) Append dynamic CMS pages if not already present
    pages.forEach((p) => {
      const alreadyExists =
        navItems.some((item) => normalizeHref(item?.href) === normalizeHref(p.href)) ||
        Array.from(navContainer.querySelectorAll("a")).some(
          (a) => normalizeHref(a.getAttribute("href")) === normalizeHref(p.href)
        );

      if (!alreadyExists) {
        const li = document.createElement("li");
        li.className = "nav-item";
        const a = document.createElement("a");
        a.className = "nav-link";
        a.href = p.href;
        a.textContent = p.label;
        li.appendChild(a);
        navContainer.appendChild(li);
      }
    });

    // 3) Render final navbar + CTA button
    navbarElement.innerHTML = "";
    navbarElement.appendChild(navContainer);

    const quoteDiv = document.createElement("div");
    quoteDiv.className = "ms-auto d-none d-lg-block";
    quoteDiv.innerHTML = `<a href="#" class="btn btn-primary py-2 px-3">Get A Quote</a>`;
    navbarElement.appendChild(quoteDiv);
  } catch (error) {
    console.error("❌ Error loading navbar:", error);
  }
}

/* ---------- helpers ---------- */

function slugify(str = "") {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Normalize links so we can compare & avoid duplicates
function normalizeHref(href = "") {
  if (!href) return "";
  try {
    // Keep dynamic page links as-is for comparison
    if (href.includes("page.html?slug=")) return href;
    // External links
    if (/^https?:\/\//i.test(href)) return href;
    // Strip leading slash & ".html"
    return href.replace(/^\/+/, "").replace(/\.html$/i, "");
  } catch {
    return href;
  }
}

// Convert CMS-provided hrefs into proper internal/external links
function toHref(href) {
  if (!href) return "#";
  if (/^https?:\/\//i.test(href)) return href;                 // external
  if (href.startsWith("#")) return href;                        // anchor
  if (href.includes("page.html?slug=")) return href;            // dynamic page

  // Internal: strip leading "/" or ".html", then ensure ".html"
  const cleaned = href.replace(/^\/+/, "").replace(/\.html$/i, "");
  return `${cleaned}.html`;
}
