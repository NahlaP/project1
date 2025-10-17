// // dashboard/lib/templateCookie.js
// function getBaseDomain(hostname = (typeof location !== 'undefined' ? location.hostname : '')) {
//   // If localhost or an IP, don't set Domain attr
//   if (!hostname ||
//       hostname === 'localhost' ||
//       /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) ||
//       hostname.split('.').length < 2) return '';

//   const parts = hostname.split('.');
//   const tld = parts[parts.length - 1];
//   const use3 = tld.length === 2 && parts.length >= 3; // e.g., .ae domains
//   const base = parts.slice(use3 ? -3 : -2).join('.');
//   return `.${base}`;
// }

// export function setTemplateCookie(templateId) {
//   const oneYear = 60 * 60 * 24 * 365;
//   const attrs = [
//     `templateId=${encodeURIComponent(templateId)}`,
//     `Max-Age=${oneYear}`,
//     `Path=/`,
//     `SameSite=Lax`,
//   ];
//   if (typeof location !== 'undefined') {
//     const baseDomain = getBaseDomain();
//     if (baseDomain) attrs.push(`Domain=${baseDomain}`);
//     if (location.protocol === 'https:') attrs.push('Secure');
//   }
//   document.cookie = attrs.join('; ');
// }


















// dashboard/lib/templateCookie.js

function getBaseDomain(hostname = (typeof location !== 'undefined' ? location.hostname : '')) {
  // If localhost or an IP, don't set Domain attr
  if (!hostname ||
      hostname === 'localhost' ||
      /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) ||
      hostname.split('.').length < 2) return '';

  const parts = hostname.split('.');
  const tld = parts[parts.length - 1];
  const use3 = tld.length === 2 && parts.length >= 3; // e.g., .ae, .uk
  const base = parts.slice(use3 ? -3 : -2).join('.');
  return `.${base}`;
}

function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(
    new RegExp('(^| )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]+)')
  );
  return m ? decodeURIComponent(m[2]) : null;
}

export function getTemplateCookie() {
  return readCookie('templateId');
}

export function setTemplateCookie(templateId) {
  const oneYear = 60 * 60 * 24 * 365;
  const attrs = [
    `templateId=${encodeURIComponent(templateId)}`,
    `Max-Age=${oneYear}`,
    `Path=/`,
    `SameSite=Lax`,
  ];
  if (typeof location !== 'undefined') {
    const baseDomain = getBaseDomain();
    if (baseDomain) attrs.push(`Domain=${baseDomain}`);
    if (location.protocol === 'https:') attrs.push('Secure');
  }
  document.cookie = attrs.join('; ');

  // Also mirror to localStorage so other tabs update live
  try {
    localStorage.setItem('templateId', templateId);
    // Fire a custom event so current tab listeners can react too
    window.dispatchEvent(new CustomEvent('template-change', { detail: { templateId } }));
  } catch {}
}

/** Optional: listen for template changes from other tabs */
export function onTemplateChange(cb) {
  if (typeof window === 'undefined') return () => {};
  const storageHandler = (e) => {
    if (e.key === 'templateId') cb(e.newValue || null);
  };
  const customHandler = (e) => cb(e?.detail?.templateId || getTemplateCookie() || null);
  window.addEventListener('storage', storageHandler);
  window.addEventListener('template-change', customHandler);
  return () => {
    window.removeEventListener('storage', storageHandler);
    window.removeEventListener('template-change', customHandler);
  };
}
