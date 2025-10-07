





// // every reoder works bur marquee hide behind projcts
// /* bayone1/assets/js/page-loader-bayone1.js */
// (() => {
//   'use strict';

//   // ---------------- CONFIG ----------------
//   const BACKEND = (window.BACKEND_ORIGIN || '').replace(/\/+$/, '');
//   const USER_ID = window.APP_USER_ID || 'demo-user';
//   const TPL_ID  = window.APP_TEMPLATE_ID || 'sir-template-1';

//   const DEBUG = false;
//   const log  = (...a) => DEBUG && console.log('[Bayone CMS]', ...a);
//   const warn = (...a) => console.warn('[Bayone CMS]', ...a);
//   const oops = (e)   => console.error('[Bayone CMS] Failed:', e);

//   if (!BACKEND) warn('BACKEND_ORIGIN is not set. Define it in cms-boot.js');

//   // --------------- HTTP helpers ---------------
//   async function getJson(url) {
//     const res = await fetch(url, { credentials: 'omit', cache: 'no-store' });
//     if (!res.ok) throw new Error(`${res.status} ${res.statusText} @ ${url}`);
//     return res.json();
//   }
//   const arr = (x) => Array.isArray(x) ? x : (Array.isArray(x?.data) ? x.data : []);

//   // --------------- URL helper ---------------
//   const ABS_RX = /^https?:\/\//i;
//   function toAbsUrl(u) {
//     const s = String(u || '').trim();
//     if (!s) return '';
//     if (ABS_RX.test(s)) return s;
//     if (!BACKEND) return s;
//     const clean = s.replace(/^\/+/, '');
//     return `${BACKEND}/${clean}`;
//   }

//   // --------------- API ---------------
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
//   };

//   // --------------- DOM helpers ---------------
//   const $  = (s, root = document) => { try { return root.querySelector(s); } catch { return null; } };
//   const $$ = (s, root = document) => { try { return Array.from(root.querySelectorAll(s)); } catch { return []; } };

//   function setText(selOrEl, val) {
//     if (val == null) return;
//     const el = typeof selOrEl === 'string' ? $(selOrEl) : selOrEl;
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
//     }
//   }
//   function setAttr(sel, attr, val) {
//     const el = $(sel); if (!el) return;
//     if (val == null || val === '') el.removeAttribute(attr);
//     else el.setAttribute(attr, val);
//   }

//   // --------------- REORDER (optional; safe) ---------------
//   const TYPE_TO_SELECTOR = {
//     hero:         'header.land-header',
//     about:        'section.about',
//     works:        'section.works',
//     projects:     'section.works',      // alias
//     marquee:      'section.marquee',
//     brands:       'div.clients-carso',
//     testimonials: 'div.clients-carso',
//     services:     'section.section-padding .accordion.bord',
//     blog:         'section.blog-list',
//     contact:      'section.contact',
//     appointment:  'section.contact',
//     team:         'section.team'
//   };

//   function resolveMoveRoot(selector) {
//     const node = $(selector);
//     if (!node) return null;
//     if (/^(SECTION|HEADER|DIV)$/i.test(node.tagName)) return node;
//     return node.closest('section, header, div') || node;
//   }

//   // Reorder only when we can recognize at least two sections, to avoid layout glitches.
//   function reorderDomByTypes(orderedTypes) {
//     const container = $('.main-box');
//     if (!container || !orderedTypes?.length) return;

//     const nodesInOrder = [];
//     const seen = new Set();

//     orderedTypes.forEach((type) => {
//       const key = String(type || '').toLowerCase();
//       const sel = TYPE_TO_SELECTOR[key];
//       if (!sel) return;
//       const root = resolveMoveRoot(sel);
//       if (root && !seen.has(root)) { nodesInOrder.push(root); seen.add(root); }
//     });

//     if (nodesInOrder.length < 2) return;

//     Array.from(container.children).forEach((child) => {
//       if (!seen.has(child) && /^(SECTION|HEADER|DIV)$/i.test(child.tagName)) {
//         nodesInOrder.push(child);
//         seen.add(child);
//       }
//     });

//     nodesInOrder.forEach((node) => container.appendChild(node));
//   }

//   // --------------- MEDIA guards ---------------
//   function hideVideo(el) {
//     if (!el) return;
//     try { el.pause(); } catch {}
//     const src = $('source', el);
//     if (src) setAttr(src, 'src', '');
//     el.removeAttribute('poster');
//     el.style.display = 'none';
//     try { el.load && el.load(); } catch {}
//   }
//   const looksLikeVideo = (u) => /\.(mp4|webm|ogg)(\?|#|$)/i.test(String(u || ''));

//   // --------------- HERO (conservative) ---------------
//   function applyHeroMedia({ heading, imgUrl, videoUrl, posterUrl }) {
//     if (heading) setText('.land-header .caption h1', heading);

//     const video  = $('.hero-video');
//     const source = $('.hero-source');
//     const imgEl  = $('.land-header img');

//     // Only switch to video if we have a valid URL
//     if (video && source && looksLikeVideo(videoUrl)) {
//       if (posterUrl) video.setAttribute('poster', posterUrl);
//       source.setAttribute('src', videoUrl);
//       try { video.load(); } catch {}
//       video.style.display = '';
//       if (imgEl) imgEl.style.display = 'none';
//       return;
//     }

//     // Only update image if we actually have one; otherwise keep theme default
//     if (imgEl && imgUrl) {
//       setImg(imgEl, imgUrl);
//       imgEl.style.display = '';
//       if (video) hideVideo(video);
//     }
//     // If we have neither video nor image, DO NOTHING (keeps original hero media).
//   }

//   function applyHeroFromSection(section) {
//     if (!section) return;
//     const heading   = section.content?.heading ?? section.title ?? section.content?.headline ?? '';
//     const imgUrl    = section.content?.imageUrl || section.content?.image || '';
//     const videoUrl  = section.content?.videoUrl || '';
//     const posterUrl = section.content?.posterUrl || '';
//     applyHeroMedia({ heading, imgUrl, videoUrl, posterUrl });
//   }

//   async function applyHeroPreferBackend(section) {
//     try {
//       const hero = await api.getHero();
//       const heading  = (hero?.content || '').trim();
//       const imgUrl   = hero?.imageUrl || '';
//       const videoUrl = hero?.videoUrl || '';
//       const poster   = hero?.posterUrl || '';
//       if (heading || imgUrl || videoUrl || poster) {
//         applyHeroMedia({ heading, imgUrl, videoUrl, posterUrl: poster });
//         return;
//       }
//     } catch (e) { log('No hero override, fallback to section:', e?.message || e); }
//     applyHeroFromSection(section);
//   }

//   // ---------------- ABOUT helpers ----------------
//   function ensureAboutLines(lines) {
//     const wrap = document.querySelector('.about .intro .text-reval');
//     if (!wrap) return;
//     let spans = Array.from(wrap.querySelectorAll('.text'));
//     if (!spans.length) { const s = document.createElement('span'); s.className = 'text'; wrap.appendChild(s); spans = [s]; }
//     if (Array.isArray(lines) && lines.length) {
//       for (let i = 0; i < spans.length; i++) spans[i].textContent = lines[i] ? String(lines[i]) : '';
//       if (lines.length > spans.length) spans[spans.length - 1].textContent = lines.slice(spans.length - 1).join(' ');
//     } else if (typeof lines === 'string') {
//       spans[0].textContent = lines; for (let i = 1; i < spans.length; i++) spans[i].textContent = '';
//     }
//   }
//   function hideAboutMedia() {
//     const container = $('.about .vid-intro .video-container');
//     const v = $('.about .vid-intro video');
//     hideVideo(v);
//     if (container) { container.style.display = 'none'; container.style.height = '0px'; container.style.padding = '0'; container.style.margin = '0'; }
//   }
//   function showAboutVideo(srcUrl) {
//     const container = $('.about .vid-intro .video-container');
//     const v = $('.about .vid-intro video');
//     const s = $('.about .vid-intro video source');
//     if (!container || !v || !s) return;
//     container.style.display = ''; container.style.height = ''; s.setAttribute('src', srcUrl);
//     try { v.load(); } catch {} v.style.display = '';
//   }
//   function applyAboutServices(services) {
//     const rows = Array.from(document.querySelectorAll('.about .serv-inline .item'));
//     if (!Array.isArray(services)) services = [];
//     rows.forEach((row, i) => {
//       const data = services[i] || null;
//       if (!row || !data) { if (row) row.style.display = ''; return; }
//       const numWrap = row.querySelector('.opacity-8');
//       let tagEl = row.querySelector('.text-u.ml-5') || (numWrap && numWrap.querySelector('.text-u')) || (numWrap && numWrap.querySelector('span:last-child'));
//       const titleEl = row.querySelector('h5') || row.querySelector('.cont h5') || row.querySelector('.d-flex h5');
//       const linkEl  = row.querySelector('a.animsition-link') || row.querySelector('a[href]');
//       const tag   = (data.tag   ?? data.category ?? '').toString();
//       const title = (data.title ?? data.heading  ?? '').toString();
//       const href  = (data.href  ?? '').toString();
//       if (tagEl)   tagEl.textContent   = tag;
//       if (titleEl) titleEl.textContent = title;
//       if (linkEl && href)  linkEl.setAttribute('href', href);
//     });
//   }
//   function applyAboutFromSection(section) {
//     if (!section) { hideAboutMedia(); return; }
//     const content = section.content || {};
//     setText('.about .sec-head .sub-title', content.subtitle || '- About Us');
//     const lines = Array.isArray(content.lines) && content.lines.length ? content.lines : (content.title ? String(content.title).split(/\n+/) : []);
//     ensureAboutLines(lines);
//     const media = content.imageUrl || content.image || '';
//     if (looksLikeVideo(media)) showAboutVideo(media); else hideAboutMedia();
//     applyAboutServices(content.services || []);
//   }
//   async function applyAbout() {
//     try {
//       const about = await api.getAbout();
//       if (about && (about.title || about.description || about.imageUrl || (about.lines && about.lines.length) || (about.services && about.services.length))) {
//         setText('.about .sec-head .sub-title', about.subtitle || '- About Us');
//         const lines = Array.isArray(about.lines) && about.lines.length ? about.lines : (about.title ? String(about.title).split(/\n+/) : []);
//         ensureAboutLines(lines);
//         if (looksLikeVideo(about.imageUrl || '')) showAboutVideo(about.imageUrl); else hideAboutMedia();
//         applyAboutServices(about.services || []);
//         return;
//       }
//     } catch (e) { log('No /api/about override;', e?.message || e); }
//     try {
//       const all = await api.getAllForTemplate();
//       const home = await api.getHomePage();
//       const pageSections = all.filter(s => String(s.parentPageId) === String(home?._id));
//       const aboutSection = pageSections.find(s => (s.type || '').toLowerCase() === 'about');
//       applyAboutFromSection(aboutSection);
//     } catch (e) { oops(e); }
//   }

//   // --------------- PROJECTS (“works”) — conservative ---------------
//   async function applyProjects() {
//     const root = $('section.works');
//     if (!root) return;

//     let payload = null;
//     try {
//       payload = await api.getProjects();
//     } catch (e) {
//       log('No /api/projects override;', e?.message || e);
//       return;
//     }

//     const items  = Array.isArray(payload?.projects) ? payload.projects : [];
//     const panels = $$('.works .panel', root);

//     panels.forEach((panel, i) => {
//       const data = items[i] || {};
//       const img  = panel.querySelector('.img img');

//       const abs  = toAbsUrl(data.imageUrl || '');

//       // Only override image when we have a new url; otherwise keep theme default
//       if (img && abs) setImg(img, abs);

//       const tagEl = panel.querySelector('.cont span');
//       const h5    = panel.querySelector('.cont h5');
//       const year  = panel.querySelector('.cont .ml-auto h6') || panel.querySelector('.cont h6');
//       const link  = panel.querySelector('a.link-overlay');

//       if (tagEl && data.tag)   tagEl.textContent = String(data.tag || '');
//       if (h5   && data.title)  h5.textContent    = String(data.title || '');
//       if (year && data.year)   year.textContent  = String(data.year || '');
//       if (link && data.href)   link.setAttribute('href', String(data.href));
//     });
//   }

//   // --------------- MARQUEE (non-destructive) ---------------
//   async function applyMarquee() {
//     const root = $('section.marquee');
//     if (!root) return;

//     let payload = null;
//     try {
//       payload = await api.getMarquee();
//     } catch (e) {
//       log('No /api/marquee override;', e?.message || e);
//       return; // leave theme defaults
//     }

//     const items = Array.isArray(payload?.items)
//       ? payload.items.map(x => ({ text: String(x?.text || ''), icon: String(x?.icon || '*') }))
//       : [];

//     if (!items.length) return; // keep existing text if no data

//     const boxes = $$('.marquee .main-marq .slide-har .box', root);
//     boxes.forEach((box) => {
//       const itemNodes = $$('.item', box);
//       itemNodes.forEach((node, i) => {
//         const data = items[i % items.length];
//         const h4      = $('h4', node);
//         const spans   = h4 ? Array.from(h4.querySelectorAll('span')) : [];
//         const textEl  = spans.find(s => !s.classList.contains('icon')) || spans[0] || null;
//         const iconEl  = spans.find(s => s.classList.contains('icon')) || null;

//         if (textEl && data.text) textEl.textContent = data.text;
//         if (iconEl && data.icon) iconEl.textContent = data.icon;
//       });
//     });
//   }

//   // --------------- Main ----------------
//   async function run() {
//     log('Boot with', { BACKEND, USER_ID, TPL_ID });

//     const home = await api.getHomePage();
//     if (!home?._id) { warn('No page found for template', TPL_ID); return; }

//     const all = await api.getAllForTemplate();
//     const pageSections = all
//       .filter(s => String(s.parentPageId) === String(home._id))
//       .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

//     const orderedTypes = pageSections.map(s => String(s.type || '').toLowerCase());
//     reorderDomByTypes(orderedTypes);

//     const byType = (t) => pageSections.find(s => (s.type || '').toLowerCase() === t);

//     await applyHeroPreferBackend(byType('hero'));
//     await applyAbout();
//     await applyProjects();
//     await applyMarquee();
//   }

//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => run().catch(oops));
//   } else {
//     run().catch(oops);
//   }
// })();













// // reorder works but marquee and project not also marquee above project

// /* bayone1/assets/js/page-loader-bayone1.js */
// (() => {
//   'use strict';

//   // ---------------- CONFIG ----------------
//   const BACKEND = (window.BACKEND_ORIGIN || '').replace(/\/+$/, '');
//   const USER_ID = window.APP_USER_ID || 'demo-user';
//   const TPL_ID  = window.APP_TEMPLATE_ID || 'sir-template-1';

//   const DEBUG = false;
//   const log  = (...a) => DEBUG && console.log('[Bayone CMS]', ...a);
//   const warn = (...a) => console.warn('[Bayone CMS]', ...a);
//   const oops = (e)   => console.error('[Bayone CMS] Failed:', e);

//   if (!BACKEND) warn('BACKEND_ORIGIN is not set. Define it in cms-boot.js');

//   // --------------- HTTP helpers ---------------
//   async function getJson(url) {
//     const res = await fetch(url, { credentials: 'omit', cache: 'no-store' });
//     if (!res.ok) throw new Error(`${res.status} ${res.statusText} @ ${url}`);
//     return res.json();
//   }
//   const arr = (x) => Array.isArray(x) ? x : (Array.isArray(x?.data) ? x.data : []);

//   // --------------- URL helper ---------------
//   const ABS_RX = /^https?:\/\//i;
//   function toAbsUrl(u) {
//     const s = String(u || '').trim();
//     if (!s) return '';
//     if (ABS_RX.test(s)) return s;
//     if (!BACKEND) return s;
//     const clean = s.replace(/^\/+/, '');
//     return `${BACKEND}/${clean}`;
//   }

//   // --------------- API ---------------
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
//   };

//   // --------------- DOM helpers ---------------
//   const $  = (s, root = document) => { try { return root.querySelector(s); } catch { return null; } };
//   const $$ = (s, root = document) => { try { return Array.from(root.querySelectorAll(s)); } catch { return []; } };

//   function setText(selOrEl, val) {
//     if (val == null) return;
//     const el = typeof selOrEl === 'string' ? $(selOrEl) : selOrEl;
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
//     }
//   }
//   function setAttr(sel, attr, val) {
//     const el = $(sel); if (!el) return;
//     if (val == null || val === '') el.removeAttribute(attr);
//     else el.setAttribute(attr, val);
//   }

//   // --------------- REORDER (your working version) ---------------
//   const TYPE_TO_SELECTOR = {
//     hero:         'header.land-header',
//     about:        'section.about',
//     works:        'section.works',
//     projects:     'section.works',      // alias
//     marquee:      'section.marquee',
//     brands:       'div.clients-carso',
//     testimonials: 'div.clients-carso',
//     services:     'section.section-padding .accordion.bord',
//     blog:         'section.blog-list',
//     contact:      'section.contact',
//     appointment:  'section.contact',
//     team:         'section.team'
//   };

//   function resolveMoveRoot(selector) {
//     const node = $(selector);
//     if (!node) return null;
//     if (/^(SECTION|HEADER|DIV)$/i.test(node.tagName)) return node;
//     return node.closest('section, header, div') || node;
//   }

//   function reorderDomByTypes(orderedTypes) {
//     const container = $('.main-box');
//     if (!container || !orderedTypes?.length) return;

//     const nodesInOrder = [];
//     const seen = new Set();

//     orderedTypes.forEach((type) => {
//       const key = String(type || '').toLowerCase();
//       const sel = TYPE_TO_SELECTOR[key];
//       if (!sel) return;
//       const root = resolveMoveRoot(sel);
//       if (root && !seen.has(root)) { nodesInOrder.push(root); seen.add(root); }
//     });

//     if (nodesInOrder.length < 2) return;

//     Array.from(container.children).forEach((child) => {
//       if (!seen.has(child) && /^(SECTION|HEADER|DIV)$/i.test(child.tagName)) {
//         nodesInOrder.push(child);
//         seen.add(child);
//       }
//     });

//     nodesInOrder.forEach((node) => container.appendChild(node));
//   }

//   // --------------- MARQUEE FIXES (z-index + height reset) ---------------
//   function resetMarqueeHeights() {
//     const marq = $('section.marquee');
//     if (!marq) return;
//     const main = marq.querySelector('.main-marq');
//     const slide = marq.querySelector('.slide-har');
//     [marq, main, slide].forEach(n => {
//       if (!n) return;
//       n.style.height = '';
//       n.style.minHeight = '';
//       n.style.marginTop = '';
//       n.style.transform = '';
//     });
//   }

//   function setMarqueeLift(enabled) {
//     const works   = $('section.works');
//     const marquee = $('section.marquee');
//     if (!works || !marquee) return;

//     // ensure stacking context
//     if (getComputedStyle(works).position === 'static') works.style.position = 'relative';
//     if (getComputedStyle(marquee).position === 'static') marquee.style.position = 'relative';

//     if (enabled) {
//       // marquee sits visually above works
//       if (!works.style.zIndex) works.style.zIndex = '20';
//       marquee.style.zIndex = '30';
//       // prevent clipping
//       if (getComputedStyle(works).overflow !== 'visible') works.style.overflow = 'visible';
//       // small gap so they don’t collide
//       if (!marquee.style.marginTop) marquee.style.marginTop = '60px';
//     } else {
//       // clear any old lift styles so it won’t float or create gaps
//       marquee.style.zIndex = '';
//       works.style.zIndex = '';
//       works.style.overflow = '';
//       marquee.style.marginTop = '';
//     }
//   }

//   // --------------- MEDIA guards ---------------
//   function hideVideo(el) {
//     if (!el) return;
//     try { el.pause(); } catch {}
//     const src = $('source', el);
//     if (src) setAttr(src, 'src', '');
//     el.removeAttribute('poster');
//     el.style.display = 'none';
//     try { el.load && el.load(); } catch {}
//   }
//   const looksLikeVideo = (u) => /\.(mp4|webm|ogg)(\?|#|$)/i.test(String(u || ''));

//   // --------------- HERO (conservative) ---------------
//   function applyHeroMedia({ heading, imgUrl, videoUrl, posterUrl }) {
//     if (heading) setText('.land-header .caption h1', heading);

//     const video  = $('.hero-video');
//     const source = $('.hero-source');
//     const imgEl  = $('.land-header img');

//     if (video && source && looksLikeVideo(videoUrl)) {
//       if (posterUrl) video.setAttribute('poster', posterUrl);
//       source.setAttribute('src', videoUrl);
//       try { video.load(); } catch {}
//       video.style.display = '';
//       if (imgEl) imgEl.style.display = 'none';
//       return;
//     }

//     if (imgEl && imgUrl) {
//       setImg(imgEl, imgUrl);
//       imgEl.style.display = '';
//       if (video) hideVideo(video);
//     }
//   }

//   function applyHeroFromSection(section) {
//     if (!section) return;
//     const heading   = section.content?.heading ?? section.title ?? section.content?.headline ?? '';
//     const imgUrl    = section.content?.imageUrl || section.content?.image || '';
//     const videoUrl  = section.content?.videoUrl || '';
//     const posterUrl = section.content?.posterUrl || '';
//     applyHeroMedia({ heading, imgUrl, videoUrl, posterUrl });
//   }

//   async function applyHeroPreferBackend(section) {
//     try {
//       const hero = await api.getHero();
//       const heading  = (hero?.content || '').trim();
//       const imgUrl   = hero?.imageUrl || '';
//       const videoUrl = hero?.videoUrl || '';
//       const poster   = hero?.posterUrl || '';
//       if (heading || imgUrl || videoUrl || poster) {
//         applyHeroMedia({ heading, imgUrl, videoUrl, posterUrl: poster });
//         return;
//       }
//     } catch (e) { log('No hero override, fallback to section:', e?.message || e); }
//     applyHeroFromSection(section);
//   }

//   // ---------------- ABOUT helpers ----------------
//   function ensureAboutLines(lines) {
//     const wrap = document.querySelector('.about .intro .text-reval');
//     if (!wrap) return;
//     let spans = Array.from(wrap.querySelectorAll('.text'));
//     if (!spans.length) { const s = document.createElement('span'); s.className = 'text'; wrap.appendChild(s); spans = [s]; }
//     if (Array.isArray(lines) && lines.length) {
//       for (let i = 0; i < spans.length; i++) spans[i].textContent = lines[i] ? String(lines[i]) : '';
//       if (lines.length > spans.length) spans[spans.length - 1].textContent = lines.slice(spans.length - 1).join(' ');
//     } else if (typeof lines === 'string') {
//       spans[0].textContent = lines; for (let i = 1; i < spans.length; i++) spans[i].textContent = '';
//     }
//   }
//   function hideAboutMedia() {
//     const container = $('.about .vid-intro .video-container');
//     const v = $('.about .vid-intro video');
//     hideVideo(v);
//     if (container) { container.style.display = 'none'; container.style.height = '0px'; container.style.padding = '0'; container.style.margin = '0'; }
//   }
//   function showAboutVideo(srcUrl) {
//     const container = $('.about .vid-intro .video-container');
//     const v = $('.about .vid-intro video');
//     const s = $('.about .vid-intro video source');
//     if (!container || !v || !s) return;
//     container.style.display = ''; container.style.height = ''; s.setAttribute('src', srcUrl);
//     try { v.load(); } catch {} v.style.display = '';
//   }
//   function applyAboutServices(services) {
//     const rows = Array.from(document.querySelectorAll('.about .serv-inline .item'));
//     if (!Array.isArray(services)) services = [];
//     rows.forEach((row, i) => {
//       const data = services[i] || null;
//       if (!row || !data) { if (row) row.style.display = ''; return; }
//       const numWrap = row.querySelector('.opacity-8');
//       let tagEl = row.querySelector('.text-u.ml-5') || (numWrap && numWrap.querySelector('.text-u')) || (numWrap && numWrap.querySelector('span:last-child'));
//       const titleEl = row.querySelector('h5') || row.querySelector('.cont h5') || row.querySelector('.d-flex h5');
//       const linkEl  = row.querySelector('a.animsition-link') || row.querySelector('a[href]');
//       const tag   = (data.tag   ?? data.category ?? '').toString();
//       const title = (data.title ?? data.heading  ?? '').toString();
//       const href  = (data.href  ?? '').toString();
//       if (tagEl)   tagEl.textContent   = tag;
//       if (titleEl) titleEl.textContent = title;
//       if (linkEl && href)  linkEl.setAttribute('href', href);
//     });
//   }
//   function applyAboutFromSection(section) {
//     if (!section) { hideAboutMedia(); return; }
//     const content = section.content || {};
//     setText('.about .sec-head .sub-title', content.subtitle || '- About Us');
//     const lines = Array.isArray(content.lines) && content.lines.length ? content.lines : (content.title ? String(content.title).split(/\n+/) : []);
//     ensureAboutLines(lines);
//     const media = content.imageUrl || content.image || '';
//     if (looksLikeVideo(media)) showAboutVideo(media); else hideAboutMedia();
//     applyAboutServices(content.services || []);
//   }
//   async function applyAbout() {
//     try {
//       const about = await api.getAbout();
//       if (about && (about.title || about.description || about.imageUrl || (about.lines && about.lines.length) || (about.services && about.services.length))) {
//         setText('.about .sec-head .sub-title', about.subtitle || '- About Us');
//         const lines = Array.isArray(about.lines) && about.lines.length ? about.lines : (about.title ? String(about.title).split(/\n+/) : []);
//         ensureAboutLines(lines);
//         if (looksLikeVideo(about.imageUrl || '')) showAboutVideo(about.imageUrl); else hideAboutMedia();
//         applyAboutServices(about.services || []);
//         return;
//       }
//     } catch (e) { log('No /api/about override;', e?.message || e); }
//     try {
//       const all = await api.getAllForTemplate();
//       const home = await api.getHomePage();
//       const pageSections = all.filter(s => String(s.parentPageId) === String(home?._id));
//       const aboutSection = pageSections.find(s => (s.type || '').toLowerCase() === 'about');
//       applyAboutFromSection(aboutSection);
//     } catch (e) { oops(e); }
//   }

//   // --------------- PROJECTS (“works”) — conservative ---------------
//   async function applyProjects() {
//     const root = $('section.works');
//     if (!root) return;

//     let payload = null;
//     try {
//       payload = await api.getProjects();
//     } catch (e) {
//       log('No /api/projects override;', e?.message || e);
//       return;
//     }

//     const items  = Array.isArray(payload?.projects) ? payload.projects : [];
//     const panels = $$('.works .panel', root);

//     panels.forEach((panel, i) => {
//       const data = items[i] || {};
//       const img  = panel.querySelector('.img img');

//       const abs  = toAbsUrl(data.imageUrl || '');
//       if (img && abs) setImg(img, abs);

//       const tagEl = panel.querySelector('.cont span');
//       const h5    = panel.querySelector('.cont h5');
//       const year  = panel.querySelector('.cont .ml-auto h6') || panel.querySelector('.cont h6');
//       const link  = panel.querySelector('a.link-overlay');

//       if (tagEl && data.tag)   tagEl.textContent = String(data.tag || '');
//       if (h5   && data.title)  h5.textContent    = String(data.title || '');
//       if (year && data.year)   year.textContent  = String(data.year || '');
//       if (link && data.href)   link.setAttribute('href', String(data.href));
//     });
//   }

//   // --------------- MARQUEE (non-destructive) ---------------
//   async function applyMarquee() {
//     const root = $('section.marquee');
//     if (!root) return;

//     let payload = null;
//     try {
//       payload = await api.getMarquee();
//     } catch (e) {
//       log('No /api/marquee override;', e?.message || e);
//       return;
//     }

//     const items = Array.isArray(payload?.items)
//       ? payload.items.map(x => ({ text: String(x?.text || ''), icon: String(x?.icon || '*') }))
//       : [];

//     if (!items.length) return;

//     const boxes = $$('.marquee .main-marq .slide-har .box', root);
//     boxes.forEach((box) => {
//       const itemNodes = $$('.item', box);
//       itemNodes.forEach((node, i) => {
//         const data = items[i % items.length];
//         const h4      = $('h4', node);
//         const spans   = h4 ? Array.from(h4.querySelectorAll('span')) : [];
//         const textEl  = spans.find(s => !s.classList.contains('icon')) || spans[0] || null;
//         const iconEl  = spans.find(s => s.classList.contains('icon')) || null;

//         if (textEl && data.text) textEl.textContent = data.text;
//         if (iconEl && data.icon) iconEl.textContent = data.icon;
//       });
//     });
//   }

//   // --------------- Main ----------------
//   async function run() {
//     log('Boot with', { BACKEND, USER_ID, TPL_ID });

//     const home = await api.getHomePage();
//     if (!home?._id) { warn('No page found for template', TPL_ID); return; }

//     const all = await api.getAllForTemplate();
//     const pageSections = all
//       .filter(s => String(s.parentPageId) === String(home._id))
//       .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

//     // 1) REORDER (your existing logic)
//     const orderedTypes = pageSections.map(s => String(s.type || '').toLowerCase());
//     reorderDomByTypes(orderedTypes);

//     // 2) LIFT decision: marquee over works only when marquee is before works
//     const idx = (t) => orderedTypes.indexOf(t);
//     const mIdx = idx('marquee');
//     const wIdx = Math.max(idx('works'), idx('projects')); // either selector points to the same wrapper
//     const earliestWorkIdx = ['works','projects'].map(idx).filter(i => i >= 0).reduce((a,b)=>Math.min(a,b), Infinity);
//     const marqueeBeforeWorks = (mIdx >= 0 && earliestWorkIdx !== Infinity) ? (mIdx < earliestWorkIdx) : false;

//     // 3) Reset any stale marquee heights (fixes big blank gap), then apply lift
//     resetMarqueeHeights();
//     setMarqueeLift(marqueeBeforeWorks);

//     // 4) Fill content
//     const byType = (t) => pageSections.find(s => (s.type || '').toLowerCase() === t);
//     await applyHeroPreferBackend(byType('hero'));
//     await applyAbout();
//     await applyProjects();
//     await applyMarquee();

//     // 5) After content loads, nudge layout calc
//     window.dispatchEvent(new Event('resize'));
//   }

//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => run().catch(oops));
//   } else {
//     run().catch(oops);
//   }
// })();














































// (() => {
//   'use strict';

//   /* =================== CONFIG =================== */
//   const BACKEND = (window.BACKEND_ORIGIN || '').replace(/\/+$/, '');
//   const USER_ID = window.APP_USER_ID || 'demo-user';
//   const TPL_ID  = window.APP_TEMPLATE_ID || 'sir-template-1';

//   const DEBUG = false;
//   const log  = (...a) => DEBUG && console.log('[Bayone CMS]', ...a);
//   const warn = (...a) => console.warn('[Bayone CMS]', ...a);
//   const oops = (e)   => console.error('[Bayone CMS] Failed:', e);

//   if (!BACKEND) warn('BACKEND_ORIGIN is not set. Define it in cms-boot.js');

//   /* =================== HELPERS =================== */
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
//     if (s.startsWith('assets/') || s.startsWith('/assets/')) return s; // theme assets
//     return toAbsUrl(s);
//   }

//   // DOM helpers
//   const $  = (s, root = document) => { try { return root.querySelector(s); } catch { return null; } };
//   const $$ = (s, root = document) => { try { return Array.from(root.querySelectorAll(s)); } catch { return []; } };

//   function setText(selOrEl, val) {
//     if (val == null) return;
//     const el = typeof selOrEl === 'string' ? $(selOrEl) : selOrEl;
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
//   function setAttr(sel, attr, val) {
//     const el = $(sel); if (!el) return;
//     if (val == null || val === '') el.removeAttribute(attr);
//     else el.setAttribute(attr, val);
//   }

//   // ScrollTrigger guards (theme safety)
//   function unwrapPinSpacer(el){
//     if (!el) return;
//     const p = el.parentElement;
//     if (p && p.classList.contains('pin-spacer')) {
//       p.parentNode.insertBefore(el, p);
//       p.remove();
//     }
//     el.style.transform = '';
//     el.style.willChange = '';
//     if (el.style.position === 'fixed') el.style.position = '';
//   }
//   function killScrollTriggerFor(el){
//     const ST = window.ScrollTrigger;
//     if (!ST || !el) return;
//     ST.getAll().forEach(t => {
//       if (t && (t.trigger === el || t.pin === el || (el.contains(t.trigger)))) {
//         try { t.kill(false); } catch {}
//       }
//     });
//   }

//   // MEDIA guards
//   function hideVideo(el) {
//     if (!el) return;
//     try { el.pause(); } catch {}
//     const src = $('source', el);
//     if (src) setAttr(src, 'src', '');
//     el.removeAttribute('poster');
//     el.style.display = 'none';
//     try { el.load && el.load(); } catch {}
//   }
//   const looksLikeVideo = (u) => /\.(mp4|webm|ogg)(\?|#|$)/i.test(String(u || ''));

//   /* =================== API =================== */
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
//   };

//   /* =================== HERO =================== */
//   function applyHeroMedia({ heading, imgUrl, videoUrl, posterUrl }) {
//     setText('.land-header .caption h1', heading);
//     const video  = $('.hero-video');
//     const source = $('.hero-source');
//     const imgEl  = $('.land-header img');

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
//   function applyHeroFromSection(section) {
//     if (!section) return;
//     const heading   = section.content?.heading ?? section.title ?? section.content?.headline ?? '';
//     const imgUrl    = section.content?.imageUrl || section.content?.image || '';
//     const videoUrl  = section.content?.videoUrl || '';
//     const posterUrl = section.content?.posterUrl || '';
//     applyHeroMedia({ heading, imgUrl, videoUrl, posterUrl });
//   }
//   async function applyHeroPreferBackend(section) {
//     try {
//       const hero = await api.getHero();
//       const heading  = (hero?.content || '').trim();
//       const imgUrl   = hero?.imageUrl || '';
//       const videoUrl = hero?.videoUrl || '';
//       const poster   = hero?.posterUrl || '';
//       if (heading || imgUrl || videoUrl || poster) {
//         applyHeroMedia({ heading, imgUrl, videoUrl, posterUrl: poster });
//         return;
//       }
//     } catch (e) { log('No hero override, fallback to section:', e?.message || e); }
//     applyHeroFromSection(section);
//   }

//   /* =================== ABOUT =================== */
//   function ensureAboutLines(lines) {
//     const wrap = document.querySelector('.about .intro .text-reval');
//     if (!wrap) return;
//     let spans = Array.from(wrap.querySelectorAll('.text'));
//     if (!spans.length) { const s = document.createElement('span'); s.className = 'text'; wrap.appendChild(s); spans = [s]; }
//     if (Array.isArray(lines) && lines.length) {
//       for (let i = 0; i < spans.length; i++) spans[i].textContent = lines[i] ? String(lines[i]) : '';
//       if (lines.length > spans.length) spans[spans.length - 1].textContent = lines.slice(spans.length - 1).join(' ');
//     } else if (typeof lines === 'string') {
//       spans[0].textContent = lines; for (let i = 1; i < spans.length; i++) spans[i].textContent = '';
//     } else { spans[0].textContent = ''; for (let i = 1; i < spans.length; i++) spans[i].textContent = ''; }
//   }
//   function hideAboutMedia() {
//     const container = $('.about .vid-intro .video-container');
//     const v = $('.about .vid-intro video');
//     hideVideo(v);
//     if (container) { container.style.display = 'none'; container.style.height = '0px'; container.style.padding = '0'; container.style.margin = '0'; }
//   }
//   function showAboutVideo(srcUrl) {
//     const container = $('.about .vid-intro .video-container');
//     const v = $('.about .vid-intro video');
//     const s = $('.about .vid-intro video source');
//     if (!container || !v || !s) return;
//     container.style.display = ''; container.style.height = ''; s.setAttribute('src', srcUrl);
//     try { v.load(); } catch {} v.style.display = '';
//   }
//   function applyAboutServices(services) {
//     const rows = Array.from(document.querySelectorAll('.about .serv-inline .item'));
//     if (!Array.isArray(services)) services = [];
//     rows.forEach((row, i) => {
//       const data = services[i] || null;
//       if (!row || !data) { if (row) row.style.display = ''; return; }
//       const numWrap = row.querySelector('.opacity-8');
//       let tagEl = row.querySelector('.text-u.ml-5') || (numWrap && numWrap.querySelector('.text-u')) || (numWrap && numWrap.querySelector('span:last-child'));
//       const titleEl = row.querySelector('h5') || row.querySelector('.cont h5') || row.querySelector('.d-flex h5');
//       const linkEl  = row.querySelector('a.animsition-link') || row.querySelector('a[href]');
//       const tag   = (data.tag   ?? data.category ?? '').toString();
//       const title = (data.title ?? data.heading  ?? '').toString();
//       const href  = (data.href  ?? '').toString();
//       if (tagEl)   tagEl.textContent   = tag;
//       if (titleEl) titleEl.textContent = title;
//       if (linkEl)  linkEl.setAttribute('href', href || '#');
//     });
//   }
//   function applyAboutFromSection(section) {
//     if (!section) { hideAboutMedia(); return; }
//     const content = section.content || {};
//     setText('.about .sec-head .sub-title', content.subtitle || '- About Us');
//     const lines = Array.isArray(content.lines) && content.lines.length ? content.lines : (content.title ? String(content.title).split(/\n+/) : []);
//     ensureAboutLines(lines);
//     const media = content.imageUrl || content.image || '';
//     if (looksLikeVideo(media)) showAboutVideo(media); else hideAboutMedia();
//     applyAboutServices(content.services || []);
//   }
//   async function applyAbout() {
//     try {
//       const about = await api.getAbout();
//       if (about && (about.title || about.description || about.imageUrl || (about.lines && about.lines.length) || (about.services && about.services.length))) {
//         setText('.about .sec-head .sub-title', about.subtitle || '- About Us');
//         const lines = Array.isArray(about.lines) && about.lines.length ? about.lines : (about.title ? String(about.title).split(/\n+/) : []);
//         ensureAboutLines(lines);
//         if (looksLikeVideo(about.imageUrl || '')) showAboutVideo(about.imageUrl); else hideAboutMedia();
//         applyAboutServices(about.services || []); 
//         return;
//       }
//     } catch (e) { log('No /api/about override;', e?.message || e); }
//     try {
//       const all = await api.getAllForTemplate();
//       const home = await api.getHomePage();
//       const pageSections = all.filter(s => String(s.parentPageId) === String(home?._id));
//       const aboutSection = pageSections.find(s => (s.type || '').toLowerCase() === 'about');
//       applyAboutFromSection(aboutSection);
//     } catch (e) { oops(e); }
//   }

//   /* =================== PROJECTS =================== */
//   async function applyProjects() {
//     const root = $('section.works');
//     if (!root) return;

//     let payload = null;
//     try { payload = await api.getProjects(); }
//     catch (e) { log('No /api/projects override;', e?.message || e); return; }

//     const items  = Array.isArray(payload?.projects) ? payload.projects : [];
//     const panels = $$('.works .panel', root);

//     panels.forEach((panel, i) => {
//       const data = items[i] || {};
//       const box  = panel.querySelector('.img');
//       const img  = box ? box.querySelector('img') : null;
//       const abs  = resolveMediaUrl(data.imageUrl || '');
//       if (img) setImg(img, abs || '');

//       const tagEl = panel.querySelector('.cont span');
//       const h5    = panel.querySelector('.cont h5');
//       const year  = panel.querySelector('.cont .ml-auto h6') || panel.querySelector('.cont h6');
//       const link  = panel.querySelector('a.link-overlay');

//       if (tagEl) tagEl.textContent = String(data.tag || '');
//       if (h5)    h5.textContent    = String(data.title || '');
//       if (year)  year.textContent  = String(data.year || '');
//       if (link)  link.setAttribute('href', String(data.href || '#'));
//     });
//   }

//   /* =================== MARQUEE =================== */
//   function resetMarqueeHeights() {
//     const marq = $('section.marquee');
//     if (!marq) return;
//     const a = marq;
//     const b = marq.querySelector('.main-marq');
//     const c = marq.querySelector('.slide-har');
//     [a,b,c].forEach(n => {
//       if (!n) return;
//       n.style.height = '';
//       n.style.minHeight = '';
//       n.style.marginTop = '';
//       n.style.transform = '';
//     });
//   }
//   function liftMarqueeAboveWorks() {
//     const works = document.querySelector('section.works');
//     const marquee = document.querySelector('section.marquee');
//     if (!works || !marquee) return;
//     if (getComputedStyle(works).position === 'static') works.style.position = 'relative';
//     if (getComputedStyle(marquee).position === 'static') marquee.style.position = 'relative';
//     if (!works.style.zIndex) works.style.zIndex = '20';
//     marquee.style.zIndex = '30';
//     if (getComputedStyle(works).overflow !== 'visible') works.style.overflow = 'visible';
//     if (!marquee.style.marginTop) marquee.style.marginTop = '60px';
//   }
//   async function applyMarquee() {
//     const root = $('section.marquee');
//     if (!root) return;
//     resetMarqueeHeights();
//     let payload = null;
//     try { payload = await api.getMarquee(); }
//     catch (e) { log('No /api/marquee override;', e?.message || e); return; }

//     const items = Array.isArray(payload?.items)
//       ? payload.items.map(x => ({ text: String(x?.text || ''), icon: String(x?.icon || '*') }))
//       : [];

//     if (items.length) {
//       const boxes = $$('.marquee .main-marq .slide-har .box', root);
//       boxes.forEach((box) => {
//         const itemNodes = $$('.item', box);
//         itemNodes.forEach((node, i) => {
//           const data = items[i % items.length];
//           const h4      = $('h4', node);
//           const spans   = h4 ? Array.from(h4.querySelectorAll('span')) : [];
//           const textEl  = spans.find(s => !s.classList.contains('icon')) || spans[0] || null;
//           const iconEl  = spans.find(s => s.classList.contains('icon')) || null;
//           if (textEl) textEl.textContent = data.text;
//           if (iconEl) iconEl.textContent = data.icon;
//         });
//       });
//     }
//   }

//   /* =================== SERVICES (accordion) =================== */
//   async function applyServices() {
//     const accRoot = document.querySelector('.accordion');
//     if (!accRoot) return;

//     let payload = null;
//     try { payload = await api.getServices(); }
//     catch (e) { log('No /api/services override;', e?.message || e); return; }

//     const items = Array.isArray(payload?.services) ? payload.services : [];
//     if (!items.length) return;

//     const wrapper = accRoot;
//     let rows = Array.from(wrapper.querySelectorAll('.item'));

//     if (rows.length < items.length && rows.length) {
//       const tpl = rows[rows.length - 1];
//       for (let i = rows.length; i < items.length; i++) {
//         wrapper.appendChild(tpl.cloneNode(true));
//       }
//       rows = Array.from(wrapper.querySelectorAll('.item'));
//     }

//     rows.forEach((row, i) => {
//       const data = items[i];
//       if (!data) { row.style.display = 'none'; return; }
//       row.style.display = '';

//       const h4 = row.querySelector('.title h4') || row.querySelector('h4');
//       const p  = row.querySelector('.accordion-info p') || row.querySelector('.accordion-info') || row.querySelector('p');
//       const delay = String(data.delay || `.${Math.min(i + 1, 9)}s`);
//       row.setAttribute('data-wow-delay', delay);

//       if (h4) h4.textContent = String(data.title || '');
//       if (p)  p.textContent  = String(data.description || '');
//     });
//   }

//   /* =================== BRANDS (carousel) =================== */
//   async function applyBrands() {
//     const root = $('.clients-carso');
//     if (!root) return;

//     let payload = null;
//     try { payload = await api.getBrands(); }
//     catch (e) { log('No /api/brands override;', e?.message || e); return; }

//     const items = Array.isArray(payload?.items) ? payload.items : [];
//     if (!items.length) return;

//     const wrapper = root.querySelector('.swiper-wrapper');
//     if (!wrapper) return;

//     let slides = Array.from(wrapper.querySelectorAll('.swiper-slide'));

//     if (slides.length < items.length && slides.length) {
//       const tpl = slides[slides.length - 1];
//       for (let i = slides.length; i < items.length; i++) {
//         wrapper.appendChild(tpl.cloneNode(true));
//       }
//       slides = Array.from(wrapper.querySelectorAll('.swiper-slide'));
//     }

//     slides.forEach((slide, i) => {
//       const data = items[i];
//       if (!data) { slide.style.display = 'none'; return; }
//       slide.style.display = '';

//       const a   = slide.querySelector('a[href]') || slide.querySelector('a');
//       const img = slide.querySelector('img');

//       if (a) a.setAttribute('href', String(data.href || '#'));
//       if (img) {
//         setImg(img, resolveMediaUrl(data.imageUrl || ''));
//         img.setAttribute('alt', String(data.alt || 'Brand'));
//       }
//     });

//     try {
//       if (root.swiper && typeof root.swiper.update === 'function') root.swiper.update();
//       else if (wrapper.swiper && typeof wrapper.swiper.update === 'function') wrapper.swiper.update();
//     } catch {}

//     window.dispatchEvent(new Event('resize'));
//   }

//   /* =================== BLOG LIST (preserve pop-out UI) =================== */
// async function applyBlogs() {
//   const root = document.querySelector("section.blog-list");
//   if (!root) return;

//   let payload = null;
//   try { payload = await api.getBlogs(); }
//   catch (e) { console.warn("[Bayone CMS] No /api/blogs override;", e?.message || e); return; }

//   const posts = Array.isArray(payload?.items)
//     ? payload.items.slice().sort((a,b) => (a.order ?? 0) - (b.order ?? 0))
//     : [];

//   const rows = Array.from(root.querySelectorAll(".item.block"));
//   if (!rows.length || !posts.length) return;

//   rows.forEach((row, i) => {
//     const p = posts[i];
//     if (!p) { row.style.display = "none"; return; }
//     row.style.display = "";

//     // text
//     const info = row.querySelector(".info");
//     const h3   = row.querySelector(".cont h3, .cont .text-u, h3");
//     if (info) {
//       let tagEl = info.querySelector(".tag");
//       if (!tagEl) { tagEl = document.createElement("span"); tagEl.className = "tag"; info.prepend(tagEl); }
//       tagEl.textContent = String(p.tag || "");

//       let dateEl = info.querySelector(".date");
//       if (!dateEl) { dateEl = document.createElement("span"); dateEl.className = "date"; info.appendChild(dateEl); }
//       dateEl.textContent = String(p.date || "");
//     }
//     if (h3) h3.textContent = String(p.title || "");

//     // link + pop-out image
//     const href   = String(p.href || "blog-details.html");
//     const anchor = row.querySelector("a.block__link");
//     // image source from dashboard (presigned URL or key)
//     const rawImg = p.imageUrl || p.presignedUrl || p.imageKey || "";
//     const imgAbs = /^https?:\/\//i.test(rawImg) ? rawImg : resolveMediaUrl(rawImg);

//     if (anchor) {
//       anchor.setAttribute("href", href);
//       if (imgAbs) {
//         anchor.setAttribute("data-img", imgAbs);
//         // PRELOAD so the hover effect has it instantly
//         const preload = new Image();
//         preload.decoding = "async";
//         preload.src = imgAbs;
//       } else {
//         anchor.removeAttribute("data-img");
//       }
//     }

//     // DO NOT inject or keep stray <img> tags – the theme draws the hover image itself
//     const strayImg = row.querySelector(":scope > img, .row > img");
//     if (strayImg) strayImg.remove();

//     // delay for wow
//     row.setAttribute("data-wow-delay", String(p.delay || `.${Math.min(i + 2, 9)}`));
//   });

//   // Re-init the theme’s hover effect if it only bound handlers at page load.
//   // (Different builds use different names – we try a few and also emit a custom event.)
//   try {
//     if (window.HoverImg) window.HoverImg();               // some builds
//     if (window.initHoverImg) window.initHoverImg();       // others
//     if (window.three_img_hover) window.three_img_hover(); // some demos
//   } catch {}
//   try { document.dispatchEvent(new Event("cms:blogs-updated")); } catch {}
// }

//   /* =================== VISUAL ORDER =================== */
//   function applyVisualOrder(orderedTypes) {
//     const idx = (t) => orderedTypes.indexOf(t);
//     const worksIdx = Math.min(...['works','projects'].map(idx).filter(i => i >= 0));
//     const marqueeIdx = idx('marquee');
//     const brandsIdx  = idx('brands');

//     const marqueeEl = $('section.marquee');
//     const brandsEl  = $('.clients-carso');
//     [marqueeEl, brandsEl].forEach(el => { if (el) { killScrollTriggerFor(el); unwrapPinSpacer(el); } });

//     if (worksIdx >= 0 && marqueeIdx >= 0 && marqueeIdx < worksIdx) {
//       resetMarqueeHeights();
//       liftMarqueeAboveWorks();
//     } else if (marqueeEl) {
//       marqueeEl.style.zIndex = '';
//       marqueeEl.style.marginTop = '';
//     }

//     if (worksIdx >= 0 && brandsIdx >= 0 && brandsIdx < worksIdx && brandsEl) {
//       const works = $('section.works');
//       if (works) {
//         if (getComputedStyle(works).position === 'static') works.style.position = 'relative';
//         if (getComputedStyle(brandsEl).position === 'static') brandsEl.style.position = 'relative';
//         if (!works.style.zIndex) works.style.zIndex = '20';
//         brandsEl.style.zIndex = '25';
//         if (getComputedStyle(works).overflow !== 'visible') works.style.overflow = 'visible';
//       }
//     } else if (brandsEl) {
//       brandsEl.style.zIndex = '';
//     }

//     try { window.ScrollTrigger && window.ScrollTrigger.refresh(true); } catch {}
//   }

//   /* =================== MAIN =================== */
//   async function run() {
//     log('Boot with', { BACKEND, USER_ID, TPL_ID });

//     const home = await api.getHomePage();
//     if (!home?._id) { warn('No page found for template', TPL_ID); return; }

//     const all = await api.getAllForTemplate();
//     const pageSections = all
//       .filter(s => String(s.parentPageId) === String(home._id))
//       .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

//     const orderedTypes = pageSections.map(s => String(s.type || '').toLowerCase());
//     const byType = (t) => pageSections.find(s => (s.type || '').toLowerCase() === t);

//     await applyHeroPreferBackend(byType('hero'));
//     await applyAbout();
//     await applyProjects();
//     await applyMarquee();
//     await applyServices();
//     await applyBlogs();     // <-- blogs from dashboard, with theme pop-out
//     await applyBrands();

//     applyVisualOrder(orderedTypes);

//     window.dispatchEvent(new Event('resize'));
//   }

//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => run().catch(oops));
//   } else {
//     run().catch(oops);
//   }
// })();



























// (() => {
//   'use strict';

//   /* =================== CONFIG =================== */
//   const BACKEND = (window.BACKEND_ORIGIN || '').replace(/\/+$/, '');
//   const USER_ID = window.APP_USER_ID || 'demo-user';
//   const TPL_ID  = window.APP_TEMPLATE_ID || 'sir-template-1';

//   const DEBUG = false;
//   const log  = (...a) => DEBUG && console.log('[Bayone CMS]', ...a);
//   const warn = (...a) => console.warn('[Bayone CMS]', ...a);
//   const oops = (e)   => console.error('[Bayone CMS] Failed:', e);

//   if (!BACKEND) warn('BACKEND_ORIGIN is not set. Define it in cms-boot.js');

//   /* =================== HELPERS =================== */
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
//     if (s.startsWith('assets/') || s.startsWith('/assets/')) return s; // theme assets
//     return toAbsUrl(s);
//   }

//   // DOM helpers
//   const $  = (s, root = document) => { try { return root.querySelector(s); } catch { return null; } };
//   const $$ = (s, root = document) => { try { return Array.from(root.querySelectorAll(s)); } catch { return []; } };

//   function setText(selOrEl, val) {
//     if (val == null) return;
//     const el = typeof selOrEl === 'string' ? $(selOrEl) : selOrEl;
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
//   function setAttr(selOrEl, attr, val) {
//     const el = typeof selOrEl === 'string' ? $(selOrEl) : selOrEl;
//     if (!el) return;
//     if (val == null || val === '') el.removeAttribute(attr);
//     else el.setAttribute(attr, val);
//   }

//   // ScrollTrigger guards (theme safety)
//   function unwrapPinSpacer(el){
//     if (!el) return;
//     const p = el.parentElement;
//     if (p && p.classList.contains('pin-spacer')) {
//       p.parentNode.insertBefore(el, p);
//       p.remove();
//     }
//     el.style.transform = '';
//     el.style.willChange = '';
//     if (el.style.position === 'fixed') el.style.position = '';
//   }
//   function killScrollTriggerFor(el){
//     const ST = window.ScrollTrigger;
//     if (!ST || !el) return;
//     ST.getAll().forEach(t => {
//       if (t && (t.trigger === el || t.pin === el || (el.contains(t.trigger)))) {
//         try { t.kill(false); } catch {}
//       }
//     });
//   }

//   // MEDIA guards
//   function hideVideo(el) {
//     if (!el) return;
//     try { el.pause(); } catch {}
//     const src = $('source', el);
//     if (src) setAttr(src, 'src', '');
//     el.removeAttribute('poster');
//     el.style.display = 'none';
//     try { el.load && el.load(); } catch {}
//   }
//   const looksLikeVideo = (u) => /\.(mp4|webm|ogg)(\?|#|$)/i.test(String(u || ''));

//   /* =================== API =================== */
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
//     // NEW: Contact
//     getContact:  async () => getJson(`${BACKEND}/api/contact-info/${encodeURIComponent(USER_ID)}/${encodeURIComponent(TPL_ID)}`),
//   };

//   /* =================== HERO =================== */
//   function applyHeroMedia({ heading, imgUrl, videoUrl, posterUrl }) {
//     setText('.land-header .caption h1', heading);
//     const video  = $('.hero-video');
//     const source = $('.hero-source');
//     const imgEl  = $('.land-header img');

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
//   function applyHeroFromSection(section) {
//     if (!section) return;
//     const heading   = section.content?.heading ?? section.title ?? section.content?.headline ?? '';
//     const imgUrl    = section.content?.imageUrl || section.content?.image || '';
//     const videoUrl  = section.content?.videoUrl || '';
//     const posterUrl = section.content?.posterUrl || '';
//     applyHeroMedia({ heading, imgUrl, videoUrl, posterUrl });
//   }
//   async function applyHeroPreferBackend(section) {
//     try {
//       const hero = await api.getHero();
//       const heading  = (hero?.content || '').trim();
//       const imgUrl   = hero?.imageUrl || '';
//       const videoUrl = hero?.videoUrl || '';
//       const poster   = hero?.posterUrl || '';
//       if (heading || imgUrl || videoUrl || poster) {
//         applyHeroMedia({ heading, imgUrl, videoUrl, posterUrl: poster });
//         return;
//       }
//     } catch (e) { log('No hero override, fallback to section:', e?.message || e); }
//     applyHeroFromSection(section);
//   }

//   /* =================== ABOUT =================== */
//   function ensureAboutLines(lines) {
//     const wrap = document.querySelector('.about .intro .text-reval');
//     if (!wrap) return;
//     let spans = Array.from(wrap.querySelectorAll('.text'));
//     if (!spans.length) { const s = document.createElement('span'); s.className = 'text'; wrap.appendChild(s); spans = [s]; }
//     if (Array.isArray(lines) && lines.length) {
//       for (let i = 0; i < spans.length; i++) spans[i].textContent = lines[i] ? String(lines[i]) : '';
//       if (lines.length > spans.length) spans[spans.length - 1].textContent = lines.slice(spans.length - 1).join(' ');
//     } else if (typeof lines === 'string') {
//       spans[0].textContent = lines; for (let i = 1; i < spans.length; i++) spans[i].textContent = '';
//     } else { spans[0].textContent = ''; for (let i = 1; i < spans.length; i++) spans[i].textContent = ''; }
//   }
//   function hideAboutMedia() {
//     const container = $('.about .vid-intro .video-container');
//     const v = $('.about .vid-intro video');
//     hideVideo(v);
//     if (container) { container.style.display = 'none'; container.style.height = '0px'; container.style.padding = '0'; container.style.margin = '0'; }
//   }
//   function showAboutVideo(srcUrl) {
//     const container = $('.about .vid-intro .video-container');
//     const v = $('.about .vid-intro video');
//     const s = $('.about .vid-intro video source');
//     if (!container || !v || !s) return;
//     container.style.display = ''; container.style.height = ''; s.setAttribute('src', srcUrl);
//     try { v.load(); } catch {} v.style.display = '';
//   }
//   function applyAboutServices(services) {
//     const rows = Array.from(document.querySelectorAll('.about .serv-inline .item'));
//     if (!Array.isArray(services)) services = [];
//     rows.forEach((row, i) => {
//       const data = services[i] || null;
//       if (!row || !data) { if (row) row.style.display = ''; return; }
//       const numWrap = row.querySelector('.opacity-8');
//       let tagEl = row.querySelector('.text-u.ml-5') || (numWrap && numWrap.querySelector('.text-u')) || (numWrap && numWrap.querySelector('span:last-child'));
//       const titleEl = row.querySelector('h5') || row.querySelector('.cont h5') || row.querySelector('.d-flex h5');
//       const linkEl  = row.querySelector('a.animsition-link') || row.querySelector('a[href]');
//       const tag   = (data.tag   ?? data.category ?? '').toString();
//       const title = (data.title ?? data.heading  ?? '').toString();
//       const href  = (data.href  ?? '').toString();
//       if (tagEl)   tagEl.textContent   = tag;
//       if (titleEl) titleEl.textContent = title;
//       if (linkEl)  linkEl.setAttribute('href', href || '#');
//     });
//   }
//   function applyAboutFromSection(section) {
//     if (!section) { hideAboutMedia(); return; }
//     const content = section.content || {};
//     setText('.about .sec-head .sub-title', content.subtitle || '- About Us');
//     const lines = Array.isArray(content.lines) && content.lines.length ? content.lines : (content.title ? String(content.title).split(/\n+/) : []);
//     ensureAboutLines(lines);
//     const media = content.imageUrl || content.image || '';
//     if (looksLikeVideo(media)) showAboutVideo(media); else hideAboutMedia();
//     applyAboutServices(content.services || []);
//   }
//   async function applyAbout() {
//     try {
//       const about = await api.getAbout();
//       if (about && (about.title || about.description || about.imageUrl || (about.lines && about.lines.length) || (about.services && about.services.length))) {
//         setText('.about .sec-head .sub-title', about.subtitle || '- About Us');
//         const lines = Array.isArray(about.lines) && about.lines.length ? about.lines : (about.title ? String(about.title).split(/\n+/) : []);
//         ensureAboutLines(lines);
//         if (looksLikeVideo(about.imageUrl || '')) showAboutVideo(about.imageUrl); else hideAboutMedia();
//         applyAboutServices(about.services || {}); 
//         return;
//       }
//     } catch (e) { log('No /api/about override;', e?.message || e); }
//     try {
//       const all = await api.getAllForTemplate();
//       const home = await api.getHomePage();
//       const pageSections = all.filter(s => String(s.parentPageId) === String(home?._id));
//       const aboutSection = pageSections.find(s => (s.type || '').toLowerCase() === 'about');
//       applyAboutFromSection(aboutSection);
//     } catch (e) { oops(e); }
//   }

//   /* =================== PROJECTS =================== */
//   async function applyProjects() {
//     const root = $('section.works');
//     if (!root) return;

//     let payload = null;
//     try { payload = await api.getProjects(); }
//     catch (e) { log('No /api/projects override;', e?.message || e); return; }

//     const items  = Array.isArray(payload?.projects) ? payload.projects : [];
//     const panels = $$('.works .panel', root);

//     panels.forEach((panel, i) => {
//       const data = items[i] || {};
//       const box  = panel.querySelector('.img');
//       const img  = box ? box.querySelector('img') : null;
//       const abs  = resolveMediaUrl(data.imageUrl || '');
//       if (img) setImg(img, abs || '');

//       const tagEl = panel.querySelector('.cont span');
//       const h5    = panel.querySelector('.cont h5');
//       const year  = panel.querySelector('.cont .ml-auto h6') || panel.querySelector('.cont h6');
//       const link  = panel.querySelector('a.link-overlay');

//       if (tagEl) tagEl.textContent = String(data.tag || '');
//       if (h5)    h5.textContent    = String(data.title || '');
//       if (year)  year.textContent  = String(data.year || '');
//       if (link)  link.setAttribute('href', String(data.href || '#'));
//     });
//   }

//   /* =================== MARQUEE =================== */
//   function resetMarqueeHeights() {
//     const marq = $('section.marquee');
//     if (!marq) return;
//     const a = marq;
//     const b = marq.querySelector('.main-marq');
//     const c = marq.querySelector('.slide-har');
//     [a,b,c].forEach(n => {
//       if (!n) return;
//       n.style.height = '';
//       n.style.minHeight = '';
//       n.style.marginTop = '';
//       n.style.transform = '';
//     });
//   }
//   function liftMarqueeAboveWorks() {
//     const works = document.querySelector('section.works');
//     const marquee = document.querySelector('section.marquee');
//     if (!works || !marquee) return;
//     if (getComputedStyle(works).position === 'static') works.style.position = 'relative';
//     if (getComputedStyle(marquee).position === 'static') marquee.style.position = 'relative';
//     if (!works.style.zIndex) works.style.zIndex = '20';
//     marquee.style.zIndex = '30';
//     if (getComputedStyle(works).overflow !== 'visible') works.style.overflow = 'visible';
//     if (!marquee.style.marginTop) marquee.style.marginTop = '60px';
//   }
//   async function applyMarquee() {
//     const root = $('section.marquee');
//     if (!root) return;
//     resetMarqueeHeights();
//     let payload = null;
//     try { payload = await api.getMarquee(); }
//     catch (e) { log('No /api/marquee override;', e?.message || e); return; }

//     const items = Array.isArray(payload?.items)
//       ? payload.items.map(x => ({ text: String(x?.text || ''), icon: String(x?.icon || '*') }))
//       : [];

//     if (items.length) {
//       const boxes = $$('.marquee .main-marq .slide-har .box', root);
//       boxes.forEach((box) => {
//         const itemNodes = $$('.item', box);
//         itemNodes.forEach((node, i) => {
//           const data = items[i % items.length];
//           const h4      = $('h4', node);
//           const spans   = h4 ? Array.from(h4.querySelectorAll('span')) : [];
//           const textEl  = spans.find(s => !s.classList.contains('icon')) || spans[0] || null;
//           const iconEl  = spans.find(s => s.classList.contains('icon')) || null;
//           if (textEl) textEl.textContent = data.text;
//           if (iconEl) iconEl.textContent = data.icon;
//         });
//       });
//     }
//   }

//   /* =================== SERVICES (accordion) =================== */
//   async function applyServices() {
//     const accRoot = document.querySelector('.accordion');
//     if (!accRoot) return;

//     let payload = null;
//     try { payload = await api.getServices(); }
//     catch (e) { log('No /api/services override;', e?.message || e); return; }

//     const items = Array.isArray(payload?.services) ? payload.services : [];
//     if (!items.length) return;

//     const wrapper = accRoot;
//     let rows = Array.from(wrapper.querySelectorAll('.item'));

//     if (rows.length < items.length && rows.length) {
//       const tpl = rows[rows.length - 1];
//       for (let i = rows.length; i < items.length; i++) {
//         wrapper.appendChild(tpl.cloneNode(true));
//       }
//       rows = Array.from(wrapper.querySelectorAll('.item'));
//     }

//     rows.forEach((row, i) => {
//       const data = items[i];
//       if (!data) { row.style.display = 'none'; return; }
//       row.style.display = '';

//       const h4 = row.querySelector('.title h4') || row.querySelector('h4');
//       const p  = row.querySelector('.accordion-info p') || row.querySelector('.accordion-info') || row.querySelector('p');
//       const delay = String(data.delay || `.${Math.min(i + 1, 9)}s`);
//       row.setAttribute('data-wow-delay', delay);

//       if (h4) h4.textContent = String(data.title || '');
//       if (p)  p.textContent  = String(data.description || '');
//     });
//   }

//   /* =================== BRANDS (carousel) =================== */
//   async function applyBrands() {
//     const root = $('.clients-carso');
//     if (!root) return;

//     let payload = null;
//     try { payload = await api.getBrands(); }
//     catch (e) { log('No /api/brands override;', e?.message || e); return; }

//     const items = Array.isArray(payload?.items) ? payload.items : [];
//     if (!items.length) return;

//     const wrapper = root.querySelector('.swiper-wrapper');
//     if (!wrapper) return;

//     let slides = Array.from(wrapper.querySelectorAll('.swiper-slide'));

//     if (slides.length < items.length && slides.length) {
//       const tpl = slides[slides.length - 1];
//       for (let i = slides.length; i < items.length; i++) {
//         wrapper.appendChild(tpl.cloneNode(true));
//       }
//       slides = Array.from(wrapper.querySelectorAll('.swiper-slide'));
//     }

//     slides.forEach((slide, i) => {
//       const data = items[i];
//       if (!data) { slide.style.display = 'none'; return; }
//       slide.style.display = '';

//       const a   = slide.querySelector('a[href]') || slide.querySelector('a');
//       const img = slide.querySelector('img');

//       if (a) a.setAttribute('href', String(data.href || '#'));
//       if (img) {
//         setImg(img, resolveMediaUrl(data.imageUrl || ''));
//         img.setAttribute('alt', String(data.alt || 'Brand'));
//       }
//     });

//     try {
//       if (root.swiper && typeof root.swiper.update === 'function') root.swiper.update();
//       else if (wrapper.swiper && typeof wrapper.swiper.update === 'function') wrapper.swiper.update();
//     } catch {}

//     window.dispatchEvent(new Event('resize'));
//   }

//   /* =================== BLOG LIST (preserve pop-out UI) =================== */
//   async function applyBlogs() {
//     const root = document.querySelector("section.blog-list");
//     if (!root) return;

//     let payload = null;
//     try { payload = await api.getBlogs(); }
//     catch (e) { console.warn("[Bayone CMS] No /api/blogs override;", e?.message || e); return; }

//     const posts = Array.isArray(payload?.items)
//       ? payload.items.slice().sort((a,b) => (a.order ?? 0) - (b.order ?? 0))
//       : [];

//     const rows = Array.from(root.querySelectorAll(".item.block"));
//     if (!rows.length || !posts.length) return;

//     rows.forEach((row, i) => {
//       const p = posts[i];
//       if (!p) { row.style.display = "none"; return; }
//       row.style.display = "";

//       const info = row.querySelector(".info");
//       const h3   = row.querySelector(".cont h3, .cont .text-u, h3");
//       if (info) {
//         let tagEl = info.querySelector(".tag");
//         if (!tagEl) { tagEl = document.createElement("span"); tagEl.className = "tag"; info.prepend(tagEl); }
//         tagEl.textContent = String(p.tag || "");

//         let dateEl = info.querySelector(".date");
//         if (!dateEl) { dateEl = document.createElement("span"); dateEl.className = "date"; info.appendChild(dateEl); }
//         dateEl.textContent = String(p.date || "");
//       }
//       if (h3) h3.textContent = String(p.title || "");

//       const href   = String(p.href || "blog-details.html");
//       const anchor = row.querySelector("a.block__link");

//       const rawImg = p.imageUrl || p.presignedUrl || p.imageKey || "";
//       const imgAbs = /^https?:\/\//i.test(rawImg) ? rawImg : resolveMediaUrl(rawImg);

//       if (anchor) {
//         anchor.setAttribute("href", href);
//         if (imgAbs) {
//           anchor.setAttribute("data-img", imgAbs);

//           const preload = new Image();
//           preload.decoding = "async";
//           preload.src = imgAbs;
//         } else {
//           anchor.removeAttribute("data-img");
//         }
//       }

//       const strayImg = row.querySelector(":scope > img, .row > img");
//       if (strayImg) strayImg.remove();

//       row.setAttribute("data-wow-delay", String(p.delay || `.${Math.min(i + 2, 9)}`));
//     });

//     try {
//       if (window.HoverImg) window.HoverImg();
//       if (window.initHoverImg) window.initHoverImg();
//       if (window.three_img_hover) window.three_img_hover();
//     } catch {}
//     try { document.dispatchEvent(new Event("cms:blogs-updated")); } catch {}
//   }

//   /* =================== CONTACT =================== */
//   function applyContactSir(data) {
//     const root = document.querySelector('section.contact');
//     if (!root) return;

//     // Subtitle
//     const sub = root.querySelector('.sec-head .sub-title');
//     if (sub) setText(sub, data.subtitle || '- Contact Us');

//     // Title: bold + light span
//     const h3  = root.querySelector('.sec-head h3') || root.querySelector('.sec-head .text-u');
//     const lite = h3 ? h3.querySelector('.f-ultra-light') : null;
//     if (h3) {
//       const strong = String(data.titleStrong || '').trim() || 'Get In';
//       const light  = String(data.titleLight  || '').trim() || 'Touch';
//       if (lite) {
//         setText(lite, light);
//         const h3Text = h3.firstChild && h3.firstChild.nodeType === 3 ? h3.firstChild : null;
//         if (h3Text) h3Text.textContent = `${strong} `;
//         else h3.insertBefore(document.createTextNode(`${strong} `), h3.firstChild);
//       } else {
//         setText(h3, `${strong} ${light}.`);
//       }
//     }

//     // Form action + placeholders (preview safety)
//     const form = root.querySelector('form#contact-form');
//     if (form) {
//       const action = String(data.formAction || '').trim();
//       if (action) form.setAttribute('action', action);

//       const name  = form.querySelector('#form_name');
//       const email = form.querySelector('#form_email');
//       const msg   = form.querySelector('#form_message');
//       if (name)  setAttr(name, 'placeholder', 'Name');
//       if (email) setAttr(email,'placeholder', 'Email');
//       if (msg)   setAttr(msg,  'placeholder', 'Message');

//       // Button text
//       const btnTxt = root.querySelector('.hover-this .hover-anim .text') ||
//                      root.querySelector('button .text') ||
//                      root.querySelector('button');
//       if (btnTxt) setText(btnTxt, data.buttonText || "Let's Talk");
//     }
//   }

//   function applyContactGym(data) {
//     // Try to locate a typical footer/contact info block
//     const officeWrap = document.querySelector('.contact-info, .footer, .bg-dark');
//     if (!officeWrap) return;

//     // Address / phone / email (best-effort selectors)
//     const addrEl = officeWrap.querySelector('.address, .fa-map-marker-alt')?.closest('p') ||
//                    officeWrap.querySelector('[data-cms="address"]') || null;
//     const phoneEl = officeWrap.querySelector('.fa-phone, .fa-phone-alt')?.closest('p') ||
//                     officeWrap.querySelector('[data-cms="phone"]') || null;
//     const emailEl = officeWrap.querySelector('.fa-envelope')?.closest('p') ||
//                     officeWrap.querySelector('[data-cms="email"]') || null;

//     if (addrEl)  setText(addrEl, data.address || '');
//     if (phoneEl) setText(phoneEl, data.phone || '');
//     if (emailEl) setText(emailEl, data.email || '');

//     // Social badges/links
//     const socials = {
//       twitter:  officeWrap.querySelector('a[href*="twitter"], [data-cms="twitter"]'),
//       facebook: officeWrap.querySelector('a[href*="facebook"], [data-cms="facebook"]'),
//       youtube:  officeWrap.querySelector('a[href*="youtube"], [data-cms="youtube"]'),
//       linkedin: officeWrap.querySelector('a[href*="linkedin"], [data-cms="linkedin"]'),
//     };
//     const sl = data.socialLinks || {};
//     Object.entries(socials).forEach(([key, el]) => {
//       if (!el) return;
//       const url = String(sl[key] || '').trim();
//       if (url) el.setAttribute('href', ABS_RX.test(url) ? url : `https://${url.replace(/^\/+/, '')}`);
//     });

//     // Business hours
//     const hoursWrap = officeWrap; // search inside same block
//     const monFri = hoursWrap.querySelector('[data-cms="hours-mf"], .hours-mf, .monday-friday');
//     const sat    = hoursWrap.querySelector('[data-cms="hours-sa"], .hours-sa, .saturday');
//     const sun    = hoursWrap.querySelector('[data-cms="hours-su"], .hours-su, .sunday');
//     if (monFri) setText(monFri, data.businessHours?.mondayToFriday || '');
//     if (sat)    setText(sat,    data.businessHours?.saturday      || '');
//     if (sun)    setText(sun,    data.businessHours?.sunday        || '');
//   }

//   async function applyContact() {
//     let payload = null;
//     try { payload = await api.getContact(); }
//     catch (e) { log('No /api/contact-info override;', e?.message || e); return; }
//     if (!payload) return;

//     // Heuristic: if contact form exists, treat as SIR-style; otherwise fill info/footer (gym)
//     const hasSirForm = !!document.querySelector('section.contact form#contact-form');
//     if (hasSirForm) applyContactSir(payload);
//     else applyContactGym(payload);
//   }

//   /* =================== VISUAL ORDER =================== */
//   function applyVisualOrder(orderedTypes) {
//     const idx = (t) => orderedTypes.indexOf(t);
//     const worksIdx = Math.min(...['works','projects'].map(idx).filter(i => i >= 0));
//     const marqueeIdx = idx('marquee');
//     const brandsIdx  = idx('brands');

//     const marqueeEl = $('section.marquee');
//     const brandsEl  = $('.clients-carso');
//     [marqueeEl, brandsEl].forEach(el => { if (el) { killScrollTriggerFor(el); unwrapPinSpacer(el); } });

//     if (worksIdx >= 0 && marqueeIdx >= 0 && marqueeIdx < worksIdx) {
//       resetMarqueeHeights();
//       liftMarqueeAboveWorks();
//     } else if (marqueeEl) {
//       marqueeEl.style.zIndex = '';
//       marqueeEl.style.marginTop = '';
//     }

//     if (worksIdx >= 0 && brandsIdx >= 0 && brandsIdx < worksIdx && brandsEl) {
//       const works = $('section.works');
//       if (works) {
//         if (getComputedStyle(works).position === 'static') works.style.position = 'relative';
//         if (getComputedStyle(brandsEl).position === 'static') brandsEl.style.position = 'relative';
//         if (!works.style.zIndex) works.style.zIndex = '20';
//         brandsEl.style.zIndex = '25';
//         if (getComputedStyle(works).overflow !== 'visible') works.style.overflow = 'visible';
//       }
//     } else if (brandsEl) {
//       brandsEl.style.zIndex = '';
//     }

//     try { window.ScrollTrigger && window.ScrollTrigger.refresh(true); } catch {}
//   }

//   /* =================== MAIN =================== */
//   async function run() {
//     log('Boot with', { BACKEND, USER_ID, TPL_ID });

//     const home = await api.getHomePage();
//     if (!home?._id) { warn('No page found for template', TPL_ID); return; }

//     const all = await api.getAllForTemplate();
//     const pageSections = all
//       .filter(s => String(s.parentPageId) === String(home._id))
//       .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

//     const orderedTypes = pageSections.map(s => String(s.type || '').toLowerCase());
//     const byType = (t) => pageSections.find(s => (s.type || '').toLowerCase() === t);

//     await applyHeroPreferBackend(byType('hero'));
//     await applyAbout();
//     await applyProjects();
//     await applyMarquee();
//     await applyServices();
//     await applyBlogs();
//     await applyBrands();
//     await applyContact();        // <-- NEW: Contact for SIR or GYM

//     applyVisualOrder(orderedTypes);

//     window.dispatchEvent(new Event('resize'));
//   }

//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => run().catch(oops));
//   } else {
//     run().catch(oops);
//   }
// })();












// assets/js/page-loader-bayone1.js  (safe bridge – does NOT set text from objects)
(() => {
  'use strict';

  // Small utility used by this bridge only
  const pickStr = (...c) => {
    for (const x of c) {
      if (typeof x === 'string' && x.trim()) return x.trim();
      if (typeof x === 'number') return String(x);
      if (x && typeof x === 'object') {
        if (typeof x.heading === 'string' && x.heading.trim()) return x.heading.trim();
        if (typeof x.title   === 'string' && x.title.trim())   return x.title.trim();
        if (typeof x.text    === 'string' && x.text.trim())    return x.text.trim();
        if (typeof x.content === 'string' && x.content.trim()) return x.content.trim();
      }
    }
    return '';
  };

  // Guard the hero <h1> against any later script that tries to set an object
  function protectHeroHeading() {
    const h1 = document.querySelector('.land-header .caption h1');
    if (!h1) return;

    // Save the good text once
    if (!h1.dataset.cmsSaved) {
      h1.dataset.cmsSaved = '1';
      h1.dataset.cmsText = h1.textContent || '';
    }

    const obs = new MutationObserver(() => {
      const txt = h1.textContent || '';
      // If any script sets an object, it will stringify to "[object Object]"
      if (txt.trim() === '[object Object]') {
        h1.textContent = pickStr(h1.dataset.cmsText, ''); // restore good value
      } else {
        h1.dataset.cmsText = txt; // keep last good text
      }
    });

    obs.observe(h1, { childList: true, characterData: true, subtree: true });
  }

  // Initialize theme JS without touching content
  function initThemeHelpers() {
    try { window?.animsition && $('.animsition').animsition?.(); } catch {}
    try { window?.HoverImg && window.HoverImg(); } catch {}
    try { window?.initHoverImg && window.initHoverImg(); } catch {}
    try { window?.three_img_hover && window.three_img_hover(); } catch {}
    try { window?.ScrollSmoother && window.ScrollSmoother.create?.({ smooth: 1 }); } catch {}
  }

  // Run after DOM is ready (cms-boot also waits; order here is defensive)
  const start = () => { protectHeroHeading(); initThemeHelpers(); };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
