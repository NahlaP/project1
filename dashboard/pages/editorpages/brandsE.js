


// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\brandsE.js
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { backendBaseUrl, userId as defaultUserId } from "../../lib/config";
import { api } from "../../lib/api";

const API = backendBaseUrl || "";

/* same resolver as your marquee preview */
function useResolvedTemplateId(userId) {
  const router = useRouter();
  const [tid, setTid] = useState("");
  useEffect(() => {
    let off = false;
    (async () => {
      const fromUrl =
        typeof router.query.templateId === "string" &&
        router.query.templateId.trim();
      if (fromUrl) { if (!off) setTid(fromUrl.trim()); return; }
      try {
        const sel = await api.selectedTemplateForUser(userId);
        const t = sel?.data?.templateId;
        if (t && !off) { setTid(t); return; }
      } catch {}
      if (!off) setTid("sir-template-1");
    })();
    return () => { off = true; };
  }, [router.query.templateId, userId]);
  return tid;
}

export default function BrandsPreview() {
  const router = useRouter();
  const userId = defaultUserId;
  const templateId = useResolvedTemplateId(userId);

  const apiUrl = useMemo(() => {
    if (!templateId) return "";
    return `${API}/api/brands/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
  }, [userId, templateId]);

  const [items, setItems] = useState([]);

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
        setItems(arr.map((x) => ({
          imageUrl: x.imageUrl || "",
          href: x.href || "#",
          alt: x.alt || ""
        })));
      } catch {
        setItems([]);
      }
    })();
  }, [apiUrl]);

  const goEdit = () => {
    const q = new URLSearchParams({ templateId: String(templateId || "") });
    router.push(`/editorpages/brandsS?${q}`);
  };

  const list = (items.length ? items : [
    { imageUrl:"/assets/imgs/brands/01.png", href:"#0", alt:"Brand" },
    { imageUrl:"/assets/imgs/brands/02.png", href:"#0", alt:"Brand" },
    { imageUrl:"/assets/imgs/brands/03.png", href:"#0", alt:"Brand" },
  ]);

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
      {/* Left: simple swiper-ish strip preview (UNCHANGED) */}
      <div className="d-flex align-items-center justify-content-center" style={{ width: "50%", height: "100%", background: "#111" }}>
        <div className="d-flex gap-4" style={{ overflow: "hidden" }}>
          {list.slice(0,5).map((it, i) => (
            <a key={i} href={it.href || "#"} target="_blank" rel="noreferrer" style={{ display:"block", width:90, height:90 }}>
              <img
                src={it.imageUrl}
                alt={it.alt || ""}
                style={{ width:"100%", height:"100%", objectFit:"contain", background:"#fff", borderRadius:12, padding:10 }}
              />
            </a>
          ))}
        </div>
      </div>

      {/* Right: simplified — removed the long link list */}
      <div
        className="d-flex flex-column justify-content-center px-4 py-3"
        style={{ width: "50%", height: "127%", overflowY: "auto" }}
      >
        <div className="text-muted mb-2" style={{ fontSize: "0.8rem" }}>
          Brands / Clients carousel
        </div>

        {/* Removed the UL of links to avoid overflowing long URLs */}
        {/* If you ever want a compact summary here, you can add tiny name pills instead. */}

        <div className="d-flex align-items-center gap-3 mt-2">
          {/* <Button size="sm" variant="outline-dark" onClick={goEdit}>✏️ Edit Brands</Button> */}
          <small className="text-muted">
            template: <code>{templateId || "…"}</code>
          </small>
        </div>
      </div>
    </div>
  );
}
