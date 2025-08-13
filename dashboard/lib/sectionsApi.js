


// C:\Users\97158\Desktop\project1\dashboard\lib\sectionsApi.js
import axios from "axios";
import { backendBaseUrl } from "./config";

const api = axios.create({
  baseURL: `${backendBaseUrl}/api`,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});


export const SectionsApi = {
  
  list(userId, templateId, params = {}) {
    return api.get(`/sections/${userId}/${templateId}`, { params });
  },

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
