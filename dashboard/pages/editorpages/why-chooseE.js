


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "react-bootstrap";
import { backendBaseUrl, userId, templateId } from "../../lib/config";

export default function WhyChooseEditorPage() {
  const router = useRouter();

  const [whychoose, setWhychoose] = useState({
    description: "",
    stats: [],
    progressBars: [],
    bgImageUrl: "",
    bgOverlay: 0.5,
  });

  useEffect(() => {
    fetch(`${backendBaseUrl}/api/whychoose/${userId}/${templateId}`)
      .then((res) => res.json())
      .then((data) => setWhychoose(data || {}))
      .catch((err) => console.error("❌ Failed to fetch Why Choose section", err));
  }, []);

  return (
    <div
      className="d-flex w-100"
      style={{
        width: "896px",
        height: "290px",
        borderRadius: "20px",
        overflow: "hidden",
        backgroundImage: `url(${backendBaseUrl}${whychoose.bgImageUrl})`,
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
          background: `rgba(0, 0, 0, ${whychoose.bgOverlay ?? 0.5})`,
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        className="d-flex flex-column justify-content-center px-4 py-3"
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          height: "127%",
        }}
      >
        <h4 className="fw-bold mb-2 text-uppercase" style={{ fontSize: "1.25rem" }}>
          Why You Should Choose Our Services
        </h4>
        <p className="mb-2" style={{ fontSize: "0.95rem" }}>
          {whychoose.description || "Add a compelling reason here."}
        </p>

        {/* Stats */}
        <div className="d-flex gap-4 mb-3 flex-wrap">
          {(whychoose.stats || []).slice(0, 2).map((stat, i) => (
            <div key={i} className="text-center">
              <h5 className="fw-bold mb-0">{stat.value}</h5>
              <small>{stat.label}</small>
            </div>
          ))}
        </div>

        {/* Progress Bars */}
        {(whychoose.progressBars || []).slice(0, 1).map((bar, i) => (
          <div key={i} className="mb-2">
            <div className="d-flex justify-content-between small">
              <span>{bar.label}</span>
              <span>{bar.percent}%</span>
            </div>
            <div className="progress" style={{ height: "6px" }}>
              <div
                className="progress-bar bg-warning"
                style={{ width: `${bar.percent}%` }}
              />
            </div>
          </div>
        ))}

        {/* <Button
          size="sm"
          variant="light"
          className="mt-3"
          onClick={() => router.push("/editorpages/why-chooseS")}
        >
          ✏️ Edit Why Choose Us Section
        </Button> */}
      </div>
    </div>
  );
}



