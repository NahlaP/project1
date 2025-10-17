// dashboard/lib/templateCookie.js
function getBaseDomain(hostname = (typeof location !== 'undefined' ? location.hostname : '')) {
  // If localhost or an IP, don't set Domain attr
  if (!hostname ||
      hostname === 'localhost' ||
      /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) ||
      hostname.split('.').length < 2) return '';

  const parts = hostname.split('.');
  const tld = parts[parts.length - 1];
  const use3 = tld.length === 2 && parts.length >= 3; // e.g., .ae domains
  const base = parts.slice(use3 ? -3 : -2).join('.');
  return `.${base}`;
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
}


















