


// // C:\Users\97158\Desktop\project1\dashboard\lib\sectionsApi.js
// import axios from "axios";
// import { backendBaseUrl } from "./config";

// const api = axios.create({
//   baseURL: `${backendBaseUrl}/api`,
//   timeout: 20000,
//   headers: { "Content-Type": "application/json" },
// });


// export const SectionsApi = {
  
//   list(userId, templateId, params = {}) {
//     return api.get(`/sections/${userId}/${templateId}`, { params });
//   },

//   listByParent(userId, templateId, parentPageId) {
//     return api.get(`/sections/${userId}/${templateId}`, {
//       params: { parentPageId },
//     });
//   },

//   /** Get one section/page by _id */
//   getOne(id) {
//     return api.get(`/sections/by-id/${id}`);
//   },

//   /** Create a new section/page */
//   create(userId, templateId, body) {
//     return api.post(`/sections/${userId}/${templateId}`, body);
//   },

//   /** Reorder sections/pages (expects [{ _id, order }, ...]) */
//   reorder(userId, templateId, items) {
//     return api.post(`/sections/reorder/${userId}/${templateId}`, { items });
//   },

//   /** Patch a section/page */
//   patch(id, body) {
//     return api.patch(`/sections/${id}`, body);
//   },

//   /** Delete a section/page */
//   remove(id) {
//     return api.delete(`/sections/${id}`);
//   },
// };

// export default SectionsApi;
// C:\Users\97158\Desktop\project1\dashboard\lib\sectionsApi.js
import axios from "axios";

// Same-origin so all requests go to https://<vercel-domain>/api/...,
// and Next.js rewrites will proxy to your EC2 backend.
const api = axios.create({
  baseURL: "/api",
  timeout: 20000,
});

// If any call sends FormData (for uploads), let the browser set the boundary:
api.interceptors.request.use((cfg) => {
  if (typeof window !== "undefined" && cfg.data instanceof FormData) {
    // axios may set multipart header automatically; we ensure it's not forced to JSON
    delete cfg.headers["Content-Type"];
  }
  return cfg;
});

export const SectionsApi = {
  list(userId, templateId, params = {}) {
    return api.get(`/sections/${userId}/${templateId}`, { params });
  },

  listByParent(userId, templateId, parentPageId) {
    return api.get(`/sections/${userId}/${templateId}`, { params: { parentPageId } });
  },

  getOne(id) {
    return api.get(`/sections/by-id/${id}`);
  },

  create(userId, templateId, body) {
    // JSON create (no files)
    return api.post(`/sections/${userId}/${templateId}`, body);
  },

  reorder(userId, templateId, items) {
    return api.post(`/sections/reorder/${userId}/${templateId}`, { items });
  },

  patch(id, body) {
    return api.patch(`/sections/${id}`, body);
  },

  remove(id) {
    return api.delete(`/sections/${id}`);
  },
};

export default SectionsApi;
