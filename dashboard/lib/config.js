





export const backendBaseUrl =
  (process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://127.0.0.1:5000").replace(/\/$/, "");

// You can keep this hard-coded demo user or wire from JWT later
export const userId = "demo-user";

// Public site host (already used by nginx / templates)
export const PUBLIC_HOST = "https://ion7devtemplate.mavsketch.com";

// S3 bits (unchanged)
export const s3Bucket = "project1-uploads-12345";
export const s3Region = "ap-south-1";

/* ---------------- Local remember of selected template ---------------- */
const KEY = "selected_template";

export function setSelectedTemplateId(id) {
  try {
    if (typeof window !== "undefined") localStorage.setItem(KEY, id || "");
  } catch {}
}

export function getSelectedTemplateId() {
  try {
    if (typeof window !== "undefined") return localStorage.getItem(KEY) || "";
  } catch {}
  return "";
}

/* ---------------- Provide templateId export (required by older pages) ---------------- */
export const templateId =
  process.env.NEXT_PUBLIC_TEMPLATE_ID ||
  getSelectedTemplateId() ||
  "gym-template-1";

// (Optional) some files may import this alias:
export const defaultTemplateId = templateId;

// Default export for convenience (won’t break anything)
export default { backendBaseUrl, userId, PUBLIC_HOST, s3Bucket, s3Region, templateId };
