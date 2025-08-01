
// import axios from 'axios';

// const baseURL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';

// const api = axios.create({ baseURL });

// export const SectionsApi = {
//   // list all sections (and pages) for a user/template
//   list: (userId, templateId) => api.get(`/sections/${userId}/${templateId}`),

//   // get ONE section/page by id  <-- use the safer /by-id/:id route we added
//   getOne: (id) => api.get(`/sections/by-id/${id}`),

//   // create new section/page
//   create: (userId, templateId, body) =>
//     api.post(`/sections/${userId}/${templateId}`, body),


// reorder: (userId, templateId, items) =>
//   api.post(`/sections/reorder/${userId}/${templateId}`, { items }),


//   // update a section/page
//   patch: (id, body) => api.patch(`/sections/${id}`, body),

//   // delete a section/page
//   remove: (id) => api.delete(`/sections/${id}`),
// };

import axios from 'axios';
import { backendBaseUrl } from './config'; // ✅ import from centralized config

const api = axios.create({
  baseURL: `${backendBaseUrl}/api`, // ✅ dynamic baseURL from config
});

export const SectionsApi = {
  // List all sections and pages for the given user/template
  list: (userId, templateId) => api.get(`/sections/${userId}/${templateId}`),

  // Get a single section/page by ID
  getOne: (id) => api.get(`/sections/by-id/${id}`),

  // Create a new section/page
  create: (userId, templateId, body) =>
    api.post(`/sections/${userId}/${templateId}`, body),

  // Reorder sections/pages
  reorder: (userId, templateId, items) =>
    api.post(`/sections/reorder/${userId}/${templateId}`, { items }),

  // Update a section/page
  patch: (id, body) => api.patch(`/sections/${id}`, body),

  // Delete a section/page
  remove: (id) => api.delete(`/sections/${id}`),
};
