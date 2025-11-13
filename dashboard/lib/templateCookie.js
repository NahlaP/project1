



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

// function writeCookie(name, value, maxAge = 60 * 60 * 24 * 365) {
//   const attrs = [
//     `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
//     `Max-Age=${maxAge}`,
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

// /**
//  * Backward compatible:
//  * setTemplateCookie(templateId)                 // old usage
//  * setTemplateCookie(templateId, versionTag)    // writes version too
//  * setTemplateCookie(templateId, versionTag, userId) // also writes user cookie
//  */
// export function setTemplateCookie(templateId, versionTag = 'v1', userId) {
//   // keep original behavior
//   writeCookie('templateId', templateId);

//   // new: version + public site cookies (so PHP can redirect correctly)
//   writeCookie('templateVersion', versionTag);
//   writeCookie('ION7_TEMPLATE_ID', templateId);
//   writeCookie('ION7_TEMPLATE_VERSION', versionTag);
//   if (userId) writeCookie('ION7_USER_ID', userId);
// }












// C:\Users\97158\Desktop\project1 dev\project1\dashboard\lib\templateCookie.js

function getBaseDomain(
  hostname = (typeof location !== "undefined" ? location.hostname : "")
) {
  // If localhost or an IP, don't set Domain attr
  if (
    !hostname ||
    hostname === "localhost" ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) ||
    hostname.split(".").length < 2
  )
    return "";

  const parts = hostname.split(".");
  const tld = parts[parts.length - 1];
  const use3 = tld.length === 2 && parts.length >= 3; // e.g., .ae domains
  const base = parts.slice(use3 ? -3 : -2).join(".");
  return `.${base}`; // e.g. .mavsketch.com
}

function writeCookie(name, value, maxAge = 60 * 60 * 24 * 365) {
  const attrs = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    `Max-Age=${maxAge}`,
    `Path=/`,
    `SameSite=Lax`,
  ];

  if (typeof location !== "undefined") {
    const baseDomain = getBaseDomain();
    if (baseDomain) attrs.push(`Domain=${baseDomain}`);
    if (location.protocol === "https:") attrs.push("Secure");
  }

  document.cookie = attrs.join("; ");
}

/**
 * Backward compatible:
 *   setTemplateCookie(templateId)
 *   setTemplateCookie(templateId, versionTag)
 *   setTemplateCookie(templateId, versionTag, userId)
 *
 * plus: writes a JSON cookie `ion7_site` that PHP can read:
 *   { uid, tpl, v }
 */
export function setTemplateCookie(templateId, versionTag = "v1", userId) {
  if (!templateId) return;

  // --- old behaviour (keep for safety) ---
  writeCookie("templateId", templateId);
  writeCookie("templateVersion", versionTag);
  writeCookie("ION7_TEMPLATE_ID", templateId);
  writeCookie("ION7_TEMPLATE_VERSION", versionTag);
  if (userId) writeCookie("ION7_USER_ID", userId);

  // --- NEW: single JSON cookie used by public site ---
  if (userId) {
    const payload = {
      uid: userId,
      tpl: templateId,
      v: versionTag || "v1",
    };
    writeCookie("ion7_site", JSON.stringify(payload));
  }
}

