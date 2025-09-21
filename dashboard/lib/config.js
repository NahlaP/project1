



// // dashboard/lib/config.js
// export const backendBaseUrl = ''; 
// export const userId = 'demo-user';
// export const templateId = 'gym-template-1';

// // add these (safe to expose):
// export const s3Bucket = 'project1-uploads-12345';
// export const s3Region = 'ap-south-1';



// dashboard/lib/config.js
export const backendBaseUrl =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || 'http://127.0.0.1:5000';

export const userId = 'demo-user';
export const templateId = 'gym-template-1';

// (optional) these are fine to expose if you really need the fallback absFromKey
export const s3Bucket = 'project1-uploads-12345';
export const s3Region = 'ap-south-1';
