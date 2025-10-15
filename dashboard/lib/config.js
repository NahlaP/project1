

// prod
// dashboard/lib/config.js
export const backendBaseUrl =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || 'http://127.0.0.1:5000';

export const userId = 'demo-user';



export const s3Bucket = 'project1-uploads-uae-12345';
export const s3Region = 'me-central-1';


const KEY = 'selected_template';

export function setSelectedTemplateId(id) {
  try {
    if (typeof window !== 'undefined') localStorage.setItem(KEY, id || '');
  } catch {}
}

export function getSelectedTemplateId() {
  try {
    if (typeof window !== 'undefined') return localStorage.getItem(KEY) || '';
  } catch {}
  return '';
}
