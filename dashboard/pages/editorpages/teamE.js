




// // C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\teamE.js
// "use client";

// import React, { useEffect, useState } from "react";
// import { backendBaseUrl, userId as defaultUserId, templateId as defaultTemplateId } from "../../lib/config";
// import { api } from "../../lib/api";

// /** Resolve templateId in this order:
//  *  1) ?templateId=… in URL
//  *  2) backend-selected template for the user
//  *  3) config fallback (legacy)
//  */
// function useResolvedTemplateId(userId) {
//   const [tpl, setTpl] = useState("");
//   useEffect(() => {
//     let off = false;
//     (async () => {
//       // 1) URL
//       const sp = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
//       const fromUrl = sp?.get("templateId")?.trim();
//       if (fromUrl) {
//         if (!off) setTpl(fromUrl);
//         return;
//       }
//       // 2) Backend-selected
//       try {
//         const sel = await api.selectedTemplateForUser(userId);
//         const t = sel?.data?.templateId;
//         if (t && !off) {
//           setTpl(t);
//           return;
//         }
//       } catch {}
//       // 3) Fallback
//       if (!off) setTpl(defaultTemplateId || "gym-template-1");
//     })();
//     return () => {
//       off = true;
//     };
//   }, [userId]);
//   return tpl;
// }

// export default function TeamPreview() {
//   const userId = defaultUserId;
//   const templateId = useResolvedTemplateId(userId);
//   const [team, setTeam] = useState([]);

//   // Helper: presign any S3 key via backend
//   const getSignedUrlFor = async (key) => {
//     if (!key) return "";
//     try {
//       const res = await fetch(
//         `${backendBaseUrl}/api/upload/file-url?key=${encodeURIComponent(key)}`
//       );
//       const json = await res.json().catch(() => ({}));
//       return json?.url || json?.signedUrl || "";
//     } catch {
//       return "";
//     }
//   };

//   useEffect(() => {
//     if (!templateId) return;
//     (async () => {
//       try {
//         const res = await fetch(
//           `${backendBaseUrl}/api/team/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`,
//           { headers: { Accept: "application/json" }, cache: "no-store" }
//         );
//         const arr = (await res.json()) || [];
//         const safe = Array.isArray(arr) ? arr : [];

//         // Build displayUrl per member:
//         const withUrls = await Promise.all(
//           safe.map(async (m) => {
//             // If backend already gave a full URL, use it
//             if (m.imageUrl && /^https?:\/\//i.test(m.imageUrl)) {
//               return { ...m, displayUrl: m.imageUrl };
//             }
//             // If we only have a key (imageKey or non-http imageUrl), presign it
//             const key =
//               m.imageKey ||
//               (m.imageUrl && !/^https?:\/\//i.test(m.imageUrl) ? m.imageUrl : "");
//             if (key) {
//               const url = await getSignedUrlFor(key);
//               return { ...m, displayUrl: url || "" };
//             }
//             // Legacy /uploads path fallback (absolute URL via backend origin)
//             if (typeof m.imageKey === "string" && m.imageKey.startsWith("/uploads/")) {
//               return { ...m, displayUrl: `${backendBaseUrl}${m.imageKey}` };
//             }
//             return { ...m, displayUrl: "" };
//           })
//         );

//         setTeam(withUrls);
//       } catch (e) {
//         console.error("❌ Failed to fetch team", e);
//         setTeam([]);
//       }
//     })();
//   }, [templateId, userId]);

//   const bgUrl = team[0]?.displayUrl || "";

//   return (
//     <div
//       className="d-flex w-100 bg-white shadow-sm"
//       style={{
//         width: "896px",
//         height: "290px",
//         borderRadius: "20px",
//         overflow: "hidden",
//       }}
//     >
//       {/* Left: First team member image */}
//       <div
//         style={{
//           width: "50%",
//           height: "127%",
//           backgroundImage: bgUrl ? `url(${bgUrl})` : "none",
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//         }}
//       >
//         {!bgUrl && (
//           <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white bg-secondary">
//             No Image
//           </div>
//         )}
//       </div>

//       {/* Right: Team content */}
//       <div
//         className="d-flex flex-column justify-content-center p-4"
//         style={{ width: "50%", height: "100%", overflowY: "auto" }}
//       >
//         <h5 className="fw-bold text-uppercase mb-2">Meet Our Team</h5>
//         {team.slice(0, 2).map((member, idx) => (
//           <div key={member._id || idx} className="mb-2">
//             <strong>{member.name || "Member Name"}</strong>{" "}
//             <span className="text-muted">— {member.role || member.profession || "Role"}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }













// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\teamE.js
"use client";

import React, { useEffect, useState } from "react";
import {
  backendBaseUrl,
  userId as defaultUserId,
  templateId as defaultTemplateId,
} from "../../lib/config";
import { api } from "../../lib/api";

/** Resolve templateId in this order:
 *  1) ?templateId=… in URL
 *  2) backend-selected template for the user
 *  3) config fallback (legacy)
 */
function useResolvedTemplateId(userId) {
  const [tpl, setTpl] = useState("");
  useEffect(() => {
    let off = false;
    (async () => {
      // 1) URL
      const sp =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search)
          : null;
      const fromUrl = sp?.get("templateId")?.trim();
      if (fromUrl) {
        if (!off) setTpl(fromUrl);
        return;
      }
      // 2) Backend-selected
      try {
        const sel = await api.selectedTemplateForUser(userId);
        const t = sel?.data?.templateId;
        if (t && !off) {
          setTpl(t);
          return;
        }
      } catch {}
      // 3) Fallback
      if (!off) setTpl(defaultTemplateId || "gym-template-1");
    })();
    return () => {
      off = true;
    };
  }, [userId]);
  return tpl;
}

const ABS = /^https?:\/\//i;
const isAbs = (u) => typeof u === "string" && ABS.test(u);

// Helper: presign any S3 key via backend
async function presign(key) {
  if (!key) return "";
  try {
    const res = await fetch(
      `${backendBaseUrl}/api/upload/file-url?key=${encodeURIComponent(key)}`,
      { credentials: "include", cache: "no-store" }
    );
    const json = await res.json().catch(() => ({}));
    return json?.url || json?.signedUrl || "";
  } catch {
    return "";
  }
}

function normalizeArray(payload) {
  // supports array OR { members: [...] }
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.members)) return payload.members;
  return [];
}

export default function TeamPreview() {
  const userId = defaultUserId;
  const templateId = useResolvedTemplateId(userId);
  const [team, setTeam] = useState([]);

  useEffect(() => {
    if (!templateId) return;
    (async () => {
      try {
        const res = await fetch(
          `${backendBaseUrl}/api/team/${encodeURIComponent(
            userId
          )}/${encodeURIComponent(templateId)}?_=${Date.now()}`,
          {
            headers: { Accept: "application/json" },
            credentials: "include",
            cache: "no-store",
          }
        );
        const raw = await res.json().catch(() => ({}));
        const base = normalizeArray(raw);

        // Build displayUrl per member:
        const withUrls = await Promise.all(
          base.map(async (m) => {
            // If backend already gave absolute URL, use it
            if (m?.imageUrl && isAbs(m.imageUrl)) return { ...m, displayUrl: m.imageUrl };

            // If only a key (imageKey or non-http imageUrl), presign it
            const key =
              m?.imageKey ||
              (m?.imageUrl && !isAbs(m.imageUrl) ? m.imageUrl : "");
            if (key) {
              const url = await presign(key);
              if (url) return { ...m, displayUrl: url };
            }

            // Legacy /uploads path fallback (absolute via backend origin)
            if (typeof m?.imageKey === "string" && m.imageKey.startsWith("/uploads/")) {
              return { ...m, displayUrl: `${backendBaseUrl}${m.imageKey}` };
            }

            return { ...m, displayUrl: "" };
          })
        );

        setTeam(withUrls);
      } catch (e) {
        console.error("❌ Failed to fetch team", e);
        setTeam([]);
      }
    })();
  }, [templateId, userId]);

  const bgUrl = team[0]?.displayUrl || "";

  return (
    <div
      className="d-flex w-100 bg-white shadow-sm"
      style={{
        width: "896px",
        height: "290px",
        borderRadius: "20px",
        overflow: "hidden",
      }}
    >
      {/* Left: First team member image */}
      <div
        style={{
          width: "50%",
          height: "100%",
          backgroundImage: bgUrl ? `url(${bgUrl})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {!bgUrl && (
          <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white bg-secondary">
            No Image
          </div>
        )}
      </div>

      {/* Right: Team content */}
      <div
        className="d-flex flex-column justify-content-center p-4"
        style={{ width: "50%", height: "100%", overflowY: "auto" }}
      >
        <h5 className="fw-bold text-uppercase mb-2">Meet Our Team</h5>
        {team.slice(0, 2).map((member, idx) => (
          <div key={member._id || idx} className="mb-2">
            <strong>{member.name || "Member Name"}</strong>{" "}
            <span className="text-muted">
              — {member.role || member.profession || "Role"}
            </span>
          </div>
        ))}
        {!team.length && <div className="text-muted">No team members yet.</div>}
      </div>
    </div>
  );
}
