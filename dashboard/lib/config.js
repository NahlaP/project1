







// // dashboard/lib/config.js
// export const backendBaseUrl =
//   process.env.NEXT_PUBLIC_BACKEND_ORIGIN || 'http://127.0.0.1:5000';

// export const userId = 'demo-user';
// // ⛔️ do NOT hardcode templateId here anymore (we resolve it from backend/local)
// // export const templateId = 'gym-template-1';

// // Optional (if you use absFromKey somewhere)
// export const s3Bucket = 'project1-uploads-12345';
// export const s3Region = 'ap-south-1';

// // --- Local remember of selected template (used for fast client-side routing) ---
// const KEY = 'selected_template';

// export function setSelectedTemplateId(id) {
//   try {
//     if (typeof window !== 'undefined') localStorage.setItem(KEY, id || '');
//   } catch {}
// }

// export function getSelectedTemplateId() {
//   try {
//     if (typeof window !== 'undefined') return localStorage.getItem(KEY) || '';
//   } catch {}
//   return '';
// }















// dashboard/lib/config.js
export const backendBaseUrl =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || 'http://127.0.0.1:5000';

export const userId = 'demo-user';


// Optional (if you use absFromKey somewhere)
export const s3Bucket = 'project1-uploads-uae-12345';
export const s3Region = 'me-central-1';
NEXT_PUBLIC_S3_BUCKET=project1-uploads-uae-12345
NEXT_PUBLIC_S3_REGION=me-central-1
// --- Local remember of selected template (used for fast client-side routing) ---
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
