


// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\brandsE.js
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { backendBaseUrl, s3Bucket, s3Region } from "../../lib/config";
import { useIonContext } from "../../lib/useIonContext";

const API = backendBaseUrl || "";

/* -------------------- Template defaults (instant preview) -------------------- */
const TEMPLATE_DEFAULTS = {
  "sir-template-1": {
    items: [
      { imageUrl: "assets/imgs/brands/01.png", href: "#0", alt: "Brand 1" },
      { imageUrl: "assets/imgs/brands/02.png", href: "#0", alt: "Brand 2" },
      { imageUrl: "assets/imgs/brands/03.png", href: "#0", alt: "Brand 3" },
      { imageUrl: "assets/imgs/brands/04.png", href: "#0", alt: "Brand 4" },
      { imageUrl: "assets/imgs/brands/05.png", href: "#0", alt: "Brand 5" },
    ],
  },
};

const ABS_RX = /^https?:\/\//i;
const isAbs = (u) => typeof u === "string" && ABS_RX.test(u);
const toAbs = (u) => {
  if (!u) return "";
  if (isAbs(u)) return u;
  if (u.startsWith("/")) return u; // served from /public
  if (s3Bucket && s3Region) {
    return `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${String(u).replace(/^\/+/, "")}`;
  }
  return u;
};

export default function BrandsPreview() {
  const router = useRouter();
  // ✅ keep in sync with the rest of the editors (no local default user/template)
  const { userId, templateId } = useIonContext();

  const apiUrl = useMemo(() => {
    if (!userId || !templateId) return "";
    return `${API}/api/brands/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
  }, [userId, templateId]);

  const [items, setItems] = useState([]);

  /* 1) Instant defaults based on templateId (no flicker) */
  useEffect(() => {
    if (!templateId) return;
    const def = TEMPLATE_DEFAULTS["sir-template-1"]?.items || [];
    setItems(def.map((x) => ({ imageUrl: toAbs(x.imageUrl), href: x.href, alt: x.alt })));
  }, [templateId]);

  /* 2) Overlay server data if present */
  useEffect(() => {
    if (!apiUrl) return;
    (async () => {
      try {
        const res = await fetch(`${apiUrl}?_=${Date.now()}`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (!res.ok) throw new Error();
        const data = await res.json().catch(() => ({}));
        const arr = Array.isArray(data?.items) ? data.items : [];

        if (!arr.length) return; // keep defaults

        setItems((prev) =>
          arr.map((x, i) => {
            const img =
              x.imageUrl && ABS_RX.test(x.imageUrl)
                ? x.imageUrl
                : (x.imageUrl && toAbs(x.imageUrl)) || (x.imageKey && toAbs(x.imageKey)) || prev[i]?.imageUrl || "";
            return {
              imageUrl: img,
              href: x.href || "#0",
              alt: x.alt || prev[i]?.alt || "",
            };
          })
        );
      } catch {
        // leave defaults
      }
    })();
  }, [apiUrl]);

  const goEdit = () => {
    const q = new URLSearchParams({ templateId: String(templateId || "") });
    router.push(`/editorpages/brandsS?${q}`);
  };

  const list = items.length
    ? items
    : [
        { imageUrl: "/assets/imgs/brands/01.png", href: "#0", alt: "Brand" },
        { imageUrl: "/assets/imgs/brands/02.png", href: "#0", alt: "Brand" },
        { imageUrl: "/assets/imgs/brands/03.png", href: "#0", alt: "Brand" },
      ];

  return (
    <div
      className="d-flex w-100"
      style={{
        width: "896px",
        height: "290px",
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* Left: strip preview (logos) */}
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ width: "50%", height: "100%", background: "#111" }}
      >
        <div className="d-flex gap-4" style={{ overflow: "hidden" }}>
          {list.slice(0, 5).map((it, i) => (
            <a
              key={i}
              href={it.href || "#0"}
              target="_blank"
              rel="noreferrer"
              style={{ display: "block", width: 90, height: 90 }}
              title={it.alt || ""}
            >
              <img
                src={it.imageUrl}
                alt={it.alt || ""}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  background: "#fff",
                  borderRadius: 12,
                  padding: 10,
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </a>
          ))}
        </div>
      </div>

      {/* Right: meta + action */}
      <div
        className="d-flex flex-column justify-content-center px-4 py-3"
        style={{ width: "50%", height: "127%", overflowY: "auto" }}
      >
        <div className="text-muted mb-2" style={{ fontSize: "0.8rem" }}>
          Brands / Clients carousel
        </div>

        <div className="d-flex align-items-center gap-3 mt-2">
          {/* Keep button commented if you don’t want it visible in preview tile */}
          {/* <button className="btn btn-outline-dark btn-sm" onClick={goEdit}>✏️ Edit Brands</button> */}
          <small className="text-muted">
            template: <code>{templateId || "…"}</code>
          </small>
        </div>
      </div>
    </div>
  );
}
