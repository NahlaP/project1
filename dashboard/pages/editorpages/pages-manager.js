



import { useEffect, useState } from "react";
import { Button, Container, Table, Spinner } from "react-bootstrap";
import { useRouter } from "next/router";
import { SectionsApi } from "../../lib/sectionsApi";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import { userId, templateId } from "../../lib/config";

export default function PagesManager() {
  const router = useRouter();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await SectionsApi.list(userId, templateId);
        setPages(data.filter((s) => s.type === "page"));
      } catch (err) {
        console.error("Failed to load pages", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id, title) => {
    if (title.toLowerCase().includes("home")) {
      alert("❌ Home page is permanent and cannot be deleted.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this page?")) return;
    try {
      await SectionsApi.remove(id);
      setPages(pages.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Failed to delete page", err);
      alert("❌ Failed to delete page");
    }
  };

  if (loading) {
    return (
      <div className="p-5 text-center">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Container className="p-4">
      <h3 className="fw-bold mb-4">🗂️ All Pages Manager</h3>
      <Table bordered hover>
        <thead>
          <tr>
            <th>Title</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((p) => (
            <tr key={p._id}>
              <td>{p.title}</td>
              <td>
                <Button
                  variant="outline-primary"
                  className="me-2"
                  onClick={() => router.push(`/editorpages/page/${p._id}`)}
                >
                  ✏️ Edit
                </Button>
                {!p.title.toLowerCase().includes("home") && (
                  <Button
                    variant="outline-danger"
                    onClick={() => handleDelete(p._id, p.title)}
                  >
                    🗑️ Delete
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

PagesManager.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);
