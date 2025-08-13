

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import EditorDashboardLayout from '../../layouts/EditorDashboardLayout';
import { backendBaseUrl } from '../../../lib/config';

const SectionEditor = () => {
  const { id } = useRouter().query;
  const [section, setSection] = useState(null);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const res = await axios.get(`${backendBaseUrl}/api/sections/by-id/${id}`);
        setSection(res.data);
      } catch (err) {
        console.error('❌ Failed to load section', err);
      }
    })();
  }, [id]);

  if (!section) return <div className="p-4">Loading section...</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`${backendBaseUrl}/api/sections/${id}`, {
        title: section.title,
        type: section.type,
        content: section.content || {},
      });
      alert('✅ Section updated successfully');
    } catch (err) {
      alert('❌ Failed to update section');
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <h2>
        Edit Section: <span className="text-primary">{section.title}</span>
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            value={section.title || ''}
            onChange={(e) => setSection({ ...section, title: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Type</label>
          <input
            type="text"
            className="form-control"
            value={section.type || ''}
            onChange={(e) => setSection({ ...section, type: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows={4}
            value={section.content?.description || ''}
            onChange={(e) =>
              setSection({
                ...section,
                content: { ...section.content, description: e.target.value },
              })
            }
          />
        </div>

        <button type="submit" className="btn btn-success">
          💾 Save Section
        </button>
      </form>
    </div>
  );
};


SectionEditor.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;

export default SectionEditor;
