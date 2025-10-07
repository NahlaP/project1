// pages/editor/index.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getUserId } from "../../lib/api";
import { SectionsApi } from "../../lib/sectionsApi";
import { api } from "../../lib/api";

export default function EditorEntry() {
  const router = useRouter();
  const [status, setStatus] = useState("Resolving editor…");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!router.isReady) return;

    (async () => {
      try {
        // 1) Which template should we open?
        const userId = getUserId();
        const urlTemplateId =
          typeof router.query.templateId === "string" ? router.query.templateId : null;

        let tId = urlTemplateId;
        if (!tId) {
          const sel = await api.selectedTemplateForUser(userId);
          tId = sel?.data?.templateId || null;
        }
        if (!tId) {
          setError("No template selected yet.");
          return;
        }

        setStatus("Fetching home page…");

        // 2) Find the HOME page for this template
        const list = await SectionsApi.list(userId, tId, { type: "page", slug: "home" });
        const rows = Array.isArray(list?.data) ? list.data : [];
        const home = rows.find(
          (r) =>
            r?.type === "page" &&
            ((r.slug || "").toLowerCase() === "home" ||
              (r.title || "").toLowerCase() === "home")
        );

        if (!home?._id) {
          setError("Home page not found yet for this template.");
          return;
        }

        // 3) Redirect into your section editor page
        router.replace(
          `/editorpages/page/${home._id}?templateId=${encodeURIComponent(tId)}`
        );
      } catch (e) {
        setError(e?.message || "Failed to open editor.");
      }
    })();
  }, [router.isReady]);

  if (error) {
    return (
      <div style={{ padding: "6rem 1rem", textAlign: "center" }}>
        <h4>⚠️ {error}</h4>
        <p>
          Go back to the <a href="/dashboard">Dashboard</a>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "6rem 1rem", textAlign: "center" }}>
      <div className="text-muted">{status}</div>
    </div>
  );
}
