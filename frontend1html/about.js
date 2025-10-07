// about.js

document.addEventListener("DOMContentLoaded", async () => {
  const userId = "demo-user"; // Replace dynamically if needed
  const templateId = "gym-template-1";
  const backendBaseUrl = "http://localhost:5000";

  try {
    const res = await fetch(`${backendBaseUrl}/api/about/${userId}/${templateId}`);
    const data = await res.json();

    if (!data) return;

    // Title
    const titleEl = document.getElementById("about-title");
    if (titleEl && data.title) {
      titleEl.textContent = data.title.trim();
    }

    // Description
    const descEl = document.getElementById("about-desc");
    if (descEl && data.description) {
      descEl.textContent = data.description.trim();
    }

    // Highlight
    const highlightEl = document.getElementById("about-highlight");
    if (highlightEl && data.highlight) {
      highlightEl.textContent = data.highlight.trim();
    }

    // Image
    const imageEl = document.getElementById("about-img");
    if (imageEl && data.imageUrl) {
      imageEl.src = `${backendBaseUrl}/${data.imageUrl.replace(/\\/g, "/")}`;
    }

    // Bullet Points
    const bulletsContainer = document.getElementById("about-bullets");
    if (bulletsContainer && Array.isArray(data.bulletPoints)) {
      bulletsContainer.innerHTML = "";
      data.bulletPoints.forEach((point) => {
        const col = document.createElement("div");
        col.className = "col-12";
        col.innerHTML = `
          <p><i class="fa fa-check-square text-primary me-3"></i>${point.trim()}</p>
        `;
        bulletsContainer.appendChild(col);
      });
    }

  } catch (err) {
    console.error("❌ Failed to load About section", err);
  }
});
