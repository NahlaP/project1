
<<<<<<< HEAD
=======



>>>>>>> origin/design-work
// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\why-chooseE.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { backendBaseUrl } from "../../lib/config";
import { useIonContext } from "../../lib/useIonContext";

/* --------------------------- per-template defaults --------------------------- */
const TEMPLATE_PROFILES = {
  "sir-template-1": {
    whychoose: {
      defaults: {
        description: "We bring experience, speed, and a results-first mindset.",
        stats: [
          { label: "Happy Clients", value: 120 },
          { label: "Projects Done", value: 240 },
        ],
        progressBars: [
          { label: "Design", percent: 90 },
          { label: "Development", percent: 85 },
          { label: "Branding", percent: 80 },
        ],
        bgOverlay: 0.5,
        bgImageKey: "",
        bgImageUrl: "",
      },
    },
  },
  "gym-template-1": {
    whychoose: {
      defaults: {
        description: "Certified coaches. Measurable progress. Community that pushes you.",
        stats: [
          { label: "Clients", value: 300 },
          { label: "Transformations", value: 180 },
        ],
        progressBars: [
          { label: "Strength", percent: 92 },
          { label: "Mobility", percent: 78 },
          { label: "Endurance", percent: 88 },
        ],
        bgOverlay: 0.45,
        bgImageKey: "",
        bgImageUrl: "",
      },
    },
  },
};

const getDefaults = (templateId) =>
  TEMPLATE_PROFILES?.[templateId]?.whychoose?.defaults || {};

/* --------------------------------- helpers --------------------------------- */
const isHttp = (s) => /^https?:\/\//i.test(String(s || ""));
const clamp = (n, lo, hi) => {
  const x = Number.isFinite(+n) ? +n : lo;
  return Math.min(hi, Math.max(lo, x));
};
const isPresigned = (url) =>
  /\bX-Amz-(Signature|Algorithm|Credential|Date|Expires|SignedHeaders)=/i.test(String(url));
const bust = (url) => (!url || isPresigned(url) ? url : `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`);

async function presignKey(key) {
  if (!key) return "";
  try {
    const r = await fetch(
      `${backendBaseUrl}/api/upload/file-url?key=${encodeURIComponent(key)}`
    );
    const j = await r.json().catch(() => ({}));
    return j?.url || j?.signedUrl || "";
  } catch {
    return "";
  }
}

async function readJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/* ---------------------------------- view ----------------------------------- */
export default function WhyChooseEditorPreview() {
  // 🔗 same source of truth as Hero
  const { userId, templateId } = useIonContext();

  const defaults = useMemo(() => getDefaults(templateId), [templateId]);

  const [doc, setDoc] = useState({
    description: "",
    stats: [],
    progressBars: [],
<<<<<<< HEAD
    bgImageUrl: "",
=======
    bgImageUrl: "", 
>>>>>>> origin/design-work
    bgImageKey: "",
    bgOverlay: 0.5,
  });
  const [displayUrl, setDisplayUrl] = useState("");

  const computeDisplayUrl = useMemo(
    () => async (data) => {
      const full = data?.bgImageUrl;
      if (isHttp(full)) return bust(full);
      const key = data?.bgImageKey || (full && !isHttp(full) ? String(full) : "");
      if (key) {
        const url = await presignKey(key);
        return bust(url || "");
      }
      return "";
    },
    []
  );

  useEffect(() => {
    if (!userId || !templateId) return;

    (async () => {
      try {
        // GET from server (busted)
        const res = await fetch(
          `${backendBaseUrl}/api/whychoose/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}?_=${Date.now()}`,
          { headers: { Accept: "application/json" }, cache: "no-store", credentials: "include" }
        );

        const server = (await readJsonSafe(res)) || {};

        // Merge: defaults FIRST → server values overwrite → clamp/sanitize
        const merged = {
          ...defaults,
          ...server,
          bgOverlay: clamp((server?.bgOverlay ?? defaults.bgOverlay ?? 0.5), 0, 1),
          stats: Array.isArray(server?.stats) ? server.stats : (defaults.stats || []),
          progressBars: Array.isArray(server?.progressBars) ? server.progressBars : (defaults.progressBars || []),
        };

        setDoc({
          description: merged.description || "",
          stats: merged.stats,
          progressBars: merged.progressBars,
          bgImageUrl: merged.bgImageUrl || "",
          bgImageKey: merged.bgImageKey || "",
          bgOverlay: clamp(merged.bgOverlay ?? 0.5, 0, 1),
        });

        setDisplayUrl(await computeDisplayUrl(merged));
      } catch (e) {
        // fallback to defaults only
        setDoc({
          description: defaults.description || "",
          stats: defaults.stats || [],
          progressBars: defaults.progressBars || [],
          bgImageUrl: defaults.bgImageUrl || "",
          bgImageKey: defaults.bgImageKey || "",
          bgOverlay: clamp(defaults.bgOverlay ?? 0.5, 0, 1),
        });
        setDisplayUrl(await computeDisplayUrl(defaults));
      }
    })();
  }, [userId, templateId, defaults, computeDisplayUrl]);

  // compact preview slices (same visuals)
  const stats = (doc.stats || []).slice(0, 2);
  const bar = (doc.progressBars || [])[0];

  return (
    <div
      className="d-flex w-100"
      style={{
        width: "896px",
        height: "290px",
        borderRadius: "20px",
        overflow: "hidden",
        backgroundImage: displayUrl ? `url(${displayUrl})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        color: "#fff",
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `rgba(0, 0, 0, ${clamp(doc.bgOverlay ?? 0.5, 0, 1)})`,
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        className="d-flex flex-column justify-content-center px-4 py-3"
        style={{ position: "relative", zIndex: 2, width: "100%", height: "127%" }}
      >
        <h4 className="fw-bold mb-2 text-uppercase" style={{ fontSize: "1.25rem" }}>
          Why You Should Choose Our Services
        </h4>

        <p className="mb-2" style={{ fontSize: "0.95rem" }}>
          {doc.description || "Add a compelling reason here."}
        </p>

        {/* Stats */}
        <div className="d-flex gap-4 mb-3 flex-wrap">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <h5 className="fw-bold mb-0">{s?.value ?? 0}</h5>
              <small>{s?.label || "Stat"}</small>
            </div>
          ))}
          {!stats.length && (
            <small className="text-white-50">No stats configured yet.</small>
          )}
        </div>

        {/* Progress Bar */}
        {bar ? (
          <div className="mb-2">
            <div className="d-flex justify-content-between small">
              <span>{bar.label || "Progress"}</span>
              <span>{clamp(bar.percent ?? 0, 0, 100)}%</span>
            </div>
            <div className="progress" style={{ height: "6px" }}>
              <div
                className="progress-bar bg-warning"
                style={{ width: `${clamp(bar.percent ?? 0, 0, 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <small className="text-white-50">No progress bars yet.</small>
        )}
      </div>
    </div>
  );
}
