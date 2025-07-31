// scripts/deleteSeededPages.js
const axios = require('axios');

const baseURL = 'http://localhost:5000/api';
const userId = 'demo-user';
const templateId = 'gym-template-1';

const slugsToDelete = [
  'homepage',
  'about',
  'why-choose',
  'services',
  'appointment-editor',
  'team-editor',
  'testimonial-editor',
  'contact-editor',
];

async function deletePages() {
  try {
    const { data } = await axios.get(`${baseURL}/sections/${userId}/${templateId}`);

    const pagesToDelete = data.filter((item) => slugsToDelete.includes(item.slug));

    for (const page of pagesToDelete) {
      await axios.delete(`${baseURL}/sections/${page._id}`);
      console.log(`🗑️ Deleted: ${page.title}`);
    }

    if (pagesToDelete.length === 0) {
      console.log('ℹ️ No matching seeded pages found to delete.');
    }
  } catch (err) {
    console.error('❌ Error deleting pages:', err.response?.data || err.message);
  }
}

deletePages();
