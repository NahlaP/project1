// scripts/seedPages.js ✅ CommonJS version
const axios = require('axios');

const baseURL = 'http://localhost:5000/api';
const userId = 'demo-user';
const templateId = 'gym-template-1';

const pages = [
  { title: 'Home Page', slug: 'homepage' },
  { title: 'About Us', slug: 'about' },
  { title: 'Why Choose Us', slug: 'why-choose' },
  { title: 'Services', slug: 'services' },
  { title: 'Appointment', slug: 'appointment-editor' },
  { title: 'Team', slug: 'team-editor' },
  { title: 'Testimonial', slug: 'testimonial-editor' },
  { title: 'Contact', slug: 'contact-editor' },
];

async function seedPages() {
  for (let i = 0; i < pages.length; i++) {
    const { title, slug } = pages[i];
    try {
      const res = await axios.post(`${baseURL}/sections/${userId}/${templateId}`, {
        title,
        slug,
        type: 'page',
      });
      console.log(`✅ Created: ${res.data.title}`);
    } catch (err) {
      console.error(`❌ Failed to create "${title}"`, err.response?.data || err.message);
    }
  }
}

seedPages();
