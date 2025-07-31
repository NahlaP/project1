"use client";

import { useEffect, useState } from "react";
import { Button, Container } from "react-bootstrap";
import { useRouter } from "next/router";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";

const backendBaseUrl = "http://localhost:5000";
const userId = "demo-user";
const templateId = "gym-template-1";

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
    const fetchWhyChoose = async () => {
      const res = await fetch(
        `${backendBaseUrl}/api/whychoose/${userId}/${templateId}`
      );
      const data = await res.json();
      setWhychoose(data || {});
    };

    fetchWhyChoose();
  }, []);

  return (
    <Container fluid className="p-4 bg-light">
      <section
        className="rounded shadow-sm mb-5 p-5 text-white"
        style={{
          backgroundImage: whychoose.bgImageUrl
            ? `url(${backendBaseUrl}${whychoose.bgImageUrl})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(0, 0, 0, ${whychoose.bgOverlay ?? 0.5})`,
            zIndex: 1,
          }}
        />
        <div style={{ position: "relative", zIndex: 2 }}>
          <h3 className="fw-bold mb-3 text-uppercase">
            Why You Should Choose Our Services
          </h3>
          <p>{whychoose.description || "Add a compelling reason here."}</p>

          <div className="row text-center mb-4">
            {(whychoose.stats || []).map((s, i) => (
              <div key={i} className="col-md-3 col-6 mb-3">
                <div className="border border-light p-3">
                  <h4 className="fw-bold">{s.value}</h4>
                  <div className="text-uppercase small">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-top border-light pt-4">
            {(whychoose.progressBars || []).map((bar, i) => (
              <div key={i} className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>{bar.label}</span>
                  <span>{bar.percent}%</span>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar bg-primary"
                    role="progressbar"
                    style={{ width: `${bar.percent}%` }}
                    aria-valuenow={bar.percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Button
              variant="light"
              onClick={() => router.push("/editorpages/why-chooseS")}
            >
              ✏️ Edit Why Choose Us Section
            </Button>
          </div>
        </div>
      </section>
    </Container>
  );
}

WhyChooseEditorPage.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);
