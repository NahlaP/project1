















// works fine reorder working


// /* ===================== BAYONE CMS CONFIG (local dev) ===================== */
// /* talk straight to your local backend (no PHP proxy needed for dev) */
// window.BACKEND_ORIGIN   = "http://127.0.0.1:5000";

// /* use the *same* userId you use in the dashboard (lib/config.js -> userId) */
// window.APP_USER_ID      = "demo-user";

// /* the template you’re editing in the dashboard */
// window.APP_TEMPLATE_ID  = "sir-template-1";

// /* (only needed if you display uploaded images from S3 — ok to leave as dummy) */
// window.APP_S3_BUCKET    = "project1-uploads-dev";
// window.APP_S3_REGION    = "ap-south-1";

// /* leave CPANEL_BASE empty in local dev; the loader will prefer BACKEND_ORIGIN */
// window.CPANEL_BASE      = "";


// /* ===================== BAYONE CMS BOOT (STRICTLY SCOPED) ===================== */
// (() => {
//   'use strict';

//   /* -------- CONFIG -------- */
//   const BACKEND = (window.BACKEND_ORIGIN || '').replace(/\/+$/, '');
//   const USER_ID = window.APP_USER_ID || 'demo-user';
//   const TPL_ID  = window.APP_TEMPLATE_ID || 'sir-template-1';

//   const DEBUG = false;
//   const log  = (...a) => DEBUG && console.log('[Bayone CMS]', ...a);
//   const warn = (...a) => console.warn('[Bayone CMS]', ...a);
//   const oops = (e)   => console.error('[Bayone CMS] Failed:', e);

//   if (!BACKEND) warn('BACKEND_ORIGIN is not set. Define it in cms-boot.js');

//   /* -------- HELPERS -------- */
//   async function getJson(url) {
//     const res = await fetch(url, { credentials: 'omit', cache: 'no-store' });
//     if (!res.ok) throw new Error(`${res.status} ${res.statusText} @ ${url}`);
//     return res.json();
//   }
//   const arr = (x) => Array.isArray(x) ? x : (Array.isArray(x?.data) ? x.data : []);

//   // URL helpers
//   const ABS_RX = /^(https?:)?\/\//i;
//   function toAbsUrl(u) {
//     const s = String(u || '').trim();
//     if (!s) return '';
//     if (ABS_RX.test(s)) return s;
//     if (!BACKEND) return s;
//     const clean = s.replace(/^\/+/, '');
//     return `${BACKEND}/${clean}`;
//   }
//   function resolveMediaUrl(u) {
//     const s = String(u || '').trim();
//     if (!s) return '';
//     if (ABS_RX.test(s)) return s;
//     if (s.startsWith('assets/') || s.startsWith('/assets/')) return s; // theme assets stay local
//     return toAbsUrl(s);
//   }

//   // DOM helpers (scoped)
//   const $  = (s, root = document) => { try { return root.querySelector(s); } catch { return null; } };
//   const $$ = (s, root = document) => { try { return Array.from(root.querySelectorAll(s)); } catch { return []; } };

//   function setText(selOrEl, val, root = document) {
//     if (val == null) return;
//     const el = typeof selOrEl === 'string' ? $(selOrEl, root) : selOrEl;
//     if (el) el.textContent = String(val).trim();
//   }
//   function setImg(elOrSel, src) {
//     const el = typeof elOrSel === 'string' ? $(elOrSel) : elOrSel;
//     if (!el) return;
//     if (src) {
//       el.removeAttribute('srcset');
//       el.removeAttribute('sizes');
//       el.setAttribute('src', src);
//       el.setAttribute('data-src', src);
//       el.setAttribute('data-lazy', src);
//       el.loading = 'eager';
//       el.style.display = '';
//     } else {
//       el.removeAttribute('src');
//       el.removeAttribute('data-src');
//       el.removeAttribute('data-lazy');
//       el.style.display = '';
//     }
//   }
//   function setAttr(sel, attr, val, root = document) {
//     const el = $(sel, root); if (!el) return;
//     if (val == null || val === '') el.removeAttribute(attr);
//     else el.setAttribute(attr, val);
//   }

//   function hideVideo(el) {
//     if (!el) return;
//     try { el.pause(); } catch {}
//     const src = $('source', el);
//     if (src) { try { src.removeAttribute('src'); } catch {} }
//     el.removeAttribute('poster');
//     el.style.display = 'none';
//     try { el.load && el.load(); } catch {}
//   }
//   const looksLikeVideo = (u) => /\.(mp4|webm|ogg)(\?|#|$)/i.test(String(u || ''));

//   /* -------- SECTION ROOTS (STRICT SCOPING) -------- */
//   const SECTION_ROOTS = {
//     hero:     ['.land-header'],
//     about:    ['section.about'],
//     projects: ['section.works', 'section.projects'],
//     marquee:  ['section.marquee', '.marq'],
//     brands:   ['section.brands', '.clients', '.clients-carso'],
//     services: ['section.services', '.accordion', '.services'],
//     blog:     ['section.blog-list'],
//     contact:  ['section.contact', '#contact'],
//     footer:   ['footer .footer-container', 'footer'],
//   };

//   function getRoot(type) {
//     const sels = SECTION_ROOTS[type] || [];
//     for (const sel of sels) {
//       const el = document.querySelector(sel);
//       if (el) return el;
//     }
//     return null;
//   }

//   /* -------- API -------- */
//   const api = {
//     listSections: async (params) => {
//       const qs  = new URLSearchParams(params).toString();
//       const url = `${BACKEND}/api/sections?${qs}`;
//       log('GET', url);
//       return arr(await getJson(url));
//     },
//     getHomePage: async () => {
//       const bySlug = await api.listSections({ userId: USER_ID, templateId: TPL_ID, type: 'page', slug: 'home' });
//       if (bySlug.length) return bySlug[0];
//       const allPages = await api.listSections({ userId: USER_ID, templateId: TPL_ID, type: 'page' });
//       return allPages[0] || null;
//     },
//     getAllForTemplate: async () => api.listSections({ userId: USER_ID, templateId: TPL_ID }),

//     getHero:     async () => getJson(`${BACKEND}/api/hero/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),
//     getAbout:    async () => getJson(`${BACKEND}/api/about/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),
//     getProjects: async () => getJson(`${BACKEND}/api/projects/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),
//     getMarquee:  async () => getJson(`${BACKEND}/api/marquee/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),
//     getBrands:   async () => getJson(`${BACKEND}/api/brands/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),
//     getServices: async () => getJson(`${BACKEND}/api/services/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),
//     getBlogs:    async () => getJson(`${BACKEND}/api/blogs/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),

//     // contact + footer
//     getContact:  async () => getJson(`${BACKEND}/api/contact-info/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),
//     getFooter:   async () => getJson(`${BACKEND}/api/footer/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),
//   };

//   /* === SAFE REORDER (container-scoped, style-neutral) ===================== */
//   const CONTAINER_SELECTORS = [
//     '.main-box',     // usual wrapper for this theme
//     'main',
//     '.page-content',
//     '.main-content'
//   ];

//   function getContainer() {
//     for (const s of CONTAINER_SELECTORS) {
//       const el = document.querySelector(s);
//       if (el) return el;
//     }
//     return null;
//   }

//   // Walk up until the node is a direct child of the container.
//   function getRootInContainer(type, container) {
//     const raw = getRoot(type);
//     if (!raw || !container) return null;
//     let el = raw;
//     while (el && el.parentElement && el.parentElement !== container) {
//       el = el.parentElement;
//     }
//     return (el && el.parentElement === container) ? el : null;
//   }

//   // pageSections = [{ type, ... , order }, ...] already sorted by .order
//   function reorderDomByDashboardOrder(pageSections) {
//     try {
//       if (window.CMS_DISABLE_REORDER) return;            // emergency off-switch
//       if (!Array.isArray(pageSections) || pageSections.length < 2) return;

//       const container = getContainer();
//       if (!container) return;

//       const nodesInOrder = [];
//       const seen = new Set();

//       pageSections.forEach(s => {
//         const type = String(s.type || '').toLowerCase();
//         if (!SECTION_ROOTS[type]) return;               // move only known section roots
//         const node = getRootInContainer(type, container);
//         if (node && !seen.has(node)) {
//           nodesInOrder.push(node);
//           seen.add(node);
//         }
//       });

//       if (nodesInOrder.length < 2) return;

//       const frag = document.createDocumentFragment();
//       nodesInOrder.forEach(n => frag.appendChild(n));
//       container.appendChild(frag);                      // single reflow
//     } catch (e) {
//       console.warn('[Bayone CMS] safe reorder skipped:', e);
//     }
//   }
//   /* ====================================================================== */

//   /* =================== HERO =================== */
//   function applyHeroMedia(root, { heading, imgUrl, videoUrl, posterUrl }) {
//     if (!root) return;
//     setText('.caption h1', heading, root);

//     const video  = $('.hero-video', root) || $('video', root);
//     const source = $('.hero-source', root) || (video ? $('source', video) : null);
//     const imgEl  = $('img', root);

//     if (video && source && looksLikeVideo(videoUrl)) {
//       if (posterUrl) video.setAttribute('poster', posterUrl);
//       source.setAttribute('src', videoUrl);
//       try { video.load(); } catch {}
//       video.style.display = '';
//       if (imgEl) imgEl.style.display = 'none';
//       return;
//     }
//     hideVideo(video);
//     if (imgEl) {
//       if (imgUrl) { setImg(imgEl, resolveMediaUrl(imgUrl)); imgEl.style.display = ''; }
//       else { imgEl.removeAttribute('src'); imgEl.style.display = ''; }
//     }
//   }
//   function applyHeroFromSection(root, section) {
//     if (!root || !section) return;
//     const heading   = section.content?.heading ?? section.title ?? section.content?.headline ?? '';
//     const imgUrl    = section.content?.imageUrl || section.content?.image || '';
//     const videoUrl  = section.content?.videoUrl || '';
//     const posterUrl = section.content?.posterUrl || '';
//     applyHeroMedia(root, { heading, imgUrl, videoUrl, posterUrl });
//   }
//   async function applyHero(section) {
//     const root = getRoot('hero'); if (!root) return;
//     try {
//       const hero = await api.getHero();
//       const heading  = (hero?.content || '').trim();
//       const imgUrl   = hero?.imageUrl || '';
//       const videoUrl = hero?.videoUrl || '';
//       const poster   = hero?.posterUrl || '';
//       if (heading || imgUrl || videoUrl || poster) {
//         applyHeroMedia(root, { heading, imgUrl, videoUrl, posterUrl: poster });
//         return;
//       }
//     } catch (e) { log('No hero override;', e?.message || e); }
//     applyHeroFromSection(root, section);
//   }

//   /* =================== ABOUT =================== */
//   async function applyAbout() {
//     const root = getRoot('about'); if (!root) return;
//     try {
//       const about = await api.getAbout();
//       if (!about) return;
//       setText('.sec-head .sub-title', about.subtitle || '- About Us', root);
//       // lines/title into existing .text-reval spans if present
//       const wrap = $('.intro .text-reval', root);
//       const lines = Array.isArray(about.lines) && about.lines.length
//         ? about.lines
//         : (about.title ? String(about.title).split(/\n+/) : []);
//       if (wrap) {
//         let spans = $$('.text', wrap);
//         if (!spans.length) { const s = document.createElement('span'); s.className='text'; wrap.appendChild(s); spans=[s]; }
//         spans.forEach((sp,i)=> sp.textContent = lines[i] ? String(lines[i]) : (i===0? (lines[0]||'') : '') );
//       }
//       // media: if a video URL, show video in .vid-intro, else hide
//       const vidWrap = $('.vid-intro', root);
//       const v = $('video', vidWrap || root);
//       const s = v ? $('source', v) : null;
//       const media = about.imageUrl || '';
//       if (looksLikeVideo(media) && v && s) {
//         s.setAttribute('src', media);
//         try { v.load(); } catch {}
//         v.style.display = '';
//         if (vidWrap) vidWrap.style.display = '';
//       } else {
//         hideVideo(v);
//         if (vidWrap) { vidWrap.style.display = ''; }
//       }
//       // services inline
//       const rows = $$('.serv-inline .item', root);
//       const services = Array.isArray(about.services) ? about.services : [];
//       rows.forEach((row,i)=>{
//         const data = services[i];
//         if (!data) return;
//         const numWrap = row.querySelector('.opacity-8');
//         let tagEl = row.querySelector('.text-u.ml-5') || (numWrap && numWrap.querySelector('.text-u')) || (numWrap && numWrap.querySelector('span:last-child'));
//         const titleEl = row.querySelector('h5') || row.querySelector('.cont h5') || row.querySelector('.d-flex h5');
//         const linkEl  = row.querySelector('a.animsition-link') || row.querySelector('a[href]');
//         if (tagEl)   tagEl.textContent   = String(data.tag ?? data.category ?? '');
//         if (titleEl) titleEl.textContent = String(data.title ?? data.heading  ?? '');
//         if (linkEl)  linkEl.setAttribute('href', String(data.href || '#'));
//       });
//     } catch(e){ log('about error', e?.message||e); }
//   }

//   /* =================== PROJECTS =================== */
//   async function applyProjects() {
//     const root = getRoot('projects'); if (!root) return;
//     try {
//       const payload = await api.getProjects();
//       const items  = Array.isArray(payload?.projects) ? payload.projects : [];
//       const panels = $$('.panel', root);
//       panels.forEach((panel,i)=>{
//         const data = items[i] || {};
//         const box  = panel.querySelector('.img');
//         const img  = box ? box.querySelector('img') : null;
//         const abs  = resolveMediaUrl(data.imageUrl || '');
//         if (img) setImg(img, abs || '');
//         const tagEl = panel.querySelector('.cont span');
//         const h5    = panel.querySelector('.cont h5');
//         const year  = panel.querySelector('.cont .ml-auto h6') || panel.querySelector('.cont h6');
//         const link  = panel.querySelector('a.link-overlay');
//         if (tagEl) tagEl.textContent = String(data.tag || '');
//         if (h5)    h5.textContent    = String(data.title || '');
//         if (year)  year.textContent  = String(data.year || '');
//         if (link)  link.setAttribute('href', String(data.href || '#'));
//       });
//     } catch(e){ log('projects error', e?.message||e); }
//   }

//   /* =================== MARQUEE =================== */
//   async function applyMarquee() {
//     const root = getRoot('marquee'); if (!root) return;
//     try {
//       const payload = await api.getMarquee();
//       const items = Array.isArray(payload?.items)
//         ? payload.items.map(x => ({ text: String(x?.text || ''), icon: String(x?.icon || '*') }))
//         : [];
//       if (!items.length) return;
//       const boxes = $$('.main-marq .slide-har .box', root);
//       boxes.forEach((box) => {
//         const itemNodes = $$('.item', box);
//         itemNodes.forEach((node,i)=>{
//           const data = items[i % items.length];
//           const h4 = $('h4', node);
//           const spans = h4 ? Array.from(h4.querySelectorAll('span')) : [];
//           const textEl = spans.find(s=>!s.classList.contains('icon')) || spans[0] || null;
//           const iconEl = spans.find(s=> s.classList.contains('icon')) || null;
//           if (textEl) textEl.textContent = data.text;
//           if (iconEl) iconEl.textContent = data.icon;
//         });
//       });
//     } catch(e){ log('marquee error', e?.message||e); }
//   }

//   /* =================== BRANDS =================== */
//   async function applyBrands() {
//     const root = getRoot('brands'); if (!root) return;
//     const carso = root.classList.contains('clients-carso') ? root : $('.clients-carso', root) || root;
//     try {
//       const payload = await api.getBrands();
//       const items = Array.isArray(payload?.items) ? payload.items : [];
//       if (!items.length) return;

//       const wrapper = $('.swiper-wrapper', carso);
//       if (!wrapper) return;
//       let slides = $$('.swiper-slide', wrapper);
//       if (slides.length < items.length && slides.length) {
//         const tpl = slides[slides.length - 1];
//         for (let i = slides.length; i < items.length; i++) wrapper.appendChild(tpl.cloneNode(true));
//         slides = $$('.swiper-slide', wrapper);
//       }
//       slides.forEach((slide,i)=>{
//         const data = items[i];
//         if (!data) { slide.style.display='none'; return; }
//         slide.style.display='';
//         const a = slide.querySelector('a[href]') || slide.querySelector('a');
//         const img = slide.querySelector('img');
//         if (a) a.setAttribute('href', String(data.href || '#'));
//         if (img) { setImg(img, resolveMediaUrl(data.imageUrl || '')); img.setAttribute('alt', String(data.alt || 'Brand')); }
//       });
//       try {
//         if (carso.swiper && typeof carso.swiper.update==='function') carso.swiper.update();
//         else if (wrapper.swiper && typeof wrapper.swiper.update==='function') wrapper.swiper.update();
//       } catch {}
//       window.dispatchEvent(new Event('resize'));
//     } catch(e){ log('brands error', e?.message||e); }
//   }

//   /* =================== SERVICES (accordion) =================== */
//   async function applyServices() {
//     const root = getRoot('services'); if (!root) return;
//     const accRoot = root.matches('.accordion') ? root : $('.accordion', root) || root;
//     try {
//       const payload = await api.getServices();
//       const items = Array.isArray(payload?.services) ? payload.services : [];
//       if (!items.length) return;
//       const wrapper = accRoot;
//       let rows = $$('.item', wrapper);
//       if (rows.length < items.length && rows.length) {
//         const tpl = rows[rows.length - 1];
//         for (let i = rows.length; i < items.length; i++) wrapper.appendChild(tpl.cloneNode(true));
//         rows = $$('.item', wrapper);
//       }
//       rows.forEach((row,i)=>{
//         const data = items[i];
//         if (!data) { row.style.display='none'; return; }
//         row.style.display='';
//         const h4 = row.querySelector('.title h4') || row.querySelector('h4');
//         const p  = row.querySelector('.accordion-info p') || row.querySelector('.accordion-info') || row.querySelector('p');
//         const delay = String(data.delay || `.${Math.min(i + 1, 9)}s`);
//         row.setAttribute('data-wow-delay', delay);
//         if (h4) h4.textContent = String(data.title || '');
//         if (p)  p.textContent  = String(data.description || '');
//       });
//     } catch(e){ log('services error', e?.message||e); }
//   }

//   /* =================== BLOG (pop-out preserved, strictly scoped) =================== */
//   function ensureBlogHoverFallback(row) {
//     if (!row || row.__cmsHoverBound) return;
//     row.__cmsHoverBound = true;

//     row.style.position = row.style.position || "relative";

//     let holder = row.querySelector(":scope > .cms-pop-holder");
//     if (!holder) {
//       holder = document.createElement("div");
//       holder.className = "cms-pop-holder";
//       Object.assign(holder.style, {
//         position: "absolute", left: "0px", top: "0px",
//         width: "0px", height: "0px", pointerEvents: "none", zIndex: "5",
//       });
//       row.appendChild(holder);
//     }

//     let img = holder.querySelector("img.cms-pop");
//     if (!img) {
//       img = document.createElement("img");
//       img.className = "cms-pop";
//       Object.assign(img.style, {
//         position: "absolute", top: "50%", left: "50%",
//         transform: "translate(-50%, -50%)", width: "260px", height: "260px",
//         objectFit: "cover", borderRadius: "4px", opacity: "0",
//         transition: "opacity .3s ease", willChange: "opacity",
//         display: "block", zIndex: "10", pointerEvents: "none",
//       });
//       holder.appendChild(img);
//     }

//     const a = row.querySelector("a.block__link");
//     if (!a) return;

//     const titleCol = row.querySelector(".cont");
//     const titleEl  = titleCol && (titleCol.querySelector(".cont h3, .cont .text-u, h3") || titleCol.querySelector("h3"));

//     function placeNearTitle() {
//       const rowBox   = row.getBoundingClientRect();
//       const refEl    = titleEl || titleCol || row;
//       const refBox   = refEl.getBoundingClientRect();
//       const leftPx   = Math.round(refBox.right - rowBox.left + 24);
//       const midY     = (refBox.top + refBox.height / 2);
//       const topPx    = Math.round(midY - rowBox.top);
//       holder.style.left = "0";
//       holder.style.top  = "0";
//       img.style.left    = leftPx + "px";
//       img.style.top     = topPx + "px";
//       img.style.transform = "translateY(-50%)";
//     }

//     row.addEventListener("mouseenter", () => {
//       const u = a.getAttribute("data-img") || "";
//       if (!u) return;
//       if (img.getAttribute("src") !== u) img.setAttribute("src", u);
//       placeNearTitle();
//       img.style.opacity = "1";
//     });
//     row.addEventListener("mouseleave", () => { img.style.opacity = "0"; });

//     window.addEventListener("resize", placeNearTitle, { passive: true });
//     window.addEventListener("scroll", placeNearTitle, { passive: true });
//   }

//   async function applyBlog() {
//     const root = getRoot('blog'); if (!root) return;
//     try {
//       const payload = await api.getBlogs();
//       const posts = Array.isArray(payload?.items)
//         ? payload.items.slice().sort((a,b) => (a.order ?? 0) - (b.order ?? 0))
//         : [];
//       const rows = $$('.item.block', root);
//       if (!rows.length || !posts.length) return;

//       rows.forEach((row, i) => {
//         const p = posts[i];
//         if (!p) { row.style.display = "none"; return; }
//         row.style.display = "";

//         const info = row.querySelector(".info");
//         const h3   = row.querySelector(".cont h3, .cont .text-u, h3");
//         if (info) {
//           let tagEl  = info.querySelector(".tag");
//           if (!tagEl) { tagEl = document.createElement("span"); tagEl.className = "tag"; info.prepend(tagEl); }
//           tagEl.textContent = String(p.tag || "");
//           let dateEl = info.querySelector(".date");
//           if (!dateEl) { dateEl = document.createElement("span"); dateEl.className = "date"; info.appendChild(dateEl); }
//           dateEl.textContent = String(p.date || "");
//         }
//         if (h3) h3.textContent = String(p.title || "");

//         const href = String(p.href || "blog-details.html");
//         const a = row.querySelector("a.block__link");
//         if (a) a.setAttribute("href", href);

//         const rawImg = p.imageUrl || p.presignedUrl || p.imageKey || "";
//         const imgAbs = /^https?:\/\//i.test(rawImg) ? rawImg : resolveMediaUrl(rawImg);
//         if (a) {
//           if (imgAbs) {
//             a.setAttribute("data-img", imgAbs);
//             const pre = new Image(); pre.decoding = 'async'; pre.src = imgAbs;
//           } else {
//             a.removeAttribute("data-img");
//           }
//         }

//         const strayInline = row.querySelector(":scope > img, .row > img");
//         if (strayInline) strayInline.remove();

//         row.setAttribute("data-wow-delay", String(p.delay || `.${Math.min(i + 2, 9)}`));
//         ensureBlogHoverFallback(row);
//       });

//       try { if (window.HoverImg) window.HoverImg(); } catch {}
//       try { if (window.initHoverImg) window.initHoverImg(); } catch {}
//       try { if (window.three_img_hover) window.three_img_hover(); } catch {}
//       try { document.dispatchEvent(new Event("cms:blogs-updated")); } catch {}
//     } catch(e){ log('blog error', e?.message||e); }
//   }

//   /* =================== CONTACT (SIR form) =================== */
//   async function applyContact() {
//     const root = getRoot('contact'); if (!root) return;

//     let data;
//     try { data = await api.getContact(); }
//     catch (e) { log('contact fetch failed', e?.message||e); return; }

//     const subtitle   = data?.subtitle    ?? '- Contact Us';
//     const strong     = data?.titleStrong ?? 'Get In';
//     const light      = data?.titleLight  ?? 'Touch';
//     const buttonText = data?.buttonText  ?? "Let's Talk";
//     const formAction = data?.formAction  ?? 'https://ui-themez.smartinnovates.net/items/bayone1/contact.php';

//     const subEl = $('.sec-head .sub-title', root);
//     if (subEl) subEl.textContent = subtitle;

//     const titleEl = $('.sec-head h3, .sec-head .text-u, h3', root);
//     if (titleEl) titleEl.innerHTML = `${strong} <span class="f-ultra-light">${light}</span>.`;

//     const formEl = $('form', root);
//     if (formEl && formAction) formEl.setAttribute('action', formAction);

//     const btnTextEl =
//       $('form button .text', root) ||
//       $('form button span', root)  ||
//       $('.butn span', root);
//     if (btnTextEl) btnTextEl.textContent = buttonText;
//   }

//   /* =================== FOOTER =================== */
//   async function applyFooter() {
//     const root = getRoot('footer'); if (!root) return;

//     let data;
//     try { data = await api.getFooter(); }
//     catch (e) { log('footer fetch failed', e?.message||e); return; }

//     // top small line
//     const subTitle = $('.eml .sub-title, .eml h6.sub-title', root);
//     if (subTitle && data?.topSubtitle) subTitle.textContent = data.topSubtitle;

//     // big email
//     const emailA = $('.eml h2 a, .eml .underline a, .eml a', root);
//     if (emailA) {
//       if (data?.emailHref)  emailA.setAttribute('href', data.emailHref);
//       if (data?.emailLabel) emailA.textContent = data.emailLabel;
//     }

//     // logo
//     const logoImg = $('.logo img', root);
//     if (logoImg && data?.logoUrl) {
//       const src = /^assets\//i.test(data.logoUrl) ? data.logoUrl : resolveMediaUrl(data.logoUrl);
//       setImg(logoImg, src);
//     }

//     // social list (center)
//     const socialUl = $('.column ul.rest, .column .rest', root);
//     if (socialUl && Array.isArray(data?.social) && data.social.length) {
//       while (socialUl.children.length < data.social.length) {
//         const li = document.createElement('li');
//         li.className = 'hover-this cursor-pointer';
//         const a  = document.createElement('a');
//         a.className = 'hover-anim';
//         a.href = '#0';
//         a.textContent = '—';
//         li.appendChild(a);
//         socialUl.appendChild(li);
//       }
//       Array.from(socialUl.querySelectorAll('li a')).forEach((a, i) => {
//         const item = data.social[i];
//         if (!item) return;
//         a.textContent = item.label || a.textContent;
//         if (item.href) a.setAttribute('href', item.href);
//       });
//     }

//     // office block (right)
//     const officeP   = $('.column p', root);
//     if (officeP && data?.officeAddress) officeP.textContent = data.officeAddress;

//     const phoneA    = $('.column h5 a, .column .underline a', root);
//     if (phoneA) {
//       if (data?.officePhone)     phoneA.textContent = data.officePhone;
//       if (data?.officePhoneHref) phoneA.setAttribute('href', data.officePhoneHref);
//     }

//     // bottom links (FAQ / Careers / Contact Us)
//     const bottomLinks = $$('.links ul.rest li a', root);
//     if (bottomLinks.length && Array.isArray(data?.links)) {
//       const byLabel = Object.fromEntries((data.links || []).map(l => [(l.label||'').toLowerCase(), l.href||'#']));
//       bottomLinks.forEach((a, idx) => {
//         const label = (a.textContent || '').trim().toLowerCase();
//         const href = byLabel[label] || data.links[idx]?.href;
//         if (href) a.setAttribute('href', href);
//       });
//     }

//     // copyright
//     const copyP = $('.copyright p, .copyright', root);
//     if (copyP && data?.copyrightHtml) copyP.innerHTML = data.copyrightHtml;
//   }

//   /* =================== MAIN =================== */
//   async function run() {
//     log('Boot with', { BACKEND, USER_ID, TPL_ID });
//     const home = await api.getHomePage();
//     if (!home?._id) { warn('No page found for template', TPL_ID); return; }

//     // Load all sections & compute dashboard order for THIS page
//     const all = await api.getAllForTemplate();
//     const pageSections = all
//       .filter(s => String(s.parentPageId) === String(home._id))
//       .sort((a,b) => (a.order ?? 0) - (b.order ?? 0));

//     // 🔀 Apply safe reorder (container-scoped, no style edits)
//     reorderDomByDashboardOrder(pageSections);

//     // Map by type for quick access
//     const byType = (t) => pageSections.find(s => (s.type || '').toLowerCase() === t);

//     // Update content in-place (doesn't move DOM)
//     await applyHero(byType('hero'));
//     await applyAbout();
//     await applyProjects();
//     await applyMarquee();
//     await applyBrands();
//     await applyServices();
//     await applyBlog();
//     await applyContact();
//     await applyFooter();

//     window.dispatchEvent(new Event('resize'));
//   }

//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => run().catch(oops));
//   } else {
//     run().catch(oops);
//   }
// })();


























// // ogog
// /* ===================== BAYONE CMS CONFIG (local dev) ===================== */
// window.BACKEND_ORIGIN   = "http://127.0.0.1:5000";
// window.APP_USER_ID      = "demo-user";
// window.APP_TEMPLATE_ID  = "sir-template-1";
// window.APP_S3_BUCKET    = "project1-uploads-dev";
// window.APP_S3_REGION    = "ap-south-1";
// window.CPANEL_BASE      = "";

// /* ===================== BAYONE CMS BOOT (STRICTLY SCOPED) ===================== */
// (() => {
//   'use strict';

//   /* -------- CONFIG -------- */
//   const BACKEND = (window.BACKEND_ORIGIN || '').replace(/\/+$/, '');
//   const USER_ID = window.APP_USER_ID || 'demo-user';
//   const TPL_ID  = window.APP_TEMPLATE_ID || 'sir-template-1';

//   const DEBUG = false;
//   const log  = (...a) => DEBUG && console.log('[Bayone CMS]', ...a);
//   const warn = (...a) => console.warn('[Bayone CMS]', ...a);
//   const oops = (e)   => console.error('[Bayone CMS] Failed:', e);

//   if (!BACKEND) warn('BACKEND_ORIGIN is not set. Define it in cms-boot.js');

//   /* -------- HELPERS -------- */
//   async function getJson(url) {
//     const res = await fetch(url, { credentials: 'omit', cache: 'no-store' });
//     if (!res.ok) throw new Error(`${res.status} ${res.statusText} @ ${url}`);
//     return res.json();
//   }
//   const arr = (x) => Array.isArray(x) ? x : (Array.isArray(x?.data) ? x.data : []);

//   const ABS_RX = /^(https?:)?\/\//i;
//   function toAbsUrl(u) {
//     const s = String(u || '').trim();
//     if (!s) return '';
//     if (ABS_RX.test(s)) return s;
//     if (!BACKEND) return s;
//     const clean = s.replace(/^\/+/, '');
//     return `${BACKEND}/${clean}`;
//   }
//   function resolveMediaUrl(u) {
//     const s = String(u || '').trim();
//     if (!s) return '';
//     if (ABS_RX.test(s)) return s;
//     if (s.startsWith('assets/') || s.startsWith('/assets/')) return s;
//     return toAbsUrl(s);
//   }

//   const $  = (s, root = document) => { try { return root.querySelector(s); } catch { return null; } };
//   const $$ = (s, root = document) => { try { return Array.from(root.querySelectorAll(s)); } catch { return []; } };

//   function setText(selOrEl, val, root = document) {
//     if (val == null) return;
//     const el = typeof selOrEl === 'string' ? $(selOrEl, root) : selOrEl;
//     if (el) el.textContent = String(val).trim();
//   }
//   function setImg(elOrSel, src) {
//     const el = typeof elOrSel === 'string' ? $(elOrSel) : elOrSel;
//     if (!el) return;
//     if (src) {
//       el.removeAttribute('srcset');
//       el.removeAttribute('sizes');
//       el.setAttribute('src', src);
//       el.setAttribute('data-src', src);
//       el.setAttribute('data-lazy', src);
//       el.loading = 'eager';
//       el.style.display = '';
//     } else {
//       el.removeAttribute('src');
//       el.removeAttribute('data-src');
//       el.removeAttribute('data-lazy');
//       el.style.display = '';
//     }
//   }
//   function setAttr(sel, attr, val, root = document) {
//     const el = $(sel, root); if (!el) return;
//     if (val == null || val === '') el.removeAttribute(attr);
//     else el.setAttribute(attr, val);
//   }

//   function hideVideo(el) {
//     if (!el) return;
//     try { el.pause(); } catch {}
//     const src = $('source', el);
//     if (src) { try { src.removeAttribute('src'); } catch {} }
//     el.removeAttribute('poster');
//     el.style.display = 'none';
//     try { el.load && el.load(); } catch {}
//   }
//   const looksLikeVideo = (u) => /\.(mp4|webm|ogg)(\?|#|$)/i.test(String(u || ''));

//   /* -------- SECTION ROOTS (STRICT SCOPING) -------- */
//   const SECTION_ROOTS = {
//     hero:     ['.land-header'],
//     about:    ['section.about'],
//     projects: ['section.works', 'section.projects'],
//     marquee:  ['section.marquee', '.marq'],
//     brands:   ['section.brands', '.clients', '.clients-carso'],
//     services: ['section.services', '.accordion', '.services'],
//     blog:     ['section.blog-list'],
//     contact:  ['section.contact', '#contact'],
//     footer:   ['footer .footer-container', 'footer'],
//   };

//   function getRoot(type) {
//     const sels = SECTION_ROOTS[type] || [];
//     for (const sel of sels) {
//       const el = document.querySelector(sel);
//       if (el) return el;
//     }
//     return null;
//   }

//   /* -------- API -------- */
//   const api = {
//     listSections: async (params) => {
//       const qs  = new URLSearchParams(params).toString();
//       const url = `${BACKEND}/api/sections?${qs}`;
//       log('GET', url);
//       return arr(await getJson(url));
//     },
//     getHomePage: async () => {
//       const bySlug = await api.listSections({ userId: USER_ID, templateId: TPL_ID, type: 'page', slug: 'home' });
//       if (bySlug.length) return bySlug[0];
//       const allPages = await api.listSections({ userId: USER_ID, templateId: TPL_ID, type: 'page' });
//       return allPages[0] || null;
//     },
//     getAllForTemplate: async () => api.listSections({ userId: USER_ID, templateId: TPL_ID }),

//     getHero:     async () => getJson(`${BACKEND}/api/hero/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),
//     getAbout:    async () => getJson(`${BACKEND}/api/about/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),
//     getProjects: async () => getJson(`${BACKEND}/api/projects/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),
//     getMarquee:  async () => getJson(`${BACKEND}/api/marquee/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),
//     getBrands:   async () => getJson(`${BACKEND}/api/brands/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),
//     getServices: async () => getJson(`${BACKEND}/api/services/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),
//     getBlogs:    async () => getJson(`${BACKEND}/api/blogs/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),
//     getContact:  async () => getJson(`${BACKEND}/api/contact-info/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),
//     getFooter:   async () => getJson(`${BACKEND}/api/footer/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),
//   };

//   /* === SAFE REORDER (container-scoped) ==================================== */
//   const CONTAINER_SELECTORS = ['.main-box','main','.page-content','.main-content'];
//   function getContainer() { for (const s of CONTAINER_SELECTORS) { const el = document.querySelector(s); if (el) return el; } return null; }
//   function getRootInContainer(type, container) {
//     const raw = getRoot(type);
//     if (!raw || !container) return null;
//     let el = raw;
//     while (el && el.parentElement && el.parentElement !== container) el = el.parentElement;
//     return (el && el.parentElement === container) ? el : null;
//   }
//   function reorderDomByDashboardOrder(pageSections) {
//     try {
//       if (window.CMS_DISABLE_REORDER) return;
//       if (!Array.isArray(pageSections) || pageSections.length < 2) return;
//       const container = getContainer(); if (!container) return;
//       const nodesInOrder = []; const seen = new Set();
//       pageSections.forEach(s => {
//         const type = String(s.type || '').toLowerCase();
//         if (!SECTION_ROOTS[type]) return;
//         const node = getRootInContainer(type, container);
//         if (node && !seen.has(node)) { nodesInOrder.push(node); seen.add(node); }
//       });
//       if (nodesInOrder.length < 2) return;
//       const frag = document.createDocumentFragment();
//       nodesInOrder.forEach(n => frag.appendChild(n));
//       container.appendChild(frag);
//     } catch (e) { console.warn('[Bayone CMS] safe reorder skipped:', e); }
//   }
//   /* ======================================================================= */

//   /* =================== HERO =================== */

//   function ensureHeroStructure(root) {
//     if (!root) return { mediaWrap:null, video:null, source:null };

//     // add once
//     if (!document.getElementById('cms-hero-css')) {
//       const s = document.createElement('style');
//       s.id = 'cms-hero-css';
//       s.textContent = `
//         /* keep header simple & stacked */
//         .land-header.cms-hero-fixes{display:block!important;padding-bottom:0!important;margin-bottom:0!important;overflow:hidden;}
//         .land-header.cms-hero-fixes > *{float:none!important;}
//         .land-header.cms-hero-fixes .container{position:relative;z-index:2;}

//         /* title block – tighten a bit */
//         .land-header.cms-hero-fixes .caption{margin:0 auto 8px!important;padding:0!important;text-align:center;}

//         /* make hero-media a full-width block UNDER the heading */
//         .land-header.cms-hero-fixes > .hero-media{
//           display:block!important;
//           clear:both!important;
//           width:100%;
//           max-width:1200px;      /* like your static */
//           margin:8px auto 0!important;   /* closer to heading */
//         }

//         /* responsive video */
//         .land-header.cms-hero-fixes > .hero-media video{
//           display:block!important;
//           width:100%!important;
//           height:auto!important;
//           max-height:72vh;       /* prevent huge overflow */
//           object-fit:cover;      /* pleasant crop if poster ratio differs */
//           border-radius:12px;
//         }

//         /* hide any legacy inline image directly under header (the old right column) */
//         .land-header.cms-hero-fixes > img{display:none!important}

//         /* ===== tighten space BEFORE ABOUT (first section) ===== */
//         .land-header.cms-hero-fixes + section,
//         .land-header.cms-hero-fixes + * + section{
//           margin-top:0!important;
//           padding-top:0!important;
//         }

//         /* kill common spacer blocks that sometimes sit after the hero */
//         .land-header.cms-hero-fixes + .spacer,
//         .land-header.cms-hero-fixes + .space,
//         .land-header.cms-hero-fixes + .md-mb80,
//         .land-header.cms-hero-fixes + .md-mb60,
//         .land-header.cms-hero-fixes + .lg-mb80,
//         .land-header.cms-hero-fixes + .pt-100,
//         .land-header.cms-hero-fixes + .pb-100{
//           display:none!important;
//           margin:0!important;
//           padding:0!important;
//           height:0!important;
//           min-height:0!important;
//         }
//       `;
//       document.head.appendChild(s);
//     }
//     root.classList.add('cms-hero-fixes');

//     // 1) ensure the wrapper exists as a DIRECT child of header
//     let mediaWrap = root.querySelector(':scope > .hero-media');
//     if (!mediaWrap) {
//       mediaWrap = document.createElement('div');
//       mediaWrap.className = 'hero-media';
//       const container = root.querySelector(':scope > .container');
//       if (container && container.nextSibling) {
//         root.insertBefore(mediaWrap, container.nextSibling);
//       } else if (container) {
//         root.appendChild(mediaWrap);
//       } else {
//         root.appendChild(mediaWrap);
//       }
//     }

//     // 2) ensure <video><source></source></video>
//     let video  = mediaWrap.querySelector('video.hero-video');
//     if (!video) {
//       video = document.createElement('video');
//       video.className = 'hero-video';
//       video.setAttribute('playsinline','');
//       video.setAttribute('muted','');
//       video.setAttribute('loop','');
//       video.setAttribute('autoplay','');
//       video.setAttribute('poster','');
//       video.style.display = 'none';
//       mediaWrap.appendChild(video);
//     }

//     let source = video.querySelector('source.hero-source');
//     if (!source) {
//       source = document.createElement('source');
//       source.className = 'hero-source';
//       source.setAttribute('type','video/mp4');
//       video.appendChild(source);
//     }

//     // 3) hide any legacy inline image that might sit directly under header
//     Array.from(root.children).forEach(child => {
//       if (child.tagName === 'IMG' && child !== mediaWrap) child.style.display = 'none';
//     });

//     return { mediaWrap, video, source };
//   }

//   function applyHeroMedia(root, { heading, imgUrl, videoUrl, posterUrl }) {
//     if (!root) return;
//     setText('.caption h1', heading, root);

//     // Make sure structure matches the static template
//     const { video, source } = ensureHeroStructure(root);
//     const imgEl  = $('img', root); // legacy image inside header (hidden by CSS above)

//     if (video && source && looksLikeVideo(videoUrl)) {
//       if (posterUrl) video.setAttribute('poster', posterUrl);
//       source.setAttribute('src', videoUrl);
//       try { video.load(); } catch {}
//       video.style.display = '';
//       if (imgEl) imgEl.style.display = 'none';
//       return;
//     }
//     // No video → keep video hidden (and keep your static image if any)
//     hideVideo(video);
//     if (imgEl) {
//       if (imgUrl) { setImg(imgEl, resolveMediaUrl(imgUrl)); imgEl.style.display = ''; }
//       else { imgEl.style.display = ''; }
//     }
//   }

//   function applyHeroFromSection(root, section) {
//     if (!root || !section) return;
//     const heading   = section.content?.heading ?? section.title ?? section.content?.headline ?? '';
//     const imgUrl    = section.content?.imageUrl || section.content?.image || '';
//     const videoUrl  = section.content?.videoUrl || '';
//     const posterUrl = section.content?.posterUrl || '';
//     applyHeroMedia(root, { heading, imgUrl, videoUrl, posterUrl });
//   }

//   async function applyHero(section) {
//     const root = getRoot('hero'); if (!root) return;
//     try {
//       const hero = await api.getHero();
//       const heading  = (hero?.content || '').trim();
//       const imgUrl   = hero?.imageUrl || '';
//       const videoUrl = hero?.videoUrl || '';
//       const poster   = hero?.posterUrl || '';
//       if (heading || imgUrl || videoUrl || poster) {
//         applyHeroMedia(root, { heading, imgUrl, videoUrl, posterUrl: poster });
//         return;
//       }
//     } catch (e) { log('No hero override;', e?.message || e); }
//     applyHeroFromSection(root, section);
//   }

//   /* =================== ABOUT =================== */
//   async function applyAbout() {
//     const root = getRoot('about'); if (!root) return;
//     try {
//       const about = await api.getAbout();
//       if (!about) return;
//       setText('.sec-head .sub-title', about.subtitle || '- About Us', root);
//       const wrap = $('.intro .text-reval', root);
//       const lines = Array.isArray(about.lines) && about.lines.length ? about.lines : (about.title ? String(about.title).split(/\n+/) : []);
//       if (wrap) {
//         let spans = $$('.text', wrap);
//         if (!spans.length) { const s = document.createElement('span'); s.className='text'; wrap.appendChild(s); spans=[s]; }
//         spans.forEach((sp,i)=> sp.textContent = lines[i] ? String(lines[i]) : (i===0? (lines[0]||'') : '') );
//       }
//       const vidWrap = $('.vid-intro', root);
//       const v = $('video', vidWrap || root);
//       const s = v ? $('source', v) : null;
//       const media = about.imageUrl || '';
//       if (looksLikeVideo(media) && v && s) {
//         s.setAttribute('src', media);
//         try { v.load(); } catch {}
//         v.style.display = '';
//         if (vidWrap) vidWrap.style.display = '';
//       } else {
//         hideVideo(v);
//         if (vidWrap) { vidWrap.style.display = ''; }
//       }
//       const rows = $$('.serv-inline .item', root);
//       const services = Array.isArray(about.services) ? about.services : [];
//       rows.forEach((row,i)=>{
//         const data = services[i];
//         if (!data) return;
//         const numWrap = row.querySelector('.opacity-8');
//         let tagEl = row.querySelector('.text-u.ml-5') || (numWrap && numWrap.querySelector('.text-u')) || (numWrap && numWrap.querySelector('span:last-child'));
//         const titleEl = row.querySelector('h5') || row.querySelector('.cont h5') || row.querySelector('.d-flex h5');
//         const linkEl  = row.querySelector('a.animsition-link') || row.querySelector('a[href]');
//         if (tagEl)   tagEl.textContent   = String(data.tag ?? data.category ?? '');
//         if (titleEl) titleEl.textContent = String(data.title ?? data.heading  ?? '');
//         if (linkEl)  linkEl.setAttribute('href', String(data.href || '#'));
//       });
//     } catch(e){ log('about error', e?.message||e); }
//   }

//   /* =================== PROJECTS =================== */
//   async function applyProjects() {
//     const root = getRoot('projects'); if (!root) return;
//     try {
//       const payload = await api.getProjects();
//       const items  = Array.isArray(payload?.projects) ? payload.projects : [];
//       const panels = $$('.panel', root);
//       panels.forEach((panel,i)=>{
//         const data = items[i] || {};
//         const box  = panel.querySelector('.img');
//         const img  = box ? box.querySelector('img') : null;
//         const abs  = resolveMediaUrl(data.imageUrl || '');
//         if (img) setImg(img, abs || '');
//         const tagEl = panel.querySelector('.cont span');
//         const h5    = panel.querySelector('.cont h5');
//         const year  = panel.querySelector('.cont .ml-auto h6') || panel.querySelector('.cont h6');
//         const link  = panel.querySelector('a.link-overlay');
//         if (tagEl) tagEl.textContent = String(data.tag || '');
//         if (h5)    h5.textContent    = String(data.title || '');
//         if (year)  year.textContent  = String(data.year || '');
//         if (link)  link.setAttribute('href', String(data.href || '#'));
//       });
//     } catch(e){ log('projects error', e?.message||e); }
//   }

//   /* =================== MARQUEE =================== */
//   async function applyMarquee() {
//     const root = getRoot('marquee'); if (!root) return;
//     try {
//       const payload = await api.getMarquee();
//       const items = Array.isArray(payload?.items)
//         ? payload.items.map(x => ({ text: String(x?.text || ''), icon: String(x?.icon || '*') }))
//         : [];
//       if (!items.length) return;
//       const boxes = $$('.main-marq .slide-har .box', root);
//       boxes.forEach((box) => {
//         const itemNodes = $$('.item', box);
//         itemNodes.forEach((node,i)=>{
//           const data = items[i % items.length];
//           const h4 = $('h4', node);
//           const spans = h4 ? Array.from(h4.querySelectorAll('span')) : [];
//           const textEl = spans.find(s=>!s.classList.contains('icon')) || spans[0] || null;
//           const iconEl = spans.find(s=> s.classList.contains('icon')) || null;
//           if (textEl) textEl.textContent = data.text;
//           if (iconEl) iconEl.textContent = data.icon;
//         });
//       });
//     } catch(e){ log('marquee error', e?.message||e); }
//   }

//   /* =================== BRANDS =================== */
//   async function applyBrands() {
//     const root = getRoot('brands'); if (!root) return;
//     const carso = root.classList.contains('clients-carso') ? root : $('.clients-carso', root) || root;
//     try {
//       const payload = await api.getBrands();
//       const items = Array.isArray(payload?.items) ? payload.items : [];
//       if (!items.length) return;

//       const wrapper = $('.swiper-wrapper', carso);
//       if (!wrapper) return;
//       let slides = $$('.swiper-slide', wrapper);
//       if (slides.length < items.length && slides.length) {
//         const tpl = slides[slides.length - 1];
//         for (let i = slides.length; i < items.length; i++) wrapper.appendChild(tpl.cloneNode(true));
//         slides = $$('.swiper-slide', wrapper);
//       }
//       slides.forEach((slide,i)=>{
//         const data = items[i];
//         if (!data) { slide.style.display='none'; return; }
//         slide.style.display='';
//         const a = slide.querySelector('a[href]') || slide.querySelector('a');
//         const img = slide.querySelector('img');
//         if (a) a.setAttribute('href', String(data.href || '#'));
//         if (img) { setImg(img, resolveMediaUrl(data.imageUrl || '')); img.setAttribute('alt', String(data.alt || 'Brand')); }
//       });
//       try {
//         if (carso.swiper && typeof carso.swiper.update==='function') carso.swiper.update();
//         else if (wrapper.swiper && typeof wrapper.swiper.update==='function') wrapper.swiper.update();
//       } catch {}
//       window.dispatchEvent(new Event('resize'));
//     } catch(e){ log('brands error', e?.message||e); }
//   }

//   /* =================== SERVICES (accordion) =================== */
//   async function applyServices() {
//     const root = getRoot('services'); if (!root) return;
//     const accRoot = root.matches('.accordion') ? root : $('.accordion', root) || root;
//     try {
//       const payload = await api.getServices();
//       const items = Array.isArray(payload?.services) ? payload.services : [];
//       if (!items.length) return;
//       const wrapper = accRoot;
//       let rows = $$('.item', wrapper);
//       if (rows.length < items.length && rows.length) {
//         const tpl = rows[rows.length - 1];
//         for (let i = rows.length; i < items.length; i++) wrapper.appendChild(tpl.cloneNode(true));
//         rows = $$('.item', wrapper);
//       }
//       rows.forEach((row,i)=>{
//         const data = items[i];
//         if (!data) { row.style.display='none'; return; }
//         row.style.display='';
//         const h4 = row.querySelector('.title h4') || row.querySelector('h4');
//         const p  = row.querySelector('.accordion-info p') || row.querySelector('.accordion-info') || row.querySelector('p');
//         const delay = String(data.delay || `.${Math.min(i + 1, 9)}s`);
//         row.setAttribute('data-wow-delay', delay);
//         if (h4) h4.textContent = String(data.title || '');
//         if (p)  p.textContent  = String(data.description || '');
//       });
//     } catch(e){ log('services error', e?.message||e); }
//   }

//   /* =================== BLOG (pop-out preserved) =================== */
//   function ensureBlogHoverFallback(row) {
//     if (!row || row.__cmsHoverBound) return;
//     row.__cmsHoverBound = true;
//     row.style.position = row.style.position || "relative";
//     let holder = row.querySelector(":scope > .cms-pop-holder");
//     if (!holder) {
//       holder = document.createElement("div");
//       holder.className = "cms-pop-holder";
//       Object.assign(holder.style, {
//         position: "absolute", left: "0px", top: "0px",
//         width: "0px", height: "0px", pointerEvents: "none", zIndex: "5",
//       });
//       row.appendChild(holder);
//     }
//     let img = holder.querySelector("img.cms-pop");
//     if (!img) {
//       img = document.createElement("img");
//       img.className = "cms-pop";
//       Object.assign(img.style, {
//         position: "absolute", top: "50%", left: "50%",
//         transform: "translate(-50%, -50%)", width: "260px", height: "260px",
//         objectFit: "cover", borderRadius: "4px", opacity: "0",
//         transition: "opacity .3s ease", willChange: "opacity",
//         display: "block", zIndex: "10", pointerEvents: "none",
//       });
//       holder.appendChild(img);
//     }
//     const a = row.querySelector("a.block__link");
//     if (!a) return;
//     const titleCol = row.querySelector(".cont");
//     const titleEl  = titleCol && (titleCol.querySelector(".cont h3, .cont .text-u, h3") || titleCol.querySelector("h3"));
//     function placeNearTitle() {
//       const rowBox   = row.getBoundingClientRect();
//       const refEl    = titleEl || titleCol || row;
//       const refBox   = refEl.getBoundingClientRect();
//       const leftPx   = Math.round(refBox.right - rowBox.left + 24);
//       const midY     = (refBox.top + refBox.height / 2);
//       const topPx    = Math.round(midY - rowBox.top);
//       holder.style.left = "0";
//       holder.style.top  = "0";
//       img.style.left    = leftPx + "px";
//       img.style.top     = topPx + "px";
//       img.style.transform = "translateY(-50%)";
//     }
//     row.addEventListener("mouseenter", () => {
//       const u = a.getAttribute("data-img") || "";
//       if (!u) return;
//       if (img.getAttribute("src") !== u) img.setAttribute("src", u);
//       placeNearTitle();
//       img.style.opacity = "1";
//     });
//     row.addEventListener("mouseleave", () => { img.style.opacity = "0"; });
//     window.addEventListener("resize", placeNearTitle, { passive: true });
//     window.addEventListener("scroll", placeNearTitle, { passive: true });
//   }

//   async function applyBlog() {
//     const root = getRoot('blog'); if (!root) return;
//     try {
//       const payload = await api.getBlogs();
//       const posts = Array.isArray(payload?.items)
//         ? payload.items.slice().sort((a,b) => (a.order ?? 0) - (b.order ?? 0))
//         : [];
//       const rows = $$('.item.block', root);
//       if (!rows.length || !posts.length) return;
//       rows.forEach((row, i) => {
//         const p = posts[i];
//         if (!p) { row.style.display = "none"; return; }
//         row.style.display = "";
//         const info = row.querySelector(".info");
//         const h3   = row.querySelector(".cont h3, .cont .text-u, h3");
//         if (info) {
//           let tagEl  = info.querySelector(".tag");
//           if (!tagEl) { tagEl = document.createElement("span"); tagEl.className = "tag"; info.prepend(tagEl); }
//           tagEl.textContent = String(p.tag || "");
//           let dateEl = info.querySelector(".date");
//           if (!dateEl) { dateEl = document.createElement("span"); dateEl.className = "date"; info.appendChild(dateEl); }
//           dateEl.textContent = String(p.date || "");
//         }
//         if (h3) h3.textContent = String(p.title || "");
//         const href = String(p.href || "blog-details.html");
//         const a = row.querySelector("a.block__link");
//         if (a) a.setAttribute("href", href);
//         const rawImg = p.imageUrl || p.presignedUrl || p.imageKey || "";
//         const imgAbs = /^https?:\/\//i.test(rawImg) ? rawImg : resolveMediaUrl(rawImg);
//         if (a) {
//           if (imgAbs) {
//             a.setAttribute("data-img", imgAbs);
//             const pre = new Image(); pre.decoding = 'async'; pre.src = imgAbs;
//           } else {
//             a.removeAttribute("data-img");
//           }
//         }
//         const strayInline = row.querySelector(":scope > img, .row > img");
//         if (strayInline) strayInline.remove();
//         row.setAttribute("data-wow-delay", String(p.delay || `.${Math.min(i + 2, 9)}`));
//         ensureBlogHoverFallback(row);
//       });
//       try { if (window.HoverImg) window.HoverImg(); } catch {}
//       try { if (window.initHoverImg) window.initHoverImg(); } catch {}
//       try { if (window.three_img_hover) window.three_img_hover(); } catch {}
//       try { document.dispatchEvent(new Event("cms:blogs-updated")); } catch {}
//     } catch(e){ log('blog error', e?.message||e); }
//   }

//   /* =================== CONTACT =================== */
//   async function applyContact() {
//     const root = getRoot('contact'); if (!root) return;
//     let data;
//     try { data = await api.getContact(); }
//     catch (e) { log('contact fetch failed', e?.message||e); return; }
//     const subtitle   = data?.subtitle    ?? '- Contact Us';
//     const strong     = data?.titleStrong ?? 'Get In';
//     const light      = data?.titleLight  ?? 'Touch';
//     const buttonText = data?.buttonText  ?? "Let's Talk";
//     const formAction = data?.formAction  ?? 'https://ui-themez.smartinnovates.net/items/bayone1/contact.php';
//     const subEl = $('.sec-head .sub-title', root);
//     if (subEl) subEl.textContent = subtitle;
//     const titleEl = $('.sec-head h3, .sec-head .text-u, h3', root);
//     if (titleEl) titleEl.innerHTML = `${strong} <span class="f-ultra-light">${light}</span>.`;
//     const formEl = $('form', root);
//     if (formEl && formAction) formEl.setAttribute('action', formAction);
//     const btnTextEl =
//       $('form button .text', root) ||
//       $('form button span', root)  ||
//       $('.butn span', root);
//     if (btnTextEl) btnTextEl.textContent = buttonText;
//   }

//   /* =================== FOOTER =================== */
//   async function applyFooter() {
//     const root = getRoot('footer'); if (!root) return;
//     let data;
//     try { data = await api.getFooter(); }
//     catch (e) { log('footer fetch failed', e?.message||e); return; }
//     const subTitle = $('.eml .sub-title, .eml h6.sub-title', root);
//     if (subTitle && data?.topSubtitle) subTitle.textContent = data.topSubtitle;
//     const emailA = $('.eml h2 a, .eml .underline a, .eml a', root);
//     if (emailA) {
//       if (data?.emailHref)  emailA.setAttribute('href', data.emailHref);
//       if (data?.emailLabel) emailA.textContent = data.emailLabel;
//     }
//     const logoImg = $('.logo img', root);
//     if (logoImg && data?.logoUrl) {
//       const src = /^assets\//i.test(data.logoUrl) ? data.logoUrl : resolveMediaUrl(data.logoUrl);
//       setImg(logoImg, src);
//     }
//     const socialUl = $('.column ul.rest, .column .rest', root);
//     if (socialUl && Array.isArray(data?.social) && data.social.length) {
//       while (socialUl.children.length < data.social.length) {
//         const li = document.createElement('li');
//         li.className = 'hover-this cursor-pointer';
//         const a  = document.createElement('a');
//         a.className = 'hover-anim';
//         a.href = '#0';
//         a.textContent = '—';
//         li.appendChild(a);
//         socialUl.appendChild(li);
//       }
//       Array.from(socialUl.querySelectorAll('li a')).forEach((a, i) => {
//         const item = data.social[i];
//         if (!item) return;
//         a.textContent = item.label || a.textContent;
//         if (item.href) a.setAttribute('href', item.href);
//       });
//     }
//     const officeP   = $('.column p', root);
//     if (officeP && data?.officeAddress) officeP.textContent = data.officeAddress;
//     const phoneA    = $('.column h5 a, .column .underline a', root);
//     if (phoneA) {
//       if (data?.officePhone)     phoneA.textContent = data.officePhone;
//       if (data?.officePhoneHref) phoneA.setAttribute('href', data.officePhoneHref);
//     }
//     const bottomLinks = $$('.links ul.rest li a', root);
//     if (bottomLinks.length && Array.isArray(data?.links)) {
//       const byLabel = Object.fromEntries((data.links || []).map(l => [(l.label||'').toLowerCase(), l.href||'#']));
//       bottomLinks.forEach((a, idx) => {
//         const label = (a.textContent || '').trim().toLowerCase();
//         const href = byLabel[label] || data.links[idx]?.href;
//         if (href) a.setAttribute('href', href);
//       });
//     }
//     const copyP = $('.copyright p, .copyright', root);
//     if (copyP && data?.copyrightHtml) copyP.innerHTML = data.copyrightHtml;
//   }

//   /* =================== MAIN =================== */
//   async function run() {
//     log('Boot with', { BACKEND, USER_ID, TPL_ID });
//     const home = await api.getHomePage();
//     if (!home?._id) { warn('No page found for template', TPL_ID); return; }

//     const all = await api.getAllForTemplate();
//     const pageSections = all
//       .filter(s => String(s.parentPageId) === String(home._id))
//       .sort((a,b) => (a.order ?? 0) - (b.order ?? 0));

//     // Safe reorder
//     reorderDomByDashboardOrder(pageSections);

//     const byType = (t) => pageSections.find(s => (s.type || '').toLowerCase() === t);

//     await applyHero(byType('hero'));
//     await applyAbout();
//     await applyProjects();
//     await applyMarquee();
//     await applyBrands();
//     await applyServices();
//     await applyBlog();
//     await applyContact();
//     await applyFooter();

//     window.dispatchEvent(new Event('resize'));
//   }

//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => run().catch(oops));
//   } else {
//     run().catch(oops);
//   }
// })();



























/* ===================== BAYONE CMS CONFIG (local dev) ===================== */
window.BACKEND_ORIGIN   = "http://127.0.0.1:5000";
window.APP_USER_ID      = "demo-user";
window.APP_TEMPLATE_ID  = "sir-template-1";   // keep as-is if your DB uses this
window.APP_S3_BUCKET    = "project1-uploads-dev";
window.APP_S3_REGION    = "ap-south-1";
window.CPANEL_BASE      = "";

/* ===================== BAYONE CMS BOOT (STRICTLY SCOPED) ===================== */
(() => {
  'use strict';

  /* -------- CONFIG -------- */
  const BACKEND = (window.BACKEND_ORIGIN || '').replace(/\/+$/, '');
  const USER_ID = window.APP_USER_ID || 'demo-user';
  const TPL_ID  = window.APP_TEMPLATE_ID || 'sir-template-1';

  const DEBUG = false;
  const log  = (...a) => DEBUG && console.log('[Bayone CMS]', ...a);
  const warn = (...a) => console.warn('[Bayone CMS]', ...a);
  const oops = (e)   => console.error('[Bayone CMS] Failed:', e);

  if (!BACKEND) warn('BACKEND_ORIGIN is not set. Define it in cms-boot.js');

  /* -------- HELPERS -------- */
  async function getJson(url) {
    const res = await fetch(url, { credentials: 'omit', cache: 'no-store' });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} @ ${url}`);
    return res.json();
  }
  const arr = (x) => Array.isArray(x) ? x : (Array.isArray(x?.data) ? x.data : []);

  const ABS_RX = /^(https?:)?\/\//i;
  function toAbsUrl(u) {
    const s = String(u || '').trim();
    if (!s) return '';
    if (ABS_RX.test(s)) return s;
    if (!BACKEND) return s;
    const clean = s.replace(/^\/+/, '');
    return `${BACKEND}/${clean}`;
  }
  function resolveMediaUrl(u) {
    const s = String(u || '').trim();
    if (!s) return '';
    if (ABS_RX.test(s)) return s;
    if (s.startsWith('assets/') || s.startsWith('/assets/')) return s;
    return toAbsUrl(s);
  }

  const $  = (s, root = document) => { try { return root.querySelector(s); } catch { return null; } };
  const $$ = (s, root = document) => { try { return Array.from(root.querySelectorAll(s)); } catch { return []; } };

  // ---------- SAFE TEXT PICKER (prevents [object Object]) ----------
  function pickStr(...candidates) {
    for (const c of candidates) {
      if (typeof c === 'string' && c.trim()) return c.trim();
      if (typeof c === 'number') return String(c);
      if (c && typeof c === 'object') {
        if (typeof c.heading === 'string' && c.heading.trim()) return c.heading.trim();
        if (typeof c.title   === 'string' && c.title.trim())   return c.title.trim();
        if (typeof c.text    === 'string' && c.text.trim())    return c.text.trim();
        if (typeof c.content === 'string' && c.content.trim()) return c.content.trim();
      }
    }
    return '';
  }

  function setText(selOrEl, val, root = document) {
    const el = typeof selOrEl === 'string' ? $(selOrEl, root) : selOrEl;
    if (!el) return;
    el.textContent = pickStr(val);
  }

  function setImg(elOrSel, src) {
    const el = typeof elOrSel === 'string' ? $(elOrSel) : elOrSel;
    if (!el) return;
    if (src) {
      el.removeAttribute('srcset');
      el.removeAttribute('sizes');
      el.setAttribute('src', src);
      el.setAttribute('data-src', src);
      el.setAttribute('data-lazy', src);
      el.loading = 'eager';
      el.style.display = '';
    } else {
      el.removeAttribute('src');
      el.removeAttribute('data-src');
      el.removeAttribute('data-lazy');
      el.style.display = '';
    }
  }
  function setAttr(sel, attr, val, root = document) {
    const el = $(sel, root); if (!el) return;
    const v = pickStr(val);
    if (!v) el.removeAttribute(attr);
    else el.setAttribute(attr, v);
  }

  function hideVideo(el) {
    if (!el) return;
    try { el.pause(); } catch {}
    const src = $('source', el);
    if (src) { try { src.removeAttribute('src'); } catch {} }
    el.removeAttribute('poster');
    el.style.display = 'none';
    try { el.load && el.load(); } catch {}
  }
  const looksLikeVideo = (u) => /\.(mp4|webm|ogg)(\?|#|$)/i.test(String(u || ''));

  /* -------- SECTION ROOTS (STRICT SCOPING) -------- */
  const SECTION_ROOTS = {
    hero:     ['.land-header'],
    about:    ['section.about'],
    projects: ['section.works', 'section.projects'],
    marquee:  ['section.marquee', '.marq'],
    brands:   ['section.brands', '.clients', '.clients-carso'],
    services: ['section.services', '.accordion', '.services'],
    blog:     ['section.blog-list'],
    contact:  ['section.contact', '#contact'],
    footer:   ['footer .footer-container', 'footer'],
  };

  function getRoot(type) {
    const sels = SECTION_ROOTS[type] || [];
    for (const sel of sels) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  /* -------- API -------- */
  const api = {
    listSections: async (params) => {
      const qs  = new URLSearchParams(params).toString();
      const url = `${BACKEND}/api/sections?${qs}`;
      log('GET', url);
      return arr(await getJson(url));
    },
    getHomePage: async () => {
      const bySlug = await api.listSections({ userId: USER_ID, templateId: TPL_ID, type: 'page', slug: 'home' });
      if (bySlug.length) return bySlug[0];
      const allPages = await api.listSections({ userId: USER_ID, templateId: TPL_ID, type: 'page' });
      return allPages[0] || null;
    },
    getAllForTemplate: async () => api.listSections({ userId: USER_ID, templateId: TPL_ID }),

    getHero:     async () => getJson(`${BACKEND}/api/hero/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),
    getAbout:    async () => getJson(`${BACKEND}/api/about/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),
    getProjects: async () => getJson(`${BACKEND}/api/projects/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),
    getMarquee:  async () => getJson(`${BACKEND}/api/marquee/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),
    getBrands:   async () => getJson(`${BACKEND}/api/brands/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),
    getServices: async () => getJson(`${BACKEND}/api/services/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),
    getBlogs:    async () => getJson(`${BACKEND}/api/blogs/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),
    getContact:  async () => getJson(`${BACKEND}/api/contact-info/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),
    getFooter:   async () => getJson(`${BACKEND}/api/footer/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),
  };

  /* === SAFE REORDER (container-scoped) ==================================== */
  const CONTAINER_SELECTORS = ['.main-box','main','.page-content','.main-content'];
  function getContainer() { for (const s of CONTAINER_SELECTORS) { const el = document.querySelector(s); if (el) return el; } return null; }
  function getRootInContainer(type, container) {
    const raw = getRoot(type);
    if (!raw || !container) return null;
    let el = raw;
    while (el && el.parentElement && el.parentElement !== container) el = el.parentElement;
    return (el && el.parentElement === container) ? el : null;
  }
  function reorderDomByDashboardOrder(pageSections) {
    try {
      if (window.CMS_DISABLE_REORDER) return;
      if (!Array.isArray(pageSections) || pageSections.length < 2) return;
      const container = getContainer(); if (!container) return;
      const nodesInOrder = []; const seen = new Set();
      pageSections.forEach(s => {
        const type = String(s.type || '').toLowerCase();
        if (!SECTION_ROOTS[type]) return;
        const node = getRootInContainer(type, container);
        if (node && !seen.has(node)) { nodesInOrder.push(node); seen.add(node); }
      });
      if (nodesInOrder.length < 2) return;
      const frag = document.createDocumentFragment();
      nodesInOrder.forEach(n => frag.appendChild(n));
      container.appendChild(frag);
    } catch (e) { console.warn('[Bayone CMS] safe reorder skipped:', e); }
  }
  /* ======================================================================= */

  /* =================== HERO =================== */

  function ensureHeroStructure(root) {
    if (!root) return { mediaWrap:null, video:null, source:null };

    if (!document.getElementById('cms-hero-css')) {
      const s = document.createElement('style');
      s.id = 'cms-hero-css';
      s.textContent = `
        .land-header.cms-hero-fixes{display:block!important;padding-bottom:0!important;margin-bottom:0!important;overflow:hidden;}
        .land-header.cms-hero-fixes > *{float:none!important;}
        .land-header.cms-hero-fixes .container{position:relative;z-index:2;}
        .land-header.cms-hero-fixes .caption{margin:0 auto 8px!important;padding:0!important;text-align:center;}
        .land-header.cms-hero-fixes > .hero-media{display:block!important;clear:both!important;width:100%;max-width:1200px;margin:8px auto 0!important;}
        .land-header.cms-hero-fixes > .hero-media video{display:block!important;width:100%!important;height:auto!important;max-height:72vh;object-fit:cover;border-radius:12px;}
        .land-header.cms-hero-fixes > img{display:none!important}
        .land-header.cms-hero-fixes + section,
        .land-header.cms-hero-fixes + * + section{margin-top:0!important;padding-top:0!important;}
        .land-header.cms-hero-fixes + .spacer,
        .land-header.cms-hero-fixes + .space,
        .land-header.cms-hero-fixes + .md-mb80,
        .land-header.cms-hero-fixes + .md-mb60,
        .land-header.cms-hero-fixes + .lg-mb80,
        .land-header.cms-hero-fixes + .pt-100,
        .land-header.cms-hero-fixes + .pb-100{display:none!important;margin:0!important;padding:0!important;height:0!important;min-height:0!important;}
      `;
      document.head.appendChild(s);
    }
    root.classList.add('cms-hero-fixes');

    let mediaWrap = root.querySelector(':scope > .hero-media');
    if (!mediaWrap) {
      mediaWrap = document.createElement('div');
      mediaWrap.className = 'hero-media';
      const container = root.querySelector(':scope > .container');
      if (container && container.nextSibling) root.insertBefore(mediaWrap, container.nextSibling);
      else root.appendChild(mediaWrap);
    }

    let video  = mediaWrap.querySelector('video.hero-video');
    if (!video) {
      video = document.createElement('video');
      video.className = 'hero-video';
      video.setAttribute('playsinline','');
      video.setAttribute('muted','');
      video.setAttribute('loop','');
      video.setAttribute('autoplay','');
      video.setAttribute('poster','');
      video.style.display = 'none';
      mediaWrap.appendChild(video);
    }

    let source = video.querySelector('source.hero-source');
    if (!source) {
      source = document.createElement('source');
      source.className = 'hero-source';
      source.setAttribute('type','video/mp4');
      video.appendChild(source);
    }
    Array.from(root.children).forEach(child => { if (child.tagName === 'IMG' && child !== mediaWrap) child.style.display = 'none'; });
    return { mediaWrap, video, source };
  }

  function showAndAutoplay(videoEl) {
    if (!videoEl) return;
    videoEl.style.display = '';
    // try to autoplay (muted)
    try {
      videoEl.muted = true;
      const p = videoEl.play?.();
      if (p && typeof p.then === 'function') p.catch(() => {}); // ignore autoplay rejection
    } catch {}
  }

  function applyHeroMedia(root, { heading, imgUrl, videoUrl, posterUrl }) {
    if (!root) return;

    const safeHeading = pickStr(heading);
    const safeImg     = pickStr(imgUrl);
    const safeVideo   = pickStr(videoUrl);
    const safePoster  = pickStr(posterUrl);

    // Always update heading but NEVER hide media just because heading changed
    setText('.caption h1', safeHeading, root);

    const { video, source } = ensureHeroStructure(root);
    const imgEl  = $('img', root);

    if (video && source && looksLikeVideo(safeVideo)) {
      if (safePoster) video.setAttribute('poster', resolveMediaUrl(safePoster));
      source.setAttribute('src', resolveMediaUrl(safeVideo));
      try { video.load(); } catch {}
      showAndAutoplay(video);
      if (imgEl) imgEl.style.display = 'none';
      return;
    }
    // No video → fall back to image
    hideVideo(video);
    if (imgEl) {
      if (safeImg) { setImg(imgEl, resolveMediaUrl(safeImg)); imgEl.style.display = ''; }
      else { imgEl.style.display = ''; }
    }
  }

  // normalize hero shapes (so we never render [object Object])
  function pickHero(raw) {
    if (!raw) return {};
    if (typeof raw === 'string') return { heading: raw };
    const h = raw;
    const c = h.content && typeof h.content === 'object' ? h.content : {};
    const v = h.video || c.video || {};
    return {
      heading:  pickStr(h.heading, c.heading, h.title, c.title, h.content),
      imgUrl:   pickStr(h.imageUrl, c.imageUrl, h.image, c.image),
      videoUrl: pickStr(h.videoUrl, c.videoUrl, v.src),
      poster:   pickStr(h.posterUrl, c.posterUrl, v.poster),
    };
  }

  async function applyHero(section) {
    const root = getRoot('hero'); if (!root) return;
    try {
      const heroApi = await api.getHero();
      const fromApi = pickHero(heroApi); 
      if (fromApi.heading || fromApi.imgUrl || fromApi.videoUrl || fromApi.poster) {
        applyHeroMedia(root, {
          heading: fromApi.heading,
          imgUrl: resolveMediaUrl(fromApi.imgUrl),
          videoUrl: resolveMediaUrl(fromApi.videoUrl),
          posterUrl: resolveMediaUrl(fromApi.poster),
        });
        return;
      }
    } catch (e) { log('No hero override;', e?.message || e); }

    const fromSection = pickHero(section);
    applyHeroMedia(root, {
      heading: fromSection.heading,
      imgUrl: resolveMediaUrl(fromSection.imgUrl),
      videoUrl: resolveMediaUrl(fromSection.videoUrl),
      posterUrl: resolveMediaUrl(fromSection.poster),
    });
  }

  /* =================== ABOUT =================== */
  async function applyAbout() {
    const root = getRoot('about'); if (!root) return;
    try {
      const about = await api.getAbout();
      if (!about) return;

      setText('.sec-head .sub-title', pickStr(about.subtitle, '- About Us'), root);

      const wrap = $('.intro .text-reval', root);
      const lines = Array.isArray(about.lines) && about.lines.length
        ? about.lines
        : (about.title ? String(about.title).split(/\n+/) : []);
      if (wrap) {
        let spans = $$('.text', wrap);
        if (!spans.length) { const s = document.createElement('span'); s.className='text'; wrap.appendChild(s); spans=[s]; }
        spans.forEach((sp,i)=> sp.textContent = lines[i] ? String(lines[i]) : (i===0? (lines[0]||'') : '') );
      }

      // media (allow video.src OR imageUrl)
      const vidWrap = $('.vid-intro', root);
      const v = $('video', vidWrap || root);
      const s = v ? $('source', v) : null;
      const media = pickStr(about.imageUrl, about?.video?.src);

      if (looksLikeVideo(media) && v && s) {
        s.setAttribute('src', resolveMediaUrl(media));
        try { v.load(); } catch {}
        v.style.display = '';
        if (vidWrap) vidWrap.style.display = '';
      } else {
        hideVideo(v);
        if (vidWrap) { vidWrap.style.display = ''; }
      }

      const rows = $$('.serv-inline .item', root);
      const services = Array.isArray(about.services) ? about.services : [];
      rows.forEach((row,i)=>{
        const data = services[i];
        if (!data) return;
        const numWrap = row.querySelector('.opacity-8');
        let tagEl = row.querySelector('.text-u.ml-5') || (numWrap && numWrap.querySelector('.text-u')) || (numWrap && numWrap.querySelector('span:last-child'));
        const titleEl = row.querySelector('h5') || row.querySelector('.cont h5') || row.querySelector('.d-flex h5');
        const linkEl  = row.querySelector('a.animsition-link') || row.querySelector('a[href]');
        if (tagEl)   tagEl.textContent   = pickStr(data.tag, data.category);
        if (titleEl) titleEl.textContent = pickStr(data.title, data.heading);
        if (linkEl)  linkEl.setAttribute('href', pickStr(data.href, '#'));
      });
    } catch(e){ log('about error', e?.message||e); }
  }

  /* =================== PROJECTS =================== */
  async function applyProjects() {
    const root = getRoot('projects'); if (!root) return;
    try {
      const payload = await api.getProjects();
      const items  = Array.isArray(payload?.projects) ? payload.projects : [];
      const panels = $$('.panel', root);
      panels.forEach((panel,i)=>{
        const data = items[i] || {};
        const box  = panel.querySelector('.img');
        const img  = box ? box.querySelector('img') : null;
        const abs  = resolveMediaUrl(pickStr(data.imageUrl, data.image));
        if (img) setImg(img, abs || '');
        const tagEl = panel.querySelector('.cont span');
        const h5    = panel.querySelector('.cont h5');
        const year  = panel.querySelector('.cont .ml-auto h6') || panel.querySelector('.cont h6');
        const link  = panel.querySelector('a.link-overlay');
        if (tagEl) tagEl.textContent = pickStr(data.tag);
        if (h5)    h5.textContent    = pickStr(data.title);
        if (year)  year.textContent  = pickStr(data.year);
        if (link)  link.setAttribute('href', pickStr(data.href, '#'));
      });
    } catch(e){ log('projects error', e?.message||e); }
  }

  /* =================== MARQUEE =================== */
  async function applyMarquee() {
    const root = getRoot('marquee'); if (!root) return;
    try {
      const payload = await api.getMarquee();
      const items = Array.isArray(payload?.items)
        ? payload.items.map(x => ({ text: pickStr(x?.text, x), icon: pickStr(x?.icon, '*') }))
        : [];
      if (!items.length) return;
      const boxes = $$('.main-marq .slide-har .box', root);
      boxes.forEach((box) => {
        const itemNodes = $$('.item', box);
        itemNodes.forEach((node,i)=>{
          const data = items[i % items.length];
          const h4 = $('h4', node);
          const spans = h4 ? Array.from(h4.querySelectorAll('span')) : [];
          const textEl = spans.find(s=>!s.classList.contains('icon')) || spans[0] || null;
          const iconEl = spans.find(s=> s.classList.contains('icon')) || null;
          if (textEl) textEl.textContent = data.text;
          if (iconEl) iconEl.textContent = data.icon;
        });
      });
    } catch(e){ log('marquee error', e?.message||e); }
  }

async function applyBrands() {
  const root =
    getRoot('brands') ||
    document.querySelector('.clients-carso,.clients,section.brands');
  if (!root) return;

  // The outer “carousel” box in Bayone
  const carso =
    root.classList.contains('clients-carso')
      ? root
      : root.querySelector('.clients-carso') ||
        root.querySelector('.clients') ||
        root;

  try {
    const payload = await api.getBrands();
    const raw = Array.isArray(payload?.items) ? payload.items : [];
    if (!raw.length) return;

    // Normalize items (accept string, {imageUrl}, or {imageKey})
    const items = raw.map((it, i) => {
      if (typeof it === 'string') return { imageUrl: it, order: i, href: '#', alt: `Brand ${i + 1}` };
      const url = it.imageUrl || it.presignedUrl || it.imageKey || '';
      return {
        imageUrl: url,
        href: typeof it.href === 'string' ? it.href : '#',
        alt:  typeof it.alt  === 'string' ? it.alt  : `Brand ${i + 1}`,
        order: Number.isFinite(it.order) ? Number(it.order) : i
      };
    });

    // Get/ensure wrapper & slides
    const wrapper =
      carso.querySelector('.swiper-wrapper') ||
      carso.querySelector('.wrapper') ||
      carso;

    if (!wrapper) return;

    // Make sure container is visible even if plugin hasn’t inited yet
    const container = wrapper.closest('.swiper-container,[data-swiper="container"]') || wrapper;
    if (container) {
      container.style.visibility = 'visible';
      container.style.opacity = '1';
    }
    wrapper.style.display = '';

    // Ensure enough slides
    let slides = Array.from(wrapper.querySelectorAll('.swiper-slide'));
    if (!slides.length) {
      // Build minimal slide markup if theme had none
      for (let i = 0; i < items.length; i++) {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.innerHTML = `
          <div class="item">
            <div class="img icon-img-100">
              <a href="#"><img alt=""></a>
            </div>
          </div>`;
        wrapper.appendChild(slide);
      }
      slides = Array.from(wrapper.querySelectorAll('.swiper-slide'));
    } else if (slides.length < items.length) {
      const tpl = slides[slides.length - 1].cloneNode(true);
      for (let i = slides.length; i < items.length; i++) {
        wrapper.appendChild(tpl.cloneNode(true));
      }
      slides = Array.from(wrapper.querySelectorAll('.swiper-slide'));
    }

    // Fill slides
    slides.forEach((slide, i) => {
      const data = items[i];
      if (!data) { slide.style.display = 'none'; return; }
      slide.style.display = '';

      const a = slide.querySelector('a[href]') || slide.querySelector('a');
      const img = slide.querySelector('img');

      if (a) a.setAttribute('href', data.href || '#');

      if (img) {
        const rawUrl = String(data.imageUrl || '');
        const abs = /^https?:\/\//i.test(rawUrl) ? rawUrl : resolveMediaUrl(rawUrl);
        // force eager so the theme’s lazyloader doesn’t hide them
        img.removeAttribute('srcset');
        img.removeAttribute('sizes');
        img.loading = 'eager';
        img.style.display = '';
        img.style.opacity = '1';
        img.style.maxHeight = '64px';
        img.style.objectFit = 'contain';
        img.alt = data.alt || 'Brand';
        img.src = abs || ''; // set last

        // If your SVGs are dark on dark, add class "brand-invert" to .clients-carso in HTML
        if (carso.classList.contains('brand-invert')) {
          img.style.filter = 'invert(1) brightness(1.6)';
        }
      }
    });

    // Nudge Swiper if present
    try {
      const sw = (carso.swiper || container?.swiper || wrapper?.swiper);
      if (sw && typeof sw.update === 'function') sw.update();
    } catch {}

    window.dispatchEvent(new Event('resize'));
  } catch (e) {
    log('brands error', e?.message || e);
  }
}

  /* =================== SERVICES (accordion) =================== */
  async function applyServices() {
    const root = getRoot('services'); if (!root) return;
    const accRoot = root.matches('.accordion') ? root : $('.accordion', root) || root;
    try {
      const payload = await api.getServices();
      const items = Array.isArray(payload?.services) ? payload.services : [];
      if (!items.length) return;

      const wrapper = accRoot;
      let rows = $$('.item', wrapper);

      if (rows.length < items.length && rows.length) {
        const tpl = rows[rows.length - 1];
        for (let i = rows.length; i < items.length; i++) wrapper.appendChild(tpl.cloneNode(true));
        rows = $$('.item', wrapper);
      }

      rows.forEach((row,i)=>{
        const data = items[i];
        if (!data) { row.style.display='none'; return; }
        row.style.display='';

        const h4 = row.querySelector('.title h4') || row.querySelector('h4');
        const p  = row.querySelector('.accordion-info p') ||
                   row.querySelector('.accordion-info')   ||
                   row.querySelector('p');

        const delay = String(data.delay || `.${Math.min(i + 1, 9)}s`);
        row.setAttribute('data-wow-delay', delay);

        if (h4) h4.textContent = pickStr(data.title);
        if (p)  p.textContent  = pickStr(data.description);
      });
    } catch(e){ log('services error', e?.message||e); }
  }

  /* =================== BLOG (pop-out preserved) =================== */
  function ensureBlogHoverFallback(row) {
    if (!row || row.__cmsHoverBound) return;
    row.__cmsHoverBound = true;
    row.style.position = row.style.position || "relative";
    let holder = row.querySelector(":scope > .cms-pop-holder");
    if (!holder) {
      holder = document.createElement("div");
      holder.className = "cms-pop-holder";
      Object.assign(holder.style, {
        position: "absolute", left: "0px", top: "0px",
        width: "0px", height: "0px", pointerEvents: "none", zIndex: "5",
      });
      row.appendChild(holder);
    }
    let img = holder.querySelector("img.cms-pop");
    if (!img) {
      img = document.createElement("img");
      img.className = "cms-pop";
      Object.assign(img.style, {
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)", width: "260px", height: "260px",
        objectFit: "cover", borderRadius: "4px", opacity: "0",
        transition: "opacity .3s ease", willChange: "opacity",
        display: "block", zIndex: "10", pointerEvents: "none",
      });
      holder.appendChild(img);
    }
    const a = row.querySelector("a.block__link");
    if (!a) return;
    const titleCol = row.querySelector(".cont");
    const titleEl  = titleCol && (titleCol.querySelector(".cont h3, .cont .text-u, h3") || titleCol.querySelector("h3"));
    function placeNearTitle() {
      const rowBox   = row.getBoundingClientRect();
      const refEl    = titleEl || titleCol || row;
      const refBox   = refEl.getBoundingClientRect();
      const leftPx   = Math.round(refBox.right - rowBox.left + 24);
      const midY     = (refBox.top + refBox.height / 2);
      const topPx    = Math.round(midY - rowBox.top);
      holder.style.left = "0";
      holder.style.top  = "0";
      img.style.left    = leftPx + "px";
      img.style.top     = topPx + "px";
      img.style.transform = "translateY(-50%)";
    }
    row.addEventListener("mouseenter", () => {
      const u = a.getAttribute("data-img") || "";
      if (!u) return;
      if (img.getAttribute("src") !== u) img.setAttribute("src", u);
      placeNearTitle();
      img.style.opacity = "1";
    });
    row.addEventListener("mouseleave", () => { img.style.opacity = "0"; });
    window.addEventListener("resize", placeNearTitle, { passive: true });
    window.addEventListener("scroll", placeNearTitle, { passive: true });
  }

  async function applyBlog() {
    const root = getRoot('blog'); if (!root) return;
    try {
      const payload = await api.getBlogs();
      const posts = Array.isArray(payload?.items)
        ? payload.items.slice().sort((a,b) => (a.order ?? 0) - (b.order ?? 0))
        : [];
      const rows = $$('.item.block', root);
      if (!rows.length || !posts.length) return;
      rows.forEach((row, i) => {
        const p = posts[i];
        if (!p) { row.style.display = "none"; return; }
        row.style.display = "";
        const info = row.querySelector(".info");
        const h3   = row.querySelector(".cont h3, .cont .text-u, h3");
        if (info) {
          let tagEl  = info.querySelector(".tag");
          if (!tagEl) { tagEl = document.createElement("span"); tagEl.className = "tag"; info.prepend(tagEl); }
          tagEl.textContent = pickStr(p.tag);
          let dateEl = info.querySelector(".date");
          if (!dateEl) { dateEl = document.createElement("span"); dateEl.className = "date"; info.appendChild(dateEl); }
          dateEl.textContent = pickStr(p.date);
        }
        if (h3) h3.textContent = pickStr(p.title);
        const href = pickStr(p.href, "blog-details.html");
        const a = row.querySelector("a.block__link");
        if (a) a.setAttribute("href", href);
        const rawImg = pickStr(p.imageUrl, p.presignedUrl, p.imageKey);
        const imgAbs = /^https?:\/\//i.test(rawImg) ? rawImg : resolveMediaUrl(rawImg);
        if (a) {
          if (imgAbs) {
            a.setAttribute("data-img", imgAbs);
            const pre = new Image(); pre.decoding = 'async'; pre.src = imgAbs;
          } else {
            a.removeAttribute("data-img");
          }
        }
        const strayInline = row.querySelector(":scope > img, .row > img");
        if (strayInline) strayInline.remove();
        row.setAttribute("data-wow-delay", String(p.delay || `.${Math.min(i + 2, 9)}`));
        ensureBlogHoverFallback(row);
      });
      try { if (window.HoverImg) window.HoverImg(); } catch {}
      try { if (window.initHoverImg) window.initHoverImg(); } catch {}
      try { if (window.three_img_hover) window.three_img_hover(); } catch {}
      try { document.dispatchEvent(new Event("cms:blogs-updated")); } catch {}
    } catch(e){ log('blog error', e?.message||e); }
  }

  /* =================== CONTACT =================== */
  async function applyContact() {
    const root = getRoot('contact'); if (!root) return;
    let data;
    try { data = await api.getContact(); }
    catch (e) { log('contact fetch failed', e?.message||e); return; }
    const subtitle   = pickStr(data?.subtitle, '- Contact Us');
    const strong     = pickStr(data?.titleStrong, 'Get In');
    const light      = pickStr(data?.titleLight, 'Touch');
    const buttonText = pickStr(data?.buttonText, "Let's Talk");
    const formAction = pickStr(data?.formAction, 'https://ui-themez.smartinnovates.net/items/bayone1/contact.php');
    const subEl = $('.sec-head .sub-title', root);
    if (subEl) subEl.textContent = subtitle;
    const titleEl = $('.sec-head h3, .sec-head .text-u, h3', root);
    if (titleEl) titleEl.innerHTML = `${strong} <span class="f-ultra-light">${light}</span>.`;
    const formEl = $('form', root);
    if (formEl && formAction) formEl.setAttribute('action', formAction);
    const btnTextEl =
      $('form button .text', root) ||
      $('form button span', root)  ||
      $('.butn span', root);
    if (btnTextEl) btnTextEl.textContent = buttonText;
  }

  /* =================== FOOTER =================== */
  async function applyFooter() {
    const root = getRoot('footer'); if (!root) return;
    let data;
    try { data = await api.getFooter(); }
    catch (e) { log('footer fetch failed', e?.message||e); return; }

    const socialNorm = Array.isArray(data?.social)
      ? data.social.map(s => (typeof s === 'string' ? { label: s, href: '#0' } : s))
      : [];

    const subTitle = $('.eml .sub-title, .eml h6.sub-title', root);
    if (subTitle && data?.topSubtitle) subTitle.textContent = data.topSubtitle;
    const emailA = $('.eml h2 a, .eml .underline a, .eml a', root);
    if (emailA) {
      if (data?.emailHref)  emailA.setAttribute('href', data.emailHref);
      if (data?.emailLabel) emailA.textContent = data.emailLabel;
    }
    const logoImg = $('.logo img', root);
    if (logoImg && data?.logoUrl) setImg(logoImg, resolveMediaUrl(data.logoUrl));

    const socialUl = $('.column ul.rest, .column .rest', root);
    if (socialUl && socialNorm.length) {
      while (socialUl.children.length < socialNorm.length) {
        const li = document.createElement('li');
        li.className = 'hover-this cursor-pointer';
        const a  = document.createElement('a');
        a.className = 'hover-anim';
        a.href = '#0';
        a.textContent = '—';
        li.appendChild(a);
        socialUl.appendChild(li);
      }
      Array.from(socialUl.querySelectorAll('li a')).forEach((a, i) => {
        const item = socialNorm[i];
        if (!item) return;
        a.textContent = pickStr(item.label, a.textContent);
        if (item.href) a.setAttribute('href', item.href);
      });
    }

    const officeP   = $('.column p', root);
    if (officeP && data?.officeAddress) officeP.textContent = data.officeAddress;
    const phoneA    = $('.column h5 a, .column .underline a', root);
    if (phoneA) {
      if (data?.officePhone)     phoneA.textContent = data.officePhone;
      if (data?.officePhoneHref) phoneA.setAttribute('href', data.officePhoneHref);
    }
    const bottomLinks = $$('.links ul.rest li a', root);
    if (bottomLinks.length && Array.isArray(data?.links)) {
      const byLabel = Object.fromEntries((data.links || []).map(l => [pickStr(l.label).toLowerCase(), pickStr(l.href, '#')]));
      bottomLinks.forEach((a, idx) => {
        const label = pickStr(a.textContent).toLowerCase();
        const href = byLabel[label] || data.links[idx]?.href;
        if (href) a.setAttribute('href', href);
      });
    }
    const copyP = $('.copyright p, .copyright', root);
    if (copyP && data?.copyrightHtml) copyP.innerHTML = data.copyrightHtml;
  }

  /* =================== MAIN =================== */
  async function run() {
    log('Boot with', { BACKEND, USER_ID, TPL_ID });
    const home = await api.getHomePage();
    if (!home?._id) { warn('No page found for template', TPL_ID); return; }

    const all = await api.getAllForTemplate();
    const pageSections = all
      .filter(s => String(s.parentPageId) === String(home._id))
      .sort((a,b) => (a.order ?? 0) - (b.order ?? 0));

    // Safe reorder
    reorderDomByDashboardOrder(pageSections);

    const byType = (t) => pageSections.find(s => (s.type || '').toLowerCase() === t);

    await applyHero(byType('hero'));
    await applyAbout();
    await applyProjects();
    await applyMarquee();
    await applyBrands();
    await applyServices();
    await applyBlog();
    await applyContact();
    await applyFooter();

    window.dispatchEvent(new Event('resize'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => run().catch(oops));
  } else {
    run().catch(oops);
  }
})();






















