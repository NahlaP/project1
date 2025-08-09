

// import axios from 'axios';
// import { backendBaseUrl } from './config'; // ✅ import from centralized config

// const api = axios.create({
//   baseURL: `${backendBaseUrl}/api`, // ✅ dynamic baseURL from config
// });

// export const SectionsApi = {
//   // List all sections and pages for the given user/template
//   list: (userId, templateId) => api.get(`/sections/${userId}/${templateId}`),

//   // Get a single section/page by ID
//   getOne: (id) => api.get(`/sections/by-id/${id}`),

//   // Create a new section/page
//   create: (userId, templateId, body) =>
//     api.post(`/sections/${userId}/${templateId}`, body),

//   // Reorder sections/pages
//   reorder: (userId, templateId, items) =>
//     api.post(`/sections/reorder/${userId}/${templateId}`, { items }),

//   // Update a section/page
//   patch: (id, body) => api.patch(`/sections/${id}`, body),

//   // Delete a section/page
//   remove: (id) => api.delete(`/sections/${id}`),
// };



// C:\Users\97158\Desktop\project1\dashboard\lib\sectionsApi.js
import axios from "axios";
import { backendBaseUrl } from "./config";

const api = axios.create({
  baseURL: `${backendBaseUrl}/api`,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

/**
 * Sections API
 * All methods return the raw Axios promise so you can access res.data/res.status.
 */
export const SectionsApi = {
  /**
   * List sections/pages for a user+template.
   * Optional query params (server-side filtering): { parentPageId, type, slug, title, order }
   */
  list(userId, templateId, params = {}) {
    return api.get(`/sections/${userId}/${templateId}`, { params });
  },

  /** Convenience: list only sections assigned to a specific page */
  listByParent(userId, templateId, parentPageId) {
    return api.get(`/sections/${userId}/${templateId}`, {
      params: { parentPageId },
    });
  },

  /** Get one section/page by _id */
  getOne(id) {
    return api.get(`/sections/by-id/${id}`);
  },

  /** Create a new section/page */
  create(userId, templateId, body) {
    return api.post(`/sections/${userId}/${templateId}`, body);
  },

  /** Reorder sections/pages (expects [{ _id, order }, ...]) */
  reorder(userId, templateId, items) {
    return api.post(`/sections/reorder/${userId}/${templateId}`, { items });
  },

  /** Patch a section/page */
  patch(id, body) {
    return api.patch(`/sections/${id}`, body);
  },

  /** Delete a section/page */
  remove(id) {
    return api.delete(`/sections/${id}`);
  },
};

export default SectionsApi;
