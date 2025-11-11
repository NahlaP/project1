import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api, getUserId } from "./api";

// Single source of truth for userId + templateId
export function useIonContext() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [templateId, setTemplateId] = useState("");

  useEffect(() => {
    setUserId(getUserId() || null);
  }, []);

  useEffect(() => {
    let off = false;
    (async () => {
      // 1) URL wins
      const fromUrl = typeof router.query.templateId === "string" && router.query.templateId.trim();
      if (fromUrl) { if (!off) setTemplateId(fromUrl.trim()); return; }

      // 2) Backend selection for the *logged-in* user
      try {
        const uid = getUserId();
        if (uid) {
          const sel = await api.selectedTemplateForUser(uid);
          const t = sel?.data?.templateId || sel?.templateId;
          if (t && !off) { setTemplateId(t); return; }
        }
      } catch {/* ignore */}

      // 3) Do NOT fall back to gym; leave empty until resolved
      if (!off) setTemplateId(""); 
    })();
    return () => { off = true; };
  }, [router.query.templateId]);

  return { userId, templateId };
}
