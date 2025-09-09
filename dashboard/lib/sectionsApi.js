
// C:\Users\97158\Desktop\project1\dashboard\lib\sectionsApi.js
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
