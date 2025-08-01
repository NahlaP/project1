const isLocal = false; // ✅ change to true when testing locally

export const backendBaseUrl = isLocal
  ? "http://localhost:5000"
  : "https://project1backend-2xvq.onrender.com";

export const userId = "demo-user";
export const templateId = "gym-template-1";
