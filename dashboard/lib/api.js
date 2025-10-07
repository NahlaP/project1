// // og
// // dashboard/lib/api.js
// // Works with your .env.local:
// // NEXT_PUBLIC_BACKEND_ORIGIN=http://3.109.207.179  (or http://127.0.0.1:5000 for local)

// const BASE =
//   (process.env.NEXT_PUBLIC_BACKEND_ORIGIN ||
//     process.env.BACKEND_ORIGIN ||
//     "http://127.0.0.1:5000").replace(/\/$/, "");

// const TOKEN_COOKIE =
//   process.env.NEXT_PUBLIC_COOKIE_NAME ||
//   process.env.COOKIE_NAME ||
//   "auth_token";

// /* ---------------- token helpers (cookie + localStorage fallback) ---------------- */
// function getCookie(name) {
//   if (typeof document === "undefined") return null;
//   const m = document.cookie.match(
//     new RegExp("(^| )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]+)")
//   );
//   return m ? decodeURIComponent(m[2]) : null;
// }
// function setCookie(name, value, days = 7) {
//   if (typeof document === "undefined") return;
//   const d = new Date();
//   d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
//   document.cookie = `${name}=${encodeURIComponent(
//     value
//   )}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
// }

// export function setToken(token) {
//   try {
//     setCookie(TOKEN_COOKIE, token);
//     if (typeof window !== "undefined") localStorage.setItem(TOKEN_COOKIE, token);
//   } catch {}
// }

// export function getToken() {
//   try {
//     const c = getCookie(TOKEN_COOKIE);
//     if (c) return c;
//     if (typeof window !== "undefined")
//       return localStorage.getItem(TOKEN_COOKIE);
//   } catch {}
//   return null;
// }

// export function clearToken() {
//   try {
//     setCookie(TOKEN_COOKIE, "", -1);
//     if (typeof window !== "undefined") localStorage.removeItem(TOKEN_COOKIE);
//   } catch {}
// }

// /** Decode userId from your demo token; fallback to "demo-user" */
// export function getUserId() {
//   try {
//     const t = getToken();
//     if (!t) return "demo-user";
//     const payload = JSON.parse(atob(t.split(".")[1]));
//     return payload?.userId || "demo-user";
//   } catch {
//     return "demo-user";
//   }
// }

// /* ---------------- request helpers ---------------- */
// async function request(path, init = {}) {
//   const headers = Object.assign({}, init.headers || {});
//   const token = getToken();
//   if (token) headers.Authorization = `Bearer ${token}`;

//   const res = await fetch(`${BASE}${path}`, { ...init, headers });

//   // Try JSON first; if not JSON just return raw text body
//   const type = res.headers.get("content-type") || "";
//   const body = type.includes("application/json") ? await res.json() : await res.text();

//   if (!res.ok) {
//     const msg = (body && body.error) || res.statusText;
//     throw new Error(msg || "Request failed");
//   }
//   return body;
// }

// async function upload(path, file, fieldName = "image") {
//   const fd = new FormData();
//   fd.append(fieldName, file);
//   return request(path, { method: "POST", body: fd });
// }

// /* ---------------- API surface ---------------- */
// export const api = {
//   /* Auth */
//   login(email, password) {
//     return request("/api/auth/login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password }),
//     });
//   },

//   /* Templates & selection */
//   listTemplates() {
//     return request("/api/templates"); // {ok, data:[{templateId,name,version}]}
//   },
//   upsertTemplate(payload) {
//     return request("/api/templates", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });
//   },
//   selectTemplate(templateId, userId) {
//     return request(`/api/templates/${templateId}/select`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ userId }),
//     });
//   },
//   selectedTemplateForUser(userId) {
//     return request(`/api/templates/user/${userId}/selected`);
//   },

//   /* Hero */
//   getHero(userId, templateId) {
//     return request(`/api/hero/${userId}/${templateId}`);
//   },
//   saveHeroText(userId, templateId, content) {
//     return request(`/api/hero/${userId}/${templateId}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ content }),
//     });
//   },
//   uploadHeroFile(userId, templateId, file) {
//     return upload(`/api/hero/${userId}/${templateId}/image`, file, "image");
//   },
//   uploadHeroBase64(userId, templateId, dataUrl, filename = "hero.jpg") {
//     return request(`/api/hero/${userId}/${templateId}/image-base64`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ filename, dataUrl }),
//     });
//   },
//   resetHero(userId, templateId) {
//     return request(`/api/hero/${userId}/${templateId}/reset`, { method: "POST" });
//   },
//   clearHeroImage(userId, templateId) {
//     return request(`/api/hero/${userId}/${templateId}/clear-image`, { method: "POST" });
//   },

//   /* About */
//   getAbout(userId, templateId) {
//     return request(`/api/about/${userId}/${templateId}`);
//   },
//   saveAbout(userId, templateId, payload) {
//     return request(`/api/about/${userId}/${templateId}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });
//   },
//   uploadAboutImage(userId, templateId, file) {
//     return upload(`/api/about/${userId}/${templateId}/image`, file, "image");
//   },
//   deleteAboutImage(userId, templateId) {
//     return request(`/api/about/${userId}/${templateId}/image`, { method: "DELETE" });
//   },

//   /* Appointment */
//   getAppointment(userId, templateId) {
//     return request(`/api/appointment/${userId}/${templateId}`);
//   },
//   saveAppointment(userId, templateId, payload) {
//     return request(`/api/appointment/${userId}/${templateId}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });
//   },
//   // your backend has /api/appointment/upload-bg and /clear-bg (no ids)
//   uploadAppointmentBg(file) {
//     return upload(`/api/appointment/upload-bg`, file, "image");
//   },
//   clearAppointmentBg() {
//     return request(`/api/appointment/clear-bg`, { method: "POST" });
//   },

//   /* Services */
//   getServices(userId, templateId) {
//     return request(`/api/services/${userId}/${templateId}`);
//   },
//   upsertServices(userId, templateId, services) {
//     return request(`/api/services/${userId}/${templateId}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ services }),
//     });
//   },
//   addService(userId, templateId, item) {
//     return request(`/api/services/${userId}/${templateId}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(item),
//     });
//   },
//   updateService(userId, templateId, serviceId, item) {
//     return request(`/api/services/${userId}/${templateId}/${serviceId}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(item),
//     });
//   },
//   deleteService(userId, templateId, serviceId) {
//     return request(`/api/services/${userId}/${templateId}/${serviceId}`, {
//       method: "DELETE",
//     });
//   },
//   uploadServiceImage(userId, templateId, serviceId, file) {
//     return upload(`/api/services/${userId}/${templateId}/${serviceId}/image`, file, "image");
//   },
//   deleteServiceImage(userId, templateId, serviceId) {
//     return request(`/api/services/${userId}/${templateId}/${serviceId}/image`, {
//       method: "DELETE",
//     });
//   },

//   /* Team */
//   getTeam(userId, templateId) {
//     return request(`/api/team/${userId}/${templateId}`);
//   },
//   createTeamMember(userId, templateId, body, file) {
//     if (file) {
//       const fd = new FormData();
//       Object.entries(body || {}).forEach(([k, v]) => fd.append(k, v));
//       fd.append("image", file);
//       return request(`/api/team/${userId}/${templateId}`, { method: "POST", body: fd });
//     }
//     return request(`/api/team/${userId}/${templateId}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body || {}),
//     });
//   },
//   updateTeamMember(id, body, file) {
//     if (file) {
//       const fd = new FormData();
//       Object.entries(body || {}).forEach(([k, v]) => fd.append(k, v));
//       fd.append("image", file);
//       return request(`/api/team/${id}`, { method: "PATCH", body: fd });
//     }
//     return request(`/api/team/${id}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body || {}),
//     });
//   },
//   deleteTeamMember(id) {
//     return request(`/api/team/${id}`, { method: "DELETE" });
//   },

//   /* Testimonials */
//   getTestimonials(userId, templateId) {
//     return request(`/api/testimonial/${userId}/${templateId}`);
//   },
//   createTestimonial(userId, templateId, body, file) {
//     if (file) {
//       const fd = new FormData();
//       Object.entries(body || {}).forEach(([k, v]) => fd.append(k, v));
//       fd.append("image", file);
//       return request(`/api/testimonial/${userId}/${templateId}`, {
//         method: "POST",
//         body: fd,
//       });
//     }
//     return request(`/api/testimonial/${userId}/${templateId}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body || {}),
//     });
//   },
//   updateTestimonial(id, body, file) {
//     if (file) {
//       const fd = new FormData();
//       Object.entries(body || {}).forEach(([k, v]) => fd.append(k, v));
//       fd.append("image", file);
//       return request(`/api/testimonial/${id}`, { method: "PATCH", body: fd });
//     }
//     return request(`/api/testimonial/${id}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body || {}),
//     });
//   },
//   deleteTestimonial(id) {
//     return request(`/api/testimonial/${id}`, { method: "DELETE" });
//   },

//   /* Why Choose Us */
//   getWhyChoose(userId, templateId) {
//     return request(`/api/whychoose/${userId}/${templateId}`);
//   },
//   saveWhyChoose(userId, templateId, payload) {
//     return request(`/api/whychoose/${userId}/${templateId}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });
//   },
//   uploadWhyChooseBg(userId, templateId, file) {
//     return upload(`/api/whychoose/${userId}/${templateId}/bg`, file, "image");
//   },
//   deleteWhyChooseBg(userId, templateId) {
//     return request(`/api/whychoose/${userId}/${templateId}/bg`, { method: "DELETE" });
//   },
// };















// // works fine
// // dashboard/lib/api.js
// // Works with your .env.local:
// // NEXT_PUBLIC_BACKEND_ORIGIN=http://3.109.207.179  (or http://127.0.0.1:5000 for local)

// const BASE =
//   (process.env.NEXT_PUBLIC_BACKEND_ORIGIN ||
//     process.env.BACKEND_ORIGIN ||
//     "http://127.0.0.1:5000").replace(/\/$/, "");

// const TOKEN_COOKIE =
//   process.env.NEXT_PUBLIC_COOKIE_NAME ||
//   process.env.COOKIE_NAME ||
//   "auth_token";

// /* ---------------- token helpers (cookie + localStorage fallback) ---------------- */
// function getCookie(name) {
//   if (typeof document === "undefined") return null;
//   const m = document.cookie.match(
//     new RegExp("(^| )" + name.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&") + "=([^;]+)")
//   );
//   return m ? decodeURIComponent(m[2]) : null;
// }
// function setCookie(name, value, days = 7) {
//   if (typeof document === "undefined") return;
//   const d = new Date();
//   d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
//   document.cookie = `${name}=${encodeURIComponent(
//     value
//   )}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
// }

// export function setToken(token) {
//   try {
//     setCookie(TOKEN_COOKIE, token);
//     if (typeof window !== "undefined") localStorage.setItem(TOKEN_COOKIE, token);
//   } catch {}
// }

// export function getToken() {
//   try {
//     const c = getCookie(TOKEN_COOKIE);
//     if (c) return c;
//     if (typeof window !== "undefined")
//       return localStorage.getItem(TOKEN_COOKIE);
//   } catch {}
//   return null;
// }

// export function clearToken() {
//   try {
//     setCookie(TOKEN_COOKIE, "", -1);
//     if (typeof window !== "undefined") localStorage.removeItem(TOKEN_COOKIE);
//   } catch {}
// }

// /** Decode userId from your demo token; fallback to "demo-user" */
// export function getUserId() {
//   try {
//     const t = getToken();
//     if (!t) return "demo-user";
//     const payload = JSON.parse(atob(t.split(".")[1]));
//     return payload?.userId || "demo-user";
//   } catch {
//     return "demo-user";
//   }
// }

// /* ---------------- request helpers ---------------- */
// async function request(path, init = {}) {
//   const headers = Object.assign({}, init.headers || {});
//   const token = getToken();
//   if (token) headers.Authorization = `Bearer ${token}`;

//   const res = await fetch(`${BASE}${path}`, { ...init, headers });

//   // Try JSON first; if not JSON just return raw text body
//   const type = res.headers.get("content-type") || "";
//   const body = type.includes("application/json") ? await res.json() : await res.text();

//   if (!res.ok) {
//     const msg = (body && body.error) || res.statusText;
//     throw new Error(msg || "Request failed");
//   }
//   return body;
// }

// async function upload(path, file, fieldName = "image") {
//   const fd = new FormData();
//   fd.append(fieldName, file);
//   return request(path, { method: "POST", body: fd });
// }

// /* ---------------- API surface ---------------- */
// export const api = {
//   /* Auth */
//   login(email, password) {
//     return request("/api/auth/login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password }),
//     });
//   },

//   /* Templates & selection */
//   listTemplates() {
//     return request("/api/templates"); // {ok, data:[{templateId,name,version}]}
//   },
//   upsertTemplate(payload) {
//     return request("/api/templates", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });
//   },
//   selectTemplate(templateId, userId) {
//     return request(`/api/templates/${templateId}/select`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ userId }),
//     });
//   },
//   selectedTemplateForUser(userId) {
//     return request(`/api/templates/user/${userId}/selected`);
//   },

//   /**
//    * 🔁 Reset the currently selected template's sections back to its defaults
//    * Backend route: POST /api/templates/:templateId/reset  { userId? }
//    * Returns: { ok, data: { removed, inserted, homePageId }, message }
//    */
//   resetTemplate(templateId, userId) {
//     return request(`/api/templates/${templateId}/reset`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ userId }),
//     });
//   },

//   /**
//    * 🧰 Convenience: switch to a template, then reset it in one call
//    * Useful for "Reset to Bayone (original)" style UX.
//    */
//   async selectAndReset(templateId, userId) {
//     await this.selectTemplate(templateId, userId);
//     return this.resetTemplate(templateId, userId);
//   },

//   /* Hero */
//   getHero(userId, templateId) {
//     return request(`/api/hero/${userId}/${templateId}`);
//   },
//   saveHeroText(userId, templateId, content) {
//     return request(`/api/hero/${userId}/${templateId}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ content }),
//     });
//   },
//   uploadHeroFile(userId, templateId, file) {
//     return upload(`/api/hero/${userId}/${templateId}/image`, file, "image");
//   },
//   uploadHeroBase64(userId, templateId, dataUrl, filename = "hero.jpg") {
//     return request(`/api/hero/${userId}/${templateId}/image-base64`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ filename, dataUrl }),
//     });
//   },
//   resetHero(userId, templateId) {
//     return request(`/api/hero/${userId}/${templateId}/reset`, { method: "POST" });
//   },
//   clearHeroImage(userId, templateId) {
//     return request(`/api/hero/${userId}/${templateId}/clear-image`, { method: "POST" });
//   },

//   /* About */
//   getAbout(userId, templateId) {
//     return request(`/api/about/${userId}/${templateId}`);
//   },
//   saveAbout(userId, templateId, payload) {
//     return request(`/api/about/${userId}/${templateId}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });
//   },
//   uploadAboutImage(userId, templateId, file) {
//     return upload(`/api/about/${userId}/${templateId}/image`, file, "image");
//   },
//   deleteAboutImage(userId, templateId) {
//     return request(`/api/about/${userId}/${templateId}/image`, { method: "DELETE" });
//   },

//   /* Appointment */
//   getAppointment(userId, templateId) {
//     return request(`/api/appointment/${userId}/${templateId}`);
//   },
//   saveAppointment(userId, templateId, payload) {
//     return request(`/api/appointment/${userId}/${templateId}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });
//   },
//   // your backend has /api/appointment/upload-bg and /clear-bg (no ids)
//   uploadAppointmentBg(file) {
//     return upload(`/api/appointment/upload-bg`, file, "image");
//   },
//   clearAppointmentBg() {
//     return request(`/api/appointment/clear-bg`, { method: "POST" });
//   },

//   /* Services */
//   getServices(userId, templateId) {
//     return request(`/api/services/${userId}/${templateId}`);
//   },
//   upsertServices(userId, templateId, services) {
//     return request(`/api/services/${userId}/${templateId}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ services }),
//     });
//   },
//   addService(userId, templateId, item) {
//     return request(`/api/services/${userId}/${templateId}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(item),
//     });
//   },
//   updateService(userId, templateId, serviceId, item) {
//     return request(`/api/services/${userId}/${templateId}/${serviceId}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(item),
//     });
//   },
//   deleteService(userId, templateId, serviceId) {
//     return request(`/api/services/${userId}/${templateId}/${serviceId}`, {
//       method: "DELETE",
//     });
//   },
//   uploadServiceImage(userId, templateId, serviceId, file) {
//     return upload(`/api/services/${userId}/${templateId}/${serviceId}/image`, file, "image");
//   },
//   deleteServiceImage(userId, templateId, serviceId) {
//     return request(`/api/services/${userId}/${templateId}/${serviceId}/image`, {
//       method: "DELETE",
//     });
//   },

//   /* Team */
//   getTeam(userId, templateId) {
//     return request(`/api/team/${userId}/${templateId}`);
//   },
//   createTeamMember(userId, templateId, body, file) {
//     if (file) {
//       const fd = new FormData();
//       Object.entries(body || {}).forEach(([k, v]) => fd.append(k, v));
//       fd.append("image", file);
//       return request(`/api/team/${userId}/${templateId}`, { method: "POST", body: fd });
//     }
//     return request(`/api/team/${userId}/${templateId}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body || {}),
//     });
//   },
//   updateTeamMember(id, body, file) {
//     if (file) {
//       const fd = new FormData();
//       Object.entries(body || {}).forEach(([k, v]) => fd.append(k, v));
//       fd.append("image", file);
//       return request(`/api/team/${id}`, { method: "PATCH", body: fd });
//     }
//     return request(`/api/team/${id}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body || {}),
//     });
//   },
//   deleteTeamMember(id) {
//     return request(`/api/team/${id}`, { method: "DELETE" });
//   },

//   /* Testimonials */
//   getTestimonials(userId, templateId) {
//     return request(`/api/testimonial/${userId}/${templateId}`);
//   },
//   createTestimonial(userId, templateId, body, file) {
//     if (file) {
//       const fd = new FormData();
//       Object.entries(body || {}).forEach(([k, v]) => fd.append(k, v));
//       fd.append("image", file);
//       return request(`/api/testimonial/${userId}/${templateId}`, {
//         method: "POST",
//         body: fd,
//       });
//     }
//     return request(`/api/testimonial/${userId}/${templateId}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body || {}),
//     });
//   },
//   updateTestimonial(id, body, file) {
//     if (file) {
//       const fd = new FormData();
//       Object.entries(body || {}).forEach(([k, v]) => fd.append(k, v));
//       fd.append("image", file);
//       return request(`/api/testimonial/${id}`, { method: "PATCH", body: fd });
//     }
//     return request(`/api/testimonial/${id}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body || {}),
//     });
//   },
//   deleteTestimonial(id) {
//     return request(`/api/testimonial/${id}`, { method: "DELETE" });
//   },

//   /* Why Choose Us */
//   getWhyChoose(userId, templateId) {
//     return request(`/api/whychoose/${userId}/${templateId}`);
//   },
//   saveWhyChoose(userId, templateId, payload) {
//     return request(`/api/whychoose/${userId}/${templateId}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });
//   },
//   uploadWhyChooseBg(userId, templateId, file) {
//     return upload(`/api/whychoose/${userId}/${templateId}/bg`, file, "image");
//   },
//   deleteWhyChooseBg(userId, templateId) {
//     return request(`/api/whychoose/${userId}/${templateId}/bg`, { method: "DELETE" });
//   },
// };










// og2
// before works fine
// dashboard/lib/api.js
// Works with your .env.local:
// NEXT_PUBLIC_BACKEND_ORIGIN=http://3.109.207.179  (or http://127.0.0.1:5000 for local)

const BASE =
  (process.env.NEXT_PUBLIC_BACKEND_ORIGIN ||
    process.env.BACKEND_ORIGIN ||
    "http://127.0.0.1:5000").replace(/\/$/, "");

const TOKEN_COOKIE =
  process.env.NEXT_PUBLIC_COOKIE_NAME ||
  process.env.COOKIE_NAME ||
  "auth_token";

/* ---------------- token helpers (cookie + localStorage fallback) ---------------- */
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(
    new RegExp("(^| )" + name.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&") + "=([^;]+)")
  );
  return m ? decodeURIComponent(m[2]) : null;
}
function setCookie(name, value, days = 7) {
  if (typeof document === "undefined") return;
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
}

export function setToken(token) {
  try {
    setCookie(TOKEN_COOKIE, token);
    if (typeof window !== "undefined") localStorage.setItem(TOKEN_COOKIE, token);
  } catch {}
}

export function getToken() {
  try {
    const c = getCookie(TOKEN_COOKIE);
    if (c) return c;
    if (typeof window !== "undefined")
      return localStorage.getItem(TOKEN_COOKIE);
  } catch {}
  return null;
}

export function clearToken() {
  try {
    setCookie(TOKEN_COOKIE, "", -1);
    if (typeof window !== "undefined") localStorage.removeItem(TOKEN_COOKIE);
  } catch {}
}

/** Decode userId from your demo token; fallback to "demo-user" */
export function getUserId() {
  try {
    const t = getToken();
    if (!t) return "demo-user";
    const payload = JSON.parse(atob(t.split(".")[1]));
    return payload?.userId || "demo-user";
  } catch {
    return "demo-user";
  }
}

/* ---------------- request helpers ---------------- */
async function request(path, init = {}) {
  const headers = Object.assign({}, init.headers || {});
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...init, headers });

  // Try JSON first; if not JSON just return raw text body
  const type = res.headers.get("content-type") || "";
  const body = type.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const msg = (body && body.error) || res.statusText;
    throw new Error(msg || "Request failed");
  }
  return body;
}

async function upload(path, file, fieldName = "image") {
  const fd = new FormData();
  fd.append(fieldName, file);
  return request(path, { method: "POST", body: fd });
}

/* ---------------- API surface ---------------- */
export const api = {
  /* Auth */
  login(email, password) {
    return request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  },

  /* Templates & selection */
  listTemplates() {
    return request("/api/templates"); // {ok, data:[{templateId,name,version}]}
  },
  upsertTemplate(payload) {
    return request("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  selectTemplate(templateId, userId) {
    return request(`/api/templates/${templateId}/select`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
  },
  selectedTemplateForUser(userId) {
    return request(`/api/templates/user/${userId}/selected`);
  },

  /**
   * 🔁 Reset the currently selected template's sections back to its defaults
   * Backend route: POST /api/templates/:templateId/reset  { userId? }
   * Returns: { ok, data: { removed, inserted, homePageId }, message }
   */
  resetTemplate(templateId, userId) {
    return request(`/api/templates/${templateId}/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
  },

  /**
   * 🧰 Convenience: switch to a template, then reset it in one call
   */
  async selectAndReset(templateId, userId) {
    await this.selectTemplate(templateId, userId);
    return this.resetTemplate(templateId, userId);
  },

  /**
   * 🔎 Helper: get the "Home" page id for a given user/template
   * Returns the _id or null.
   */
  async getHomePageId(userId, templateId) {
    const rows = await request(
      `/api/sections?userId=${encodeURIComponent(userId)}&templateId=${encodeURIComponent(
        templateId
      )}&type=page&slug=home`
    );
    const list = Array.isArray(rows) ? rows : rows?.data || [];
    const page =
      list.find(
        (r) =>
          r?.type === "page" &&
          ((r?.slug || "").toLowerCase() === "home" ||
            (r?.title || "").toLowerCase() === "home")
      ) || null;
    return page?._id || null;
  },

  /* Hero */
  getHero(userId, templateId) {
    return request(`/api/hero/${userId}/${templateId}`);
  },
  saveHeroText(userId, templateId, content) {
    return request(`/api/hero/${userId}/${templateId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
  },
  uploadHeroFile(userId, templateId, file) {
    return upload(`/api/hero/${userId}/${templateId}/image`, file, "image");
  },
  uploadHeroBase64(userId, templateId, dataUrl, filename = "hero.jpg") {
    return request(`/api/hero/${userId}/${templateId}/image-base64`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, dataUrl }),
    });
  },
  resetHero(userId, templateId) {
    return request(`/api/hero/${userId}/${templateId}/reset`, { method: "POST" });
  },
  clearHeroImage(userId, templateId) {
    return request(`/api/hero/${userId}/${templateId}/clear-image`, { method: "POST" });
  },

  /* About */
  getAbout(userId, templateId) {
    return request(`/api/about/${userId}/${templateId}`);
  },
  saveAbout(userId, templateId, payload) {
    return request(`/api/about/${userId}/${templateId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  uploadAboutImage(userId, templateId, file) {
    return upload(`/api/about/${userId}/${templateId}/image`, file, "image");
  },
  deleteAboutImage(userId, templateId) {
    return request(`/api/about/${userId}/${templateId}/image`, { method: "DELETE" });
  },

  /* Appointment */
  getAppointment(userId, templateId) {
    return request(`/api/appointment/${userId}/${templateId}`);
  },
  saveAppointment(userId, templateId, payload) {
    return request(`/api/appointment/${userId}/${templateId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  // your backend has /api/appointment/upload-bg and /clear-bg (no ids)
  uploadAppointmentBg(file) {
    return upload(`/api/appointment/upload-bg`, file, "image");
  },
  clearAppointmentBg() {
    return request(`/api/appointment/clear-bg`, { method: "POST" });
  },

  /* Services */
  getServices(userId, templateId) {
    return request(`/api/services/${userId}/${templateId}`);
  },
  upsertServices(userId, templateId, services) {
    return request(`/api/services/${userId}/${templateId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ services }),
    });
  },
  addService(userId, templateId, item) {
    return request(`/api/services/${userId}/${templateId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
  },
  updateService(userId, templateId, serviceId, item) {
    return request(`/api/services/${userId}/${templateId}/${serviceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
  },
  deleteService(userId, templateId, serviceId) {
    return request(`/api/services/${userId}/${templateId}/${serviceId}`, {
      method: "DELETE",
    });
  },
  uploadServiceImage(userId, templateId, serviceId, file) {
    return upload(`/api/services/${userId}/${templateId}/${serviceId}/image`, file, "image");
  },
  deleteServiceImage(userId, templateId, serviceId) {
    return request(`/api/services/${userId}/${templateId}/${serviceId}/image`, {
      method: "DELETE",
    });
  },

  /* Team */
  getTeam(userId, templateId) {
    return request(`/api/team/${userId}/${templateId}`);
  },
  createTeamMember(userId, templateId, body, file) {
    if (file) {
      const fd = new FormData();
      Object.entries(body || {}).forEach(([k, v]) => fd.append(k, v));
      fd.append("image", file);
      return request(`/api/team/${userId}/${templateId}`, { method: "POST", body: fd });
    }
    return request(`/api/team/${userId}/${templateId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
  },
  updateTeamMember(id, body, file) {
    if (file) {
      const fd = new FormData();
      Object.entries(body || {}).forEach(([k, v]) => fd.append(k, v));
      fd.append("image", file);
      return request(`/api/team/${id}`, { method: "PATCH", body: fd });
    }
    return request(`/api/team/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
  },
  deleteTeamMember(id) {
    return request(`/api/team/${id}`, { method: "DELETE" });
  },

  /* Testimonials */
  getTestimonials(userId, templateId) {
    return request(`/api/testimonial/${userId}/${templateId}`);
  },
  createTestimonial(userId, templateId, body, file) {
    if (file) {
      const fd = new FormData();
      Object.entries(body || {}).forEach(([k, v]) => fd.append(k, v));
      fd.append("image", file);
      return request(`/api/testimonial/${userId}/${templateId}`, {
        method: "POST",
        body: fd,
      });
    }
    return request(`/api/testimonial/${userId}/${templateId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
  },
  updateTestimonial(id, body, file) {
    if (file) {
      const fd = new FormData();
      Object.entries(body || {}).forEach(([k, v]) => fd.append(k, v));
      fd.append("image", file);
      return request(`/api/testimonial/${id}`, { method: "PATCH", body: fd });
    }
    return request(`/api/testimonial/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
  },
  deleteTestimonial(id) {
    return request(`/api/testimonial/${id}`, { method: "DELETE" });
  },

  /* Why Choose Us */
  getWhyChoose(userId, templateId) {
    return request(`/api/whychoose/${userId}/${templateId}`);
  },
  saveWhyChoose(userId, templateId, payload) {
    return request(`/api/whychoose/${userId}/${templateId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  uploadWhyChooseBg(userId, templateId, file) {
    return upload(`/api/whychoose/${userId}/${templateId}/bg`, file, "image");
  },
  deleteWhyChooseBg(userId, templateId) {
    return request(`/api/whychoose/${userId}/${templateId}/bg`, { method: "DELETE" });
  },
};















































