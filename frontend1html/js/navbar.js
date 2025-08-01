
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


document.addEventListener("DOMContentLoaded", async () => {
  const userId = "demo-user";
  const templateId = "gym-template-1";

  const BACKEND = "https://project1backend-2xvq.onrender.com"; // ✅ LIVE backend
  const NAVBAR_URL = `${BACKEND}/api/navbar/${userId}/${templateId}`;
  const SECTIONS_URL = `${BACKEND}/api/sections/${userId}/${templateId}`;

  const navbarElement = document.getElementById("navbarCollapse");

  const slugify = (str = "") =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const normalizeHref = (href = "") =>
    href.replace(/^\/|\.html$/g, "").replace("page.html?slug=", "");

  try {
    // 1) Fetch configured navbar items
    const navRes = await fetch(NAVBAR_URL);
    const navItems = await navRes.json();

    // 2) Fetch CMS sections and filter pages
    const sectionsRes = await fetch(SECTIONS_URL);
    const sections = await sectionsRes.json();
    const pages = sections
      .filter((s) => s.type === "page" && s.visible !== false)
      .sort((a, b) => a.order - b.order)
      .map((p) => ({
        label: p.title || p.slug || "Untitled Page",
        href: `page.html?slug=${p.slug || slugify(p.title || "page")}`,
      }));

    // 3) Build navbar container
    const navContainer = document.createElement("ul");
    navContainer.className = "navbar-nav";

    // 4) Render saved CMS navbar items
    navItems.forEach((item) => {
      if (item.dropdown && Array.isArray(item.children) && item.children.length > 0) {
        const dropdown = document.createElement("li");
        dropdown.className = "nav-item dropdown";

        const toggle = document.createElement("a");
        toggle.className = "nav-link dropdown-toggle";
        toggle.href = "#";
        toggle.setAttribute("role", "button");
        toggle.setAttribute("data-bs-toggle", "dropdown");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = item.label;

        const dropdownMenu = document.createElement("ul");
        dropdownMenu.className = "dropdown-menu";

        item.children.forEach((child) => {
          const childLi = document.createElement("li");
          const childLink = document.createElement("a");
          childLink.className = "dropdown-item";
          childLink.textContent = child.label;

          const path = child.href?.replace(/^\//, "") || "#";
          childLink.href = path.includes("page.html?slug=") ? path : `${path}.html`;

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
        link.textContent = item.label;

        const path = item.href || "#";
        link.href = path.includes("page.html?slug=") ? path : `${path}.html`;

        linkItem.appendChild(link);
        navContainer.appendChild(linkItem);
      }
    });

    // 5) Render dynamic CMS pages if not already in navItems
    pages.forEach((p) => {
      const alreadyExists = navItems.some(
        (item) => normalizeHref(item.href) === normalizeHref(p.href)
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

    // 6) Render final navbar
    navbarElement.innerHTML = "";
    navbarElement.appendChild(navContainer);

    // 7) Add CTA button
    const quoteDiv = document.createElement("div");
    quoteDiv.className = "ms-auto d-none d-lg-block";
    quoteDiv.innerHTML = `<a href="#" class="btn btn-primary py-2 px-3">Get A Quote</a>`;
    navbarElement.appendChild(quoteDiv);
  } catch (error) {
    console.error("❌ Error loading navbar:", error);
  }
});
