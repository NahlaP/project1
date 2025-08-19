// const isLocal = false; 

// export const backendBaseUrl = isLocal
//   ? "http://localhost:5000"
//   : "https://project1backend-2xvq.onrender.com";

// export const userId = "demo-user";
// export const templateId = "gym-template-1";



// const isLocal = true;

// export const backendBaseUrl = isLocal
//   ? "http://localhost:5000"
//   : "https://project1backend-2xvq.onrender.com";

// export const userId = "demo-user";
// export const templateId = "gym-template-1";



// C:\Users\97158\Desktop\project1\dashboard\lib\config.js

// Use local while developing, switch to AWS in prod
// const isLocal = false;

// export const backendBaseUrl = isLocal
//   ? "http://localhost:5000"
//   : "http://3.109.207.179/api"; // Nginx proxies /api → Node:5000

// export const userId = "demo-user";
// export const templateId = "gym-template-1";



// // og
// // dashboard/lib/config.js
// export const backendBaseUrl = ''; // keep empty so fetch('/api/...') works
// export const userId = 'demo-user';
// export const templateId = 'gym-template-1';



// dashboard/lib/config.js
export const backendBaseUrl = ''; // keep empty so fetch('/api/...') hits Next.js rewrites
export const userId = 'demo-user';
export const templateId = 'gym-template-1';

// add these (safe to expose):
export const s3Bucket = 'project1-uploads-12345';
export const s3Region = 'ap-south-1';
