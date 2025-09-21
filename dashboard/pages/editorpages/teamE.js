




// "use client";

// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import { Button } from "react-bootstrap";
// import { backendBaseUrl, userId, templateId } from "../../lib/config";

// export default function TeamPreview() {
//   const router = useRouter();
//   const [team, setTeam] = useState([]);

//   useEffect(() => {
//     fetch(`${backendBaseUrl}/api/team/${userId}/${templateId}`)
//       .then((res) => res.json())
//       .then((data) => {
//         setTeam(Array.isArray(data) ? data : []);
//       });
//   }, []);

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
//           backgroundImage:
//             team[0]?.imageUrl
//               ? `url(${backendBaseUrl}${team[0].imageUrl})`
//               : "none",
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//         }}
//       >
//         {!team[0]?.imageUrl && (
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
//           <div key={idx} className="mb-2">
//             <strong>{member.name}</strong> –{" "}
//             <span className="text-muted">
//               {member.role || member.profession}
//             </span>
//           </div>
//         ))}

//         {/* <Button
//           size="sm"
//           variant="outline-dark"
//           onClick={() => router.push("/editorpages/teamS")}
//         >
//           ✏️ Edit Team
//         </Button> */}
//       </div>
//     </div>
//   );
// }







// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\teamE.js
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { backendBaseUrl, userId, templateId } from "../../lib/config";

export default function TeamPreview() {
  const router = useRouter();
  const [team, setTeam] = useState([]);

  // helper: presign any S3 key via backend
  const getSignedUrlFor = async (key) => {
    if (!key) return "";
    try {
      const res = await fetch(
        `${backendBaseUrl}/api/upload/file-url?key=${encodeURIComponent(key)}`
      );
      const json = await res.json().catch(() => ({}));
      return json?.url || json?.signedUrl || "";
    } catch {
      return "";
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${backendBaseUrl}/api/team/${userId}/${templateId}`,
          { headers: { Accept: "application/json" }, cache: "no-store" }
        );
        const arr = (await res.json()) || [];
        const safe = Array.isArray(arr) ? arr : [];

        // build displayUrl per member
        const withUrls = await Promise.all(
          safe.map(async (m) => {
            // if backend already gave a full URL, use it
            if (m.imageUrl && /^https?:\/\//i.test(m.imageUrl)) {
              return { ...m, displayUrl: m.imageUrl };
            }
            // otherwise, if we have a key (imageKey or non-http imageUrl), presign it
            const key =
              m.imageKey ||
              (m.imageUrl && !/^https?:\/\//i.test(m.imageUrl) ? m.imageUrl : "");
            if (key) {
              const url = await getSignedUrlFor(key);
              return { ...m, displayUrl: url || "" };
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
  }, []);

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
          height: "127%",
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
          <div key={idx} className="mb-2">
            <strong>{member.name}</strong> –{" "}
            <span className="text-muted">{member.role || member.profession}</span>
          </div>
        ))}

        {/* <Button
          size="sm"
          variant="outline-dark"
          onClick={() => router.push("/editorpages/teamS")}
        >
          ✏️ Edit Team
        </Button> */}
      </div>
    </div>
  );
}
