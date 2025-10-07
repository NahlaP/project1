
// // C:\Users\97158\Desktop\project1\dashboard\lib\sectionsApi.js
// import axios from "axios";


// const api = axios.create({
//   baseURL: "/api",
//   timeout: 20000,
// });


// api.interceptors.request.use((cfg) => {
//   if (typeof window !== "undefined" && cfg.data instanceof FormData) {

//     delete cfg.headers["Content-Type"];
//   }
//   return cfg;
// });

// export const SectionsApi = {
//   list(userId, templateId, params = {}) {
//     return api.get(`/sections/${userId}/${templateId}`, { params });
//   },

//   listByParent(userId, templateId, parentPageId) {
//     return api.get(`/sections/${userId}/${templateId}`, { params: { parentPageId } });
//   },

//   getOne(id) {
//     return api.get(`/sections/by-id/${id}`);
//   },

//   create(userId, templateId, body) {
//     // JSON create (no files)
//     return api.post(`/sections/${userId}/${templateId}`, body);
//   },

//   reorder(userId, templateId, items) {
//     return api.post(`/sections/reorder/${userId}/${templateId}`, { items });
//   },

//   patch(id, body) {
//     return api.patch(`/sections/${id}`, body);
//   },

//   remove(id) {
//     return api.delete(`/sections/${id}`);
//   },
// };

// export default SectionsApi;




// before reset
// // og2
// // dashboard/lib/sectionsApi.js
// import axios from "axios";

// const api = axios.create({
//   baseURL: "/api",
//   timeout: 20000,
// });

// api.interceptors.request.use((cfg) => {
//   if (typeof window !== "undefined" && cfg.data instanceof FormData) {
//     delete cfg.headers["Content-Type"];
//   }
//   return cfg;
// });

// export const SectionsApi = {
//   // list for a template (optionally filter by type/slug/parentPageId via params)
//   list(userId, templateId, params = {}) {
//     return api.get(`/sections/${userId}/${templateId}`, { params });
//   },

//   // list only children of a specific page
//   listByParent(userId, templateId, parentPageId) {
//     return api.get(`/sections/${userId}/${templateId}`, {
//       params: { parentPageId },
//     });
//   },

//   // get one by id
//   getOne(id) {
//     return api.get(`/sections/by-id/${id}`);
//   },

//   // create page or child
//   create(userId, templateId, body) {
//     return api.post(`/sections/${userId}/${templateId}`, body);
//   },

//   // reorder pages (legacy/global)
//   reorder(userId, templateId, items) {
//     return api.post(`/sections/reorder/${userId}/${templateId}`, { items });
//   },

//   // ✅ reorder ONLY the sections within a given page
//   reorderForPage(userId, templateId, parentPageId, items) {
//     return api.post(`/sections/reorder/${userId}/${templateId}`, {
//       parentPageId,
//       items,
//     });
//   },

//   // patch any section
//   patch(id, body) {
//     return api.patch(`/sections/${id}`, body);
//   },

//   // delete a section
//   remove(id) {
//     return api.delete(`/sections/${id}`);
//   },
// };

// export default SectionsApi;



// // works fine st
// // dashboard/lib/sectionsApi.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 20000,
});

api.interceptors.request.use((cfg) => {
  if (typeof window !== "undefined" && cfg.data instanceof FormData) {
    delete cfg.headers["Content-Type"];
  }
  return cfg;
});

/* ---------- NORMALIZERS (hide 'works', rename to 'projects') ---------- */
const HIDE_WORKS = true;

function normalizeOne(row) {
  if (!row || typeof row !== "object") return row;
  const out = { ...row };
  if (String(out.type).toLowerCase() === "works") {
    out.type = "projects";
    if (!out.title || /^works$/i.test(String(out.title))) out.title = "Projects";
  }
  return out;
}
function normalizeList(rows = []) {
  const list = Array.isArray(rows) ? rows.map(normalizeOne) : [];
  return HIDE_WORKS
    ? list.filter((r) => String(r.type).toLowerCase() !== "works")
    : list;
}

/** Wrap raw data back into an axios-like response { data } */
function wrap(data) {
  return { data };
}

export const SectionsApi = {
  /** list for a template (optionally filter by type/slug/parentPageId via params) */
  async list(userId, templateId, params = {}) {
    const res = await api.get(`/sections/${userId}/${templateId}`, { params });
    const raw = Array.isArray(res.data) ? res.data : res.data?.data || [];
    return wrap(normalizeList(raw));
  },

  /** list only children of a specific page */
  async listByParent(userId, templateId, parentPageId) {
    const res = await api.get(`/sections/${userId}/${templateId}`, {
      params: { parentPageId },
    });
    const raw = Array.isArray(res.data) ? res.data : res.data?.data || [];
    return wrap(normalizeList(raw));
  },

  /** get one by id */
  async getOne(id) {
    const res = await api.get(`/sections/by-id/${id}`);
    return wrap(normalizeOne(res.data));
  },

  /** create page or child */
  create(userId, templateId, body) {
    return api.post(`/sections/${userId}/${templateId}`, body);
  },

  /** reorder pages (legacy/global) */
  reorder(userId, templateId, items) {
    return api.post(`/sections/reorder/${userId}/${templateId}`, { items });
  },

  /** reorder ONLY the sections within a given page (backend safely ignores parentPageId if unused) */
  reorderForPage(userId, templateId, parentPageId, items) {
    return api.post(`/sections/reorder/${userId}/${templateId}`, {
      parentPageId,
      items,
    });
  },

  /** patch any section */
  patch(id, body) {
    return api.patch(`/sections/${id}`, body);
  },

  /** delete a section */
  remove(id) {
    return api.delete(`/sections/${id}`);
  },
};

export default SectionsApi;
















