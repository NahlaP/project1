const axios = require('axios');

const baseURL = 'http://localhost:5000/api';
const userId = 'demo-user';
const templateId = 'gym-template-1';

async function deleteAllPages() {
  try {
    const { data } = await axios.get(`${baseURL}/sections/${userId}/${templateId}`);

    const pagesToDelete = data.filter((item) => item.type === 'page');

    for (const page of pagesToDelete) {
      await axios.delete(`${baseURL}/sections/${page._id}`);
      console.log(`🗑️ Deleted: ${page.title}`);
    }

    if (pagesToDelete.length === 0) {
      console.log('ℹ️ No pages found to delete.');
    }
  } catch (err) {
    console.error('❌ Error deleting pages:', err.response?.data || err.message);
  }
}

deleteAllPages();
