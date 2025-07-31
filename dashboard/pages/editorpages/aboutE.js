import { useEffect, useState } from "react";
import { Button, Container } from "react-bootstrap";
import { useRouter } from "next/router";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";

const backendBaseUrl = "http://localhost:5000";
const userId = "demo-user";
const templateId = "gym-template-1";

export default function AboutPagePreview() {
  const router = useRouter();

  const [about, setAbout] = useState({
    title: "",
    description: "",
    highlight: "",
    bullets: [],
    imageUrl: "",
  });

  useEffect(() => {
    const fetchAbout = async () => {
      const res = await fetch(`${backendBaseUrl}/api/about/${userId}/${templateId}`);
      const data = await res.json();
      setAbout(data || {});
    };

    fetchAbout();
  }, []);

  return (
    <Container fluid className="p-4 bg-light">
      {/* ABOUT */}
      <section className="bg-white rounded p-4 shadow-sm mb-5">
        <h3 className="fw-bold">About Section</h3>
        <div className="row">
          <div className="col-md-6">
            {about.imageUrl && (
              <img
                src={`${backendBaseUrl}${about.imageUrl}`}
                alt="About"
                className="img-fluid mb-3 rounded"
                style={{ maxHeight: "350px", objectFit: "cover" }}
              />
            )}
          </div>
          <div className="col-md-6">
            <h4>{about.title}</h4>
            <p>{about.description}</p>
            <div className="border p-3 mb-2">
              <strong>{about.highlight}</strong>
            </div>
            <ul>
              {(about.bullets || []).map((b) => (
                <li key={b._id || b.text}>{b.text}</li>
              ))}
            </ul>
            <Button variant="primary" onClick={() => router.push("/editorpages/aboutS")}>✏️ Edit About Section</Button>
          </div>
        </div>
      </section>
    </Container>
  );
}

AboutPagePreview.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
