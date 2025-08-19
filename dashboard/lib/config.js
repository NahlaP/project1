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



// og
// // dashboard/lib/config.js
// export const backendBaseUrl = ''; // keep empty so fetch('/api/...') works
// export const userId = 'demo-user';
// export const templateId = 'gym-template-1';




// dashboard/next.config.js
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "http://3.109.207.179";

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_ORIGIN}/api/:path*` }];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "project1-uploads-12345.s3.ap-south-1.amazonaws.com" },
    ],
  },
};
