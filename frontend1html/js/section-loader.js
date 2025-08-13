// const API_URL = 'http://localhost:5000/api/sections/demo-user/gym-template-1';

// async function loadSections() {
//   try {
//     const res = await fetch(API_URL);
//     const data = await res.json();

//     const container = document.getElementById('sections-container');

//     // Filter only visible sections and sort by order
//     const sections = data
//       .filter(section => section.visible !== false)
//       .sort((a, b) => a.order - b.order);

//     // Loop through each section and render it
//     sections.forEach((section) => {
//       const div = document.createElement('div');
//       div.className = 'mb-5 p-4 border rounded shadow-sm bg-light';

//       // Basic template rendering
//       switch (section.type) {
//         case 'hero':
//           div.innerHTML = `
//             <h1>${section.content.title || 'Hero Title'}</h1>
//             <p class="lead">${section.content.subtitle || ''}</p>
//           `;
//           break;
//         case 'about':
//           div.innerHTML = `
//             <h2>About Us</h2>
//             <p>${section.content.subtitle || 'About content goes here'}</p>
//           `;
//           break;
//         case 'services':
//           div.innerHTML = `
//             <h2>Our Services</h2>
//             <ul>
//               ${(section.content.services || [])
//                 .map(s => `<li>${s.name}</li>`)
//                 .join('')}
//             </ul>
//           `;
//           break;
//         case 'testimonial':
//           div.innerHTML = `
//             <h2>Testimonials</h2>
//             ${(section.content.testimonials || [])
//               .map(t => `<blockquote><strong>${t.name}:</strong> ${t.message}</blockquote>`)
//               .join('')}
//           `;
//           break;
//         default:
//           div.innerHTML = `
//             <h3>${section.title || 'Untitled Section'}</h3>
//             <p>${JSON.stringify(section.content)}</p>
//           `;
//       }

//       container.appendChild(div);
//     });
//   } catch (err) {
//     console.error('Error loading sections:', err);
//     document.getElementById('sections-container').innerHTML = `<div class="text-danger">Failed to load content</div>`;
//   }
// }

// loadSections();
// C:\Users\97158\Desktop\project1\frontend1html\js\section-loader.js

(function () {
  const USER_ID = 'demo-user';
  const TEMPLATE_ID = 'gym-template-1';
  const API = `http://localhost:5000/api/sections/${USER_ID}/${TEMPLATE_ID}`;

  async function loadSections() {
    try {
      const res = await fetch(API);
      const all = await res.json();

      const sections = all
        .filter((s) => s.visible !== false) // if you support visibility
        .sort((a, b) => a.order - b.order);

      sections.forEach((s) => {
        switch (s.type) {
          case 'hero':
            renderHero(s);
            break;
          case 'about':
            renderAbout(s);
            break;
          case 'why-choose':
            renderWhyChoose(s);
            break;
          case 'services':
            renderServices(s);
            break;
          case 'appointment':
            renderAppointment(s);
            break;
          case 'team':
            renderTeam(s);
            break;
          case 'testimonial':
            renderTestimonials(s);
            break;
          case 'contact':
            renderContactFooter(s);
            break;
          // pages (type === 'page') are handled by page-loader.js, not here
          default:
            // custom or unknown: ignore or handle here
            break;
        }
      });
    } catch (e) {
      console.error('Failed to load sections:', e);
    }
  }

  /* =========================
   * Renderers by type
   * ========================= */

  function renderHero(section) {
    const c = section.content || {};
    const titleEl = document.getElementById('hero-title');
    const imgEl = document.getElementById('hero-image');
    if (titleEl) titleEl.textContent = section.title || c.title || 'Welcome';
    if (imgEl && c.imageUrl) imgEl.src = c.imageUrl;
  }

  function renderAbout(section) {
    const c = section.content || {};
    const titleEl = document.getElementById('about-title');
    const descEl = document.getElementById('about-desc');
    const imgEl = document.getElementById('about-img');
    const bulletsEl = document.getElementById('about-bullets');
    const highlightEl = document.getElementById('about-highlight');

    if (titleEl) titleEl.textContent = section.title || c.title || 'About Us';
    if (descEl) descEl.textContent = c.description || c.subtitle || '';
    if (imgEl && c.imageUrl) imgEl.src = c.imageUrl;
    if (highlightEl) highlightEl.textContent = c.highlight || '';

    if (bulletsEl) {
      bulletsEl.innerHTML = '';
      (c.bullets || []).forEach((b) => {
        const col = document.createElement('div');
        col.className = 'col-sm-6';
        col.innerHTML = `
          <div class="d-flex align-items-center">
            <i class="fa fa-check fa-2x text-primary me-3"></i>
            <h6 class="mb-0">${b}</h6>
          </div>
        `;
        bulletsEl.appendChild(col);
      });
    }
  }

  function renderWhyChoose(section) {
    const c = section.content || {};
    const wrap = document.getElementById('whychoose-wrapper');
    const overlay = document.getElementById('whychoose-overlay');
    const titleEl = document.getElementById('whychoose-title');
    const descEl = document.getElementById('whychoose-desc');
    const statsEl = document.getElementById('whychoose-stats');
    const progressEl = document.getElementById('whychoose-progress');

    if (wrap && c.bgImage) {
      wrap.style.backgroundImage = `url('${c.bgImage}')`;
    }
    if (overlay && typeof c.overlayOpacity === 'number') {
      overlay.style.background = `rgba(0,0,0,${c.overlayOpacity})`;
    }
    if (titleEl) titleEl.textContent = section.title || c.title || 'Why Choose Us';
    if (descEl) descEl.textContent = c.description || '';

    if (statsEl) {
      statsEl.innerHTML = (c.stats || [])
        .map(
          (st) => `
        <div class="col-sm-6">
          <div class="d-flex align-items-center">
            <div class="btn-lg-square bg-primary text-white">${st.icon || '<i class="bi bi-check-lg"></i>'}</div>
            <div class="ms-4">
              <h6 class="text-white text-uppercase mb-1">${st.label || ''}</h6>
              <h4 class="text-white mb-0">${st.value || ''}</h4>
            </div>
          </div>
        </div>`
        )
        .join('');
    }

    if (progressEl) {
      progressEl.innerHTML = (c.progress || [])
        .map(
          (p) => `
        <div class="d-flex justify-content-between">
          <span class="text-white">${p.label || ''}</span>
          <span class="text-white">${p.percent || 0}%</span>
        </div>
        <div class="progress">
          <div class="progress-bar bg-primary" role="progressbar" style="width: ${
            p.percent || 0
          }%"></div>
        </div>
        `
        )
        .join('');
    }
  }

  function renderServices(section) {
    const c = section.content || {};
    const titleEl = document.getElementById('service-title');
    const wrapperEl = document.getElementById('service-wrapper');
    if (titleEl) titleEl.textContent = section.title || c.title || 'Our Services';
    if (wrapperEl) {
      wrapperEl.innerHTML = (c.services || [])
        .map(
          (s) => `
        <div class="col-lg-4 col-md-6 wow fadeInUp">
          <div class="service-item bg-white text-center p-4">
            <img src="${s.icon || 'img/service-1.jpg'}" class="img-fluid mb-3" alt="${s.name || 'Service'}" />
            <h5 class="text-uppercase mb-3">${s.name || ''}</h5>
            <p class="mb-0">${s.description || ''}</p>
          </div>
        </div>
        `
        )
        .join('');
    }
  }

  function renderAppointment(section) {
    const c = section.content || {};
    const titleEl = document.getElementById('appointment-title');
    const descEl = document.getElementById('appointment-description');
    const addrEl = document.getElementById('office-address');
    const timeEl = document.getElementById('office-time');
    const wrap = document.getElementById('appointment-section');

    if (wrap && c.bgImage) {
      wrap.style.backgroundImage = `url('${c.bgImage}')`;
    }
    if (titleEl) titleEl.textContent = section.title || c.title || 'Book Appointment';
    if (descEl) descEl.textContent = c.description || '';
    if (addrEl) addrEl.textContent = c.address || '';
    if (timeEl) timeEl.textContent = c.officeTime || '';
  }

  function renderTeam(section) {
    const c = section.content || {};
    const container = document.querySelector('.team .row.g-4');
    if (!container) return;
    container.innerHTML = (c.members || [])
      .map(
        (m) => `
      <div class="col-lg-3 col-md-6 wow fadeInUp">
        <div class="team-item text-center p-4">
          <img class="img-fluid mb-3" src="${m.photo || 'img/team-1.jpg'}" alt="${m.name || 'Member'}" />
          <h5 class="mb-0">${m.name || ''}</h5>
          <small>${m.role || ''}</small>
        </div>
      </div>
    `
      )
      .join('');
  }

  function renderTestimonials(section) {
    const c = section.content || {};
    const list = c.items || [];
    const carousel = document.getElementById('testimonial-carousel');
    const imgList = document.getElementById('testimonial-image-list');
    if (carousel) {
      carousel.innerHTML = list
        .map(
          (t) => `
        <div class="testimonial-item">
          <p class="fs-5 fst-italic">
            <i class="fa fa-quote-left text-primary me-3"></i>${t.quote || ''}
          </p>
          <div class="d-flex align-items-center">
            <img class="img-fluid flex-shrink-0" src="${t.photo || 'img/testimonial-1.jpg'}" alt="">
            <div class="ps-3">
              <h6 class="text-uppercase text-primary mb-1">${t.name || ''}</h6>
              <small>${t.position || ''}</small>
            </div>
          </div>
        </div>
      `
        )
        .join('');
    }
    if (imgList) {
      imgList.innerHTML = list
        .map((t) => `<img src="${t.photo || 'img/testimonial-1.jpg'}" alt="" />`)
        .join('');
    }
    // If you use Owl Carousel, re-init it here after injecting HTML
    if (window.$ && window.$.fn.owlCarousel && $('#testimonial-carousel').length) {
      $('#testimonial-carousel').owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        items: 1,
        dots: true,
        loop: true,
        margin: 30,
      });
    }
  }

  function renderContactFooter(section) {
    const c = section.content || {};
    const addrEl = document.getElementById('footer-address');
    const phoneEl = document.getElementById('footer-phone');
    const emailEl = document.getElementById('footer-email');
    const twitterEl = document.getElementById('footer-twitter');
    const facebookEl = document.getElementById('footer-facebook');
    const youtubeEl = document.getElementById('footer-youtube');
    const linkedinEl = document.getElementById('footer-linkedin');

    if (addrEl) addrEl.textContent = c.address || addrEl.textContent;
    if (phoneEl) phoneEl.textContent = c.phone || phoneEl.textContent;
    if (emailEl) emailEl.textContent = c.email || emailEl.textContent;

    const showSocial = (el, url) => {
      if (!el) return;
      if (url) {
        el.href = url;
        el.classList.remove('d-none');
      } else {
        el.classList.add('d-none');
      }
    };

    showSocial(twitterEl, c.twitter);
    showSocial(facebookEl, c.facebook);
    showSocial(youtubeEl, c.youtube);
    showSocial(linkedinEl, c.linkedin);
  }

  document.addEventListener('DOMContentLoaded', loadSections);
})();
