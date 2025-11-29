



// // og for everything work 
// // dashboard/lib/api.js
// // NEXT_PUBLIC_BACKEND_ORIGIN=http://3.109.207.179  (or http://127.0.0.1:5000 for local)

// export const PUBLIC_HOST =
//   process.env.NEXT_PUBLIC_PUBLIC_HOST ||
//   "https://ion7devtemplate.mavsketch.com";

// const BASE = (
//   process.env.NEXT_PUBLIC_BACKEND_ORIGIN ||
//   process.env.BACKEND_ORIGIN ||
//   "http://127.0.0.1:5000"
// ).replace(/\/$/, "");

// // ✅ Export the resolved backend base (useful for debugging)
// export const BACKEND = BASE;

// const TOKEN_COOKIE =
//   process.env.NEXT_PUBLIC_COOKIE_NAME ||
//   process.env.COOKIE_NAME ||
//   "auth_token";

// /* ---------------- token helpers (cookie + localStorage fallback) ---------------- */
// function getCookie(name) {
//   if (typeof document === "undefined") return null;
//   const m = document.cookie.match(
//     new RegExp(
//       "(^| )" +
//         name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
//         "=([^;]+)"
//     )
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
//     if (typeof window !== "undefined")
//       localStorage.setItem(TOKEN_COOKIE, token);
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
//     if (typeof window !== "undefined")
//       localStorage.removeItem(TOKEN_COOKIE);
//   } catch {}
// }

// /**
//  * ✅ Decode userId from token.
//  * IMPORTANT:
//  * - On SERVER (SSR) return null to avoid hydration mismatch
//  * - On CLIENT keep your old fallback behaviour ("demo-user")
//  */
// export function getUserId() {
//   // SSR: do not guess any ID
//   if (typeof window === "undefined") return null;

//   try {
//     const t = getToken();
//     if (!t) return "demo-user";
//     const payload = JSON.parse(
//       atob((t.split(".")[1] || "").replace(/-/g, "+").replace(/_/g, "/"))
//     );
//     return payload?.userId || "demo-user";
//   } catch {
//     return "demo-user";
//   }
// }

// /**
//  * ✅ Get selected templateId
//  * Priority:
//  *  1) ion7_site cookie (JSON: { uid, tpl, templateId, ... })
//  *  2) localStorage
//  *  3) fallback "sir-template-1"
//  */
// export function getTemplateId() {
//   try {
//     if (typeof document !== "undefined") {
//       const raw = getCookie("ion7_site");
//       if (raw) {
//         try {
//           const parsed = JSON.parse(raw);
//           return (
//             parsed?.tpl ||
//             parsed?.templateId ||
//             parsed?.template ||
//             "sir-template-1"
//           );
//         } catch {
//           // ignore invalid json
//         }
//       }
//     }

//     if (typeof window !== "undefined") {
//       const ls =
//         localStorage.getItem("ION7_TEMPLATE_ID") ||
//         localStorage.getItem("templateId") ||
//         localStorage.getItem("tpl");
//       if (ls) return ls;
//     }
//   } catch {}

//   return "sir-template-1";
// }

// /* ---------------- request helpers ---------------- */
// async function request(path, init = {}) {
//   const headers = Object.assign({}, init.headers || {});
//   const token = getToken();
//   if (token) headers.Authorization = `Bearer ${token}`;

//   const res = await fetch(`${BASE}${path}`, {
//     ...init,
//     headers,
//     credentials: "include", // ✅ always send cookies too
//   });

//   const type = res.headers.get("content-type") || "";
//   const body = type.includes("application/json")
//     ? await res.json()
//     : await res.text();

//   // ✅ If token missing/expired → redirect to signin
//   if (res.status === 401 && typeof window !== "undefined") {
//     clearToken();
//     const next = window.location.pathname;
//     window.location.href = `/authentication/signin?next=${encodeURIComponent(
//       next
//     )}`;
//     return;
//   }

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
//   /* ✅ Generic HTTP helpers (for Media page etc) */
//   get(path) {
//     return request(path);
//   },
//   post(path, body, headers = { "Content-Type": "application/json" }) {
//     return request(path, {
//       method: "POST",
//       headers,
//       body:
//         headers && headers["Content-Type"] === "application/json"
//           ? JSON.stringify(body || {})
//           : body,
//     });
//   },
//   put(path, body, headers = { "Content-Type": "application/json" }) {
//     return request(path, {
//       method: "PUT",
//       headers,
//       body:
//         headers && headers["Content-Type"] === "application/json"
//           ? JSON.stringify(body || {})
//           : body,
//     });
//   },
//   patch(path, body, headers = { "Content-Type": "application/json" }) {
//     return request(path, {
//       method: "PATCH",
//       headers,
//       body:
//         headers && headers["Content-Type"] === "application/json"
//           ? JSON.stringify(body || {})
//           : body,
//     });
//   },
//   delete(path) {
//     return request(path, { method: "DELETE" });
//   },

//   /* ===== Auth ===== */
//   login(email, password) {
//     return request("/api/auth/login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password }),
//     });
//   },
//   signup(fullName, company, country, email, password) {
//     return request("/api/auth/signup", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ fullName, company, country, email, password }),
//     });
//   },
//   me() {
//     return request("/api/auth/me");
//   },

//   /* ===== Plans (Choose Plan) ===== */
//   listPlans() {
//     return request("/api/plans");
//   },
//   getPrice(priceId) {
//     return request(`/api/plans/price/${encodeURIComponent(priceId)}`);
//   },

//   /* ===== Billing (Elements) ===== */
//   /**
//    * Matches backend POST /api/billing/elements/start
//    * pass email to guarantee Stripe customer has it
//    */
//   billingStartElements(
//     priceId,
//     { email, name, country, address1, city, postalCode } = {}
//   ) {
//     return request(`/api/billing/elements/start`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         priceId,
//         email,
//         name,
//         country,
//         address1,
//         city,
//         postalCode,
//       }),
//     });
//   },
//   billingVerify(payload = {}) {
//     return request(`/api/billing/verify`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });
//   },

//     /* ===== Billing (Invoices, history) ===== */
//   billingInvoices() {
//     const uid = getUserId();
//     const qs = uid ? `?userId=${encodeURIComponent(uid)}` : "";
//     return request(`/api/billing/invoices${qs}`);
//   },


//   /* ===== Templates & selection ===== */
//   listTemplates() {
//     return request("/api/templates");
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
//   resetTemplate(templateId, userId) {
//     return request(`/api/templates/${templateId}/reset`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ userId }),
//     });
//   },
//   async selectAndReset(templateId, userId) {
//     await this.selectTemplate(templateId, userId);
//     return this.resetTemplate(templateId, userId);
//   },

//   /** Helper: get the "Home" page id for a given user/template */
//   async getHomePageId(userId, templateId) {
//     const rows = await request(
//       `/api/sections?userId=${encodeURIComponent(
//         userId
//       )}&templateId=${encodeURIComponent(
//         templateId
//       )}&type=page&slug=home`
//     );
//     const list = Array.isArray(rows) ? rows : rows?.data || [];
//     const page =
//       list.find(
//         (r) =>
//           r?.type === "page" &&
//           ((r?.slug || "").toLowerCase() === "home" ||
//             (r?.title || "").toLowerCase() === "home")
//       ) || null;
//     return page?._id || null;
//   },

//   /* ===== Hero / About / Appointment / Services / Team / Testimonials / WhyChoose ===== */
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
//     return request(`/api/hero/${userId}/${templateId}/reset`, {
//       method: "POST",
//     });
//   },
//   clearHeroImage(userId, templateId) {
//     return request(`/api/hero/${userId}/${templateId}/clear-image`, {
//       method: "POST",
//     });
//   },

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
//     return request(`/api/about/${userId}/${templateId}/image`, {
//       method: "DELETE",
//     });
//   },

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
//   // 🔴 OLD (no longer matches routes):
//   // uploadAppointmentBg(file) {
//   //   return upload(`/api/appointment/upload-bg`, file, "image");
//   // },
//   // clearAppointmentBg() {
//   //   return request(`/api/appointment/clear-bg`, { method: "POST" });
//   // },

//   // ✅ NEW: matches your updated appointment.routes.ts
//   uploadAppointmentBg(userId, templateId, file) {
//     return upload(
//       `/api/appointment/${userId}/${templateId}/image`,
//       file,
//       "image"
//     );
//   },
//   clearAppointmentBg(userId, templateId) {
//     return request(
//       `/api/appointment/${userId}/${templateId}/clear-image`,
//       { method: "POST" }
//     );
//   },

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
//     return upload(
//       `/api/services/${userId}/${templateId}/${serviceId}/image`,
//       file,
//       "image"
//     );
//   },
//   deleteServiceImage(userId, templateId, serviceId) {
//     return request(
//       `/api/services/${userId}/${templateId}/${serviceId}/image`,
//       { method: "DELETE" }
//     );
//   },

//   getTeam(userId, templateId) {
//     return request(`/api/team/${userId}/${templateId}`);
//   },
//   createTeamMember(userId, templateId, body, file) {
//     if (file) {
//       const fd = new FormData();
//       Object.entries(body || {}).forEach(([k, v]) => fd.append(k, v));
//       fd.append("image", file);
//       return request(`/api/team/${userId}/${templateId}`, {
//         method: "POST",
//         body: fd,
//       });
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
//       return request(`/api/testimonial/${id}`, {
//         method: "PATCH",
//         body: fd,
//       });
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
//     return upload(
//       `/api/whychoose/${userId}/${templateId}/bg`,
//       file,
//       "image"
//     );
//   },
//   deleteWhyChooseBg(userId, templateId) {
//     return request(`/api/whychoose/${userId}/${templateId}/bg`, {
//       method: "DELETE",
//     });
//   },

//   /* ===== Optional: Save selected priceId before checkout ===== */
//   async choosePlan(priceId) {
//     try {
//       return await request("/api/subscription/choose", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ priceId }),
//       });
//     } catch (e) {
//       return {
//         ok: false,
//         message: e.message || "Choose plan route not implemented",
//       };
//     }
//   },
// };

// // dev-time helpers
// if (typeof window !== "undefined") {
//   try {
//     window.__ION7_BACKEND__ = BACKEND;
//     window.api = api;
//   } catch {}
// }












































































// original

// dashboard/lib/api.js
// NEXT_PUBLIC_BACKEND_ORIGIN=http://3.109.207.179  (or http://127.0.0.1:5000 for local)

export const PUBLIC_HOST =
  process.env.NEXT_PUBLIC_PUBLIC_HOST ||
  "https://ion7devtemplate.mavsketch.com";

const BASE = (
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN ||
  process.env.BACKEND_ORIGIN ||
  "http://127.0.0.1:5000"
).replace(/\/$/, "");

// ✅ Export the resolved backend base (useful for debugging)
export const BACKEND = BASE;

const TOKEN_COOKIE =
  process.env.NEXT_PUBLIC_COOKIE_NAME ||
  process.env.COOKIE_NAME ||
  "auth_token";

/* ---------------- token helpers (cookie + localStorage fallback) ---------------- */
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(
    new RegExp(
      "(^| )" +
        name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
        "=([^;]+)"
    )
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
    if (typeof window !== "undefined")
      localStorage.setItem(TOKEN_COOKIE, token);
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
    if (typeof window !== "undefined")
      localStorage.removeItem(TOKEN_COOKIE);
  } catch {}
}

/**
 * ✅ Decode userId from token.
 * IMPORTANT:
 * - On SERVER (SSR) return null to avoid hydration mismatch
 * - On CLIENT keep your old fallback behaviour ("demo-user")
 */
export function getUserId() {
  // SSR: do not guess any ID
  if (typeof window === "undefined") return null;

  try {
    const t = getToken();
    if (!t) return "demo-user";
    const payload = JSON.parse(
      atob((t.split(".")[1] || "").replace(/-/g, "+").replace(/_/g, "/"))
    );
    return payload?.userId || "demo-user";
  } catch {
    return "demo-user";
  }
}

/**
 * ✅ Get selected templateId
 * Priority:
 *  1) ion7_site cookie (JSON: { uid, tpl, templateId, ... })
 *  2) localStorage
 *  3) fallback "sir-template-1"
 */
export function getTemplateId() {
  try {
    if (typeof document !== "undefined") {
      const raw = getCookie("ion7_site");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          return (
            parsed?.tpl ||
            parsed?.templateId ||
            parsed?.template ||
            "sir-template-1"
          );
        } catch {
          // ignore invalid json
        }
      }
    }

    if (typeof window !== "undefined") {
      const ls =
        localStorage.getItem("ION7_TEMPLATE_ID") ||
        localStorage.getItem("templateId") ||
        localStorage.getItem("tpl");
      if (ls) return ls;
    }
  } catch {}

  return "sir-template-1";
}

/* ---------------- request helpers ---------------- */
async function request(path, init = {}) {
  const headers = Object.assign({}, init.headers || {});
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
    credentials: "include", // ✅ always send cookies too
  });

  const type = res.headers.get("content-type") || "";
  const body = type.includes("application/json")
    ? await res.json()
    : await res.text();

  // ✅ If token missing/expired → redirect to signin
  if (res.status === 401 && typeof window !== "undefined") {
    clearToken();
    const next = window.location.pathname;
    window.location.href = `/authentication/signin?next=${encodeURIComponent(
      next
    )}`;
    return;
  }

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
  /* ✅ Generic HTTP helpers (for Media page etc) */
  get(path) {
    return request(path);
  },
  post(path, body, headers = { "Content-Type": "application/json" }) {
    return request(path, {
      method: "POST",
      headers,
      body:
        headers && headers["Content-Type"] === "application/json"
          ? JSON.stringify(body || {})
          : body,
    });
  },
  put(path, body, headers = { "Content-Type": "application/json" }) {
    return request(path, {
      method: "PUT",
      headers,
      body:
        headers && headers["Content-Type"] === "application/json"
          ? JSON.stringify(body || {})
          : body,
    });
  },
  patch(path, body, headers = { "Content-Type": "application/json" }) {
    return request(path, {
      method: "PATCH",
      headers,
      body:
        headers && headers["Content-Type"] === "application/json"
          ? JSON.stringify(body || {})
          : body,
    });
  },
  delete(path) {
    return request(path, { method: "DELETE" });
  },

  /* ===== Auth ===== */
  login(email, password) {
    return request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  },
  signup(fullName, company, country, email, password) {
    return request("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, company, country, email, password }),
    });
  },
  me() {
    return request("/api/auth/me");
  },

  // 🔹 NEW: Settings page helpers
  updateProfile(data) {
    // { fullName, company, country }
    return request("/api/auth/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data || {}),
    });
  },
  changeEmail(currentPassword, newEmail) {
    return request("/api/auth/change-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newEmail }),
    });
  },
  changePassword(currentPassword, newPassword) {
    return request("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  /* ===== Plans (Choose Plan) ===== */
  listPlans() {
    return request("/api/plans");
  },
  getPrice(priceId) {
    return request(`/api/plans/price/${encodeURIComponent(priceId)}`);
  },

  /* ===== Billing (Elements) ===== */
  /**
   * Matches backend POST /api/billing/elements/start
   * pass email to guarantee Stripe customer has it
   */
  billingStartElements(
    priceId,
    { email, name, country, address1, city, postalCode } = {}
  ) {
    return request(`/api/billing/elements/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId,
        email,
        name,
        country,
        address1,
        city,
        postalCode,
      }),
    });
  },
  billingVerify(payload = {}) {
    return request(`/api/billing/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  /* ===== Billing (Invoices, history) ===== */
  billingInvoices() {
    const uid = getUserId();
    const qs = uid ? `?userId=${encodeURIComponent(uid)}` : "";
    return request(`/api/billing/invoices${qs}`);
  },

  /* ===== Templates & selection ===== */
  listTemplates() {
    return request("/api/templates");
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
  resetTemplate(templateId, userId) {
    return request(`/api/templates/${templateId}/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
  },
  async selectAndReset(templateId, userId) {
    await this.selectTemplate(templateId, userId);
    return this.resetTemplate(templateId, userId);
  },

  /** Helper: get the "Home" page id for a given user/template */
  async getHomePageId(userId, templateId) {
    const rows = await request(
      `/api/sections?userId=${encodeURIComponent(
        userId
      )}&templateId=${encodeURIComponent(
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

  /* ===== Hero / About / Appointment / Services / Team / Testimonials / WhyChoose ===== */
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
    return request(`/api/hero/${userId}/${templateId}/reset`, {
      method: "POST",
    });
  },
  clearHeroImage(userId, templateId) {
    return request(`/api/hero/${userId}/${templateId}/clear-image`, {
      method: "POST",
    });
  },

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
    return request(`/api/about/${userId}/${templateId}/image`, {
      method: "DELETE",
    });
  },

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

  // ✅ appointment background upload/clear
  uploadAppointmentBg(userId, templateId, file) {
    return upload(
      `/api/appointment/${userId}/${templateId}/image`,
      file,
      "image"
    );
  },
  clearAppointmentBg(userId, templateId) {
    return request(
      `/api/appointment/${userId}/${templateId}/clear-image`,
      { method: "POST" }
    );
  },

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
    return upload(
      `/api/services/${userId}/${templateId}/${serviceId}/image`,
      file,
      "image"
    );
  },
  deleteServiceImage(userId, templateId, serviceId) {
    return request(
      `/api/services/${userId}/${templateId}/${serviceId}/image`,
      { method: "DELETE" }
    );
  },

  getTeam(userId, templateId) {
    return request(`/api/team/${userId}/${templateId}`);
  },
  createTeamMember(userId, templateId, body, file) {
    if (file) {
      const fd = new FormData();
      Object.entries(body || {}).forEach(([k, v]) => fd.append(k, v));
      fd.append("image", file);
      return request(`/api/team/${userId}/${templateId}`, {
        method: "POST",
        body: fd,
      });
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
      return request(`/api/testimonial/${id}`, {
        method: "PATCH",
        body: fd,
      });
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
    return upload(
      `/api/whychoose/${userId}/${templateId}/bg`,
      file,
      "image"
    );
  },
  deleteWhyChooseBg(userId, templateId) {
    return request(`/api/whychoose/${userId}/${templateId}/bg`, {
      method: "DELETE",
    });
  },

  /* ===== Optional: Save selected priceId before checkout ===== */
  async choosePlan(priceId) {
    try {
      return await request("/api/subscription/choose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
    } catch (e) {
      return {
        ok: false,
        message: e.message || "Choose plan route not implemented",
      };
    }
  },
};

// dev-time helpers
if (typeof window !== "undefined") {
  try {
    window.__ION7_BACKEND__ = BACKEND;
    window.api = api;
  } catch {}
}













































// // dashboard/lib/api.js
// // NEXT_PUBLIC_BACKEND_ORIGIN=http://3.109.207.179  (or http://127.0.0.1:5000 for local)

// export const PUBLIC_HOST =
//   process.env.NEXT_PUBLIC_PUBLIC_HOST ||
//   "https://ion7devtemplate.mavsketch.com";

// const BASE = (
//   process.env.NEXT_PUBLIC_BACKEND_ORIGIN ||
//   process.env.BACKEND_ORIGIN ||
//   "http://127.0.0.1:5000"
// ).replace(/\/$/, "");

// // ✅ Export the resolved backend base (useful for debugging)
// export const BACKEND = BASE;

// const TOKEN_COOKIE =
//   process.env.NEXT_PUBLIC_COOKIE_NAME ||
//   process.env.COOKIE_NAME ||
//   "auth_token";




// /* ---------------- token helpers (cookie + localStorage fallback) ---------------- */
// function getCookie(name) {
//   if (typeof document === "undefined") return null;
//   const m = document.cookie.match(
//     new RegExp(
//       "(^| )" +
//         name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
//         "=([^;]+)"
//     )
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
//     if (typeof window !== "undefined")
//       localStorage.setItem(TOKEN_COOKIE, token);
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
//     if (typeof window !== "undefined")
//       localStorage.removeItem(TOKEN_COOKIE);
//   } catch {}
// }

// /**
//  * ✅ Decode userId from token.
//  * IMPORTANT:
//  * - On SERVER (SSR) return null to avoid hydration mismatch
//  * - On CLIENT keep your old fallback behaviour ("demo-user")
//  */
// export function getUserId() {
//   // SSR: do not guess any ID
//   if (typeof window === "undefined") return null;

//   try {
//     const t = getToken();
//     if (!t) return "demo-user";
//     const payload = JSON.parse(
//       atob((t.split(".")[1] || "").replace(/-/g, "+").replace(/_/g, "/"))
//     );
//     return payload?.userId || "demo-user";
//   } catch {
//     return "demo-user";
//   }
// }

// /**
//  * ✅ Get selected templateId
//  * Priority:
//  *  1) ion7_site cookie (JSON: { uid, tpl, templateId, ... })
//  *  2) localStorage
//  *  3) fallback "sir-template-1"
//  */
// export function getTemplateId() {
//   try {
//     if (typeof document !== "undefined") {
//       const raw = getCookie("ion7_site");
//       if (raw) {
//         try {
//           const parsed = JSON.parse(raw);
//           return (
//             parsed?.tpl ||
//             parsed?.templateId ||
//             parsed?.template ||
//             "sir-template-1"
//           );
//         } catch {
//           // ignore invalid json
//         }
//       }
//     }

//     if (typeof window !== "undefined") {
//       const ls =
//         localStorage.getItem("ION7_TEMPLATE_ID") ||
//         localStorage.getItem("templateId") ||
//         localStorage.getItem("tpl");
//       if (ls) return ls;
//     }
//   } catch {}

//   return "sir-template-1";
// }

// /* ---------------- request helpers ---------------- */
// async function request(path, init = {}) {
//   const headers = Object.assign({}, init.headers || {});
//   const token = getToken();
//   if (token) headers.Authorization = `Bearer ${token}`;

//   const res = await fetch(`${BASE}${path}`, {
//     ...init,
//     headers,
//     credentials: "include", // ✅ always send cookies too
//   });

//   const type = res.headers.get("content-type") || "";
//   const body = type.includes("application/json")
//     ? await res.json()
//     : await res.text();

//   // ✅ If token missing/expired → redirect to signin
//   if (res.status === 401 && typeof window !== "undefined") {
//     clearToken();
//     const next = window.location.pathname;
//     window.location.href = `/authentication/signin?next=${encodeURIComponent(
//       next
//     )}`;
//     return;
//   }

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
//   /* ✅ Generic HTTP helpers (for Media page etc) */
//   get(path) {
//     return request(path);
//   },
//   post(path, body, headers = { "Content-Type": "application/json" }) {
//     return request(path, {
//       method: "POST",
//       headers,
//       body:
//         headers && headers["Content-Type"] === "application/json"
//           ? JSON.stringify(body || {})
//           : body,
//     });
//   },
//   put(path, body, headers = { "Content-Type": "application/json" }) {
//     return request(path, {
//       method: "PUT",
//       headers,
//       body:
//         headers && headers["Content-Type"] === "application/json"
//           ? JSON.stringify(body || {})
//           : body,
//     });
//   },
//   patch(path, body, headers = { "Content-Type": "application/json" }) {
//     return request(path, {
//       method: "PATCH",
//       headers,
//       body:
//         headers && headers["Content-Type"] === "application/json"
//           ? JSON.stringify(body || {})
//           : body,
//     });
//   },
//   delete(path) {
//     return request(path, { method: "DELETE" });
//   },

//   /* ===== Auth ===== */
//   login(email, password) {
//     return request("/api/auth/login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password }),
//     });
//   },
//   signup(fullName, company, country, email, password) {
//     return request("/api/auth/signup", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ fullName, company, country, email, password }),
//     });
//   },
//   me() {
//     return request("/api/auth/me");
//   },

//   // 🔹 NEW: Settings page helpers
//   updateProfile(data) {
//     // { fullName, company, country }
//     return request("/api/auth/profile", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data || {}),
//     });
//   },
//   changeEmail(currentPassword, newEmail) {
//     return request("/api/auth/change-email", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ currentPassword, newEmail }),
//     });
//   },
//   changePassword(currentPassword, newPassword) {
//     return request("/api/auth/change-password", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ currentPassword, newPassword }),
//     });
//   },

//   /* ===== Plans (Choose Plan) ===== */
//   listPlans() {
//     return request("/api/plans");
//   },
//   getPrice(priceId) {
//     return request(`/api/plans/price/${encodeURIComponent(priceId)}`);
//   },

//   /* ===== Billing (Elements) ===== */
//   /**
//    * Matches backend POST /api/billing/elements/start
//    * pass email to guarantee Stripe customer has it
//    */
//   billingStartElements(
//     priceId,
//     { email, name, country, address1, city, postalCode } = {}
//   ) {
//     return request(`/api/billing/elements/start`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         priceId,
//         email,
//         name,
//         country,
//         address1,
//         city,
//         postalCode,
//       }),
//     });
//   },
//   billingVerify(payload = {}) {
//     return request(`/api/billing/verify`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });
//   },

//   /* ===== Billing (Invoices, history) ===== */
//   billingInvoices() {
//     const uid = getUserId();
//     const qs = uid ? `?userId=${encodeURIComponent(uid)}` : "";
//     return request(`/api/billing/invoices${qs}`);
//   },

//   /* ===== Domain info (for Domain widget) ===== */
//   getDomainInfo() {
//     return request("/api/domain/me");
//   },

//   /* ===== Templates & selection ===== */
//   listTemplates() {
//     return request("/api/templates");
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
//   resetTemplate(templateId, userId) {
//     return request(`/api/templates/${templateId}/reset`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ userId }),
//     });
//   },
//   async selectAndReset(templateId, userId) {
//     await this.selectTemplate(templateId, userId);
//     return this.resetTemplate(templateId, userId);
//   },

//   /** Helper: get the "Home" page id for a given user/template */
//   async getHomePageId(userId, templateId) {
//     const rows = await request(
//       `/api/sections?userId=${encodeURIComponent(
//         userId
//       )}&templateId=${encodeURIComponent(
//         templateId
//       )}&type=page&slug=home`
//     );
//     const list = Array.isArray(rows) ? rows : rows?.data || [];
//     const page =
//       list.find(
//         (r) =>
//           r?.type === "page" &&
//           ((r?.slug || "").toLowerCase() === "home" ||
//             (r?.title || "").toLowerCase() === "home")
//       ) || null;
//     return page?._id || null;
//   },

//   /* ===== Hero / About / Appointment / Services / Team / Testimonials / WhyChoose ===== */
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
//     return request(`/api/hero/${userId}/${templateId}/reset`, {
//       method: "POST",
//     });
//   },
//   clearHeroImage(userId, templateId) {
//     return request(`/api/hero/${userId}/${templateId}/clear-image`, {
//       method: "POST",
//     });
//   },

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
//     return request(`/api/about/${userId}/${templateId}/image`, {
//       method: "DELETE",
//     });
//   },

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

//   // ✅ appointment background upload/clear
//   uploadAppointmentBg(userId, templateId, file) {
//     return upload(
//       `/api/appointment/${userId}/${templateId}/image`,
//       file,
//       "image"
//     );
//   },
//   clearAppointmentBg(userId, templateId) {
//     return request(
//       `/api/appointment/${userId}/${templateId}/clear-image`,
//       { method: "POST" }
//     );
//   },

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
//     return upload(
//       `/api/services/${userId}/${templateId}/${serviceId}/image`,
//       file,
//       "image"
//     );
//   },
//   deleteServiceImage(userId, templateId, serviceId) {
//     return request(
//       `/api/services/${userId}/${templateId}/${serviceId}/image`,
//       { method: "DELETE" }
//     );
//   },

//   getTeam(userId, templateId) {
//     return request(`/api/team/${userId}/${templateId}`);
//   },
//   createTeamMember(userId, templateId, body, file) {
//     if (file) {
//       const fd = new FormData();
//       Object.entries(body || {}).forEach(([k, v]) => fd.append(k, v));
//       fd.append("image", file);
//       return request(`/api/team/${userId}/${templateId}`, {
//         method: "POST",
//         body: fd,
//       });
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
//       return request(`/api/testimonial/${id}`, {
//         method: "PATCH",
//         body: fd,
//       });
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
//     return upload(
//       `/api/whychoose/${userId}/${templateId}/bg`,
//       file,
//       "image"
//     );
//   },
//   deleteWhyChooseBg(userId, templateId) {
//     return request(`/api/whychoose/${userId}/${templateId}/bg`, {
//       method: "DELETE",
//     });
//   },

//   /* ===== Optional: Save selected priceId before checkout ===== */
//   async choosePlan(priceId) {
//     try {
//       return await request("/api/subscription/choose", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ priceId }),
//       });
//     } catch (e) {
//       return {
//         ok: false,
//         message: e.message || "Choose plan route not implemented",
//       };
//     }
//   },
// };

// // dev-time helpers
// if (typeof window !== "undefined") {
//   try {
//     window.__ION7_BACKEND__ = BACKEND;
//     window.api = api;
//   } catch {}
// }
