


// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\blogE.js
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  backendBaseUrl,
  userId as defaultUserId,
  templateId as defaultTemplateId,
} from "../../lib/config";
import { api } from "../../lib/api";

/* ---------------- Template resolver ---------------- */
function useResolvedTemplateId(userId) {
  const [tpl, setTpl] = useState("");
  useEffect(() => {
    let off = false;
    (async () => {
      // 1) URL ?templateId=
      const sp =
        typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
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
      if (!off) setTpl(defaultTemplateId || "sir-template-1");
    })();
    return () => {
      off = true;
    };
  }, [userId]);
  return tpl;
}

/* ---------------- Blog Preview ---------------- */
export default function BlogPagePreview() {
  const userId = defaultUserId;
  const templateId = useResolvedTemplateId(userId);

  const [blogDoc, setBlogDoc] = useState({ items: [] });

  useEffect(() => {
    if (!templateId) return;
    (async () => {
      try {
        const res = await fetch(
          `${backendBaseUrl}/api/blogs/${encodeURIComponent(userId)}/${encodeURIComponent(
            templateId
          )}`
        );
        const doc = (await res.json()) || { items: [] };
        setBlogDoc(doc);
      } catch (e) {
        console.error("❌ Failed to fetch blogs", e);
        setBlogDoc({ items: [] });
      }
    })();
  }, [userId, templateId]);

  // Only show 2 posts in compact preview
  const posts = useMemo(
    () => (blogDoc.items || []).slice(0, 2),
    [blogDoc.items]
  );

  return (
    <div
      className="d-flex w-100 bg-white shadow-sm"
      style={{
        width: "896px",
        height: "290px",
        borderRadius: "20px",
        overflow: "hidden",
        padding: "20px",
      }}
    >
      {/* Left: Blog Grid */}
      <div
        className="d-flex flex-wrap gap-3"
        style={{ width: "70%", height: "100%", overflowY: "auto" }}
      >
        {posts.map((post, idx) => (
          <div
            key={post._id || idx}
            className="border rounded p-2 d-flex flex-column"
            style={{
              width: "calc(50% - 10px)",
              height: "100%",
              backgroundColor: "#f8f9fa",
            }}
          >
            <h6 className="fw-bold mb-1">{post.title || "Blog Title"}</h6>
            <p
              className="small mb-1 text-muted"
              style={{
                lineHeight: 1.3,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {post.excerpt || "Blog excerpt goes here…"}
            </p>
            <a
              href={post.href || "#"}
              className="btn btn-outline-primary btn-sm mt-auto"
              target="_blank"
              rel="noreferrer"
            >
              Read More
            </a>
          </div>
        ))}

        {/* Balance the grid if < 2 posts */}
        {posts.length === 1 && (
          <div
            className="border rounded p-2 d-flex flex-column"
            style={{
              width: "calc(50% - 10px)",
              height: "100%",
              backgroundColor: "#f8f9fa",
              visibility: "hidden",
            }}
          />
        )}
      </div>

      {/* Right: placeholder column for symmetry */}
      <div
        className="d-flex align-items-end justify-content-end flex-column ps-3"
        style={{ width: "30%" }}
      />
    </div>
  );
}
