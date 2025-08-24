// pages/components/BackBar.js
"use client";

import { Button } from "react-bootstrap";
import { useRouter } from "next/router";

export default function BackBar({ fallback = "/editorpages/page/home", label = "Back" }) {
  const router = useRouter();
  const { pageId, returnTo } = router.query || {};

  const target =
    typeof returnTo === "string"
      ? returnTo
      : pageId
      ? `/editorpages/page/${pageId}`
      : fallback;

  return (
    <div className="d-flex align-items-center mb-3">
      <Button
        variant="outline-dark"
        size="sm"
        onClick={() => router.push(target)}
        className="rounded-pill px-3"
      >
        {label}
      </Button>
    </div>
  );
}
