


import { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Spinner, Form, ButtonGroup } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';
import EditorDashboardLayout from '../layouts/EditorDashboardLayout';
import { SectionsApi } from '../../lib/sectionsApi';
import AddSectionModal from '../../components/AddSectionModal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import Link from 'next/link';

const USER_ID = 'demo-user';
const TEMPLATE_ID = 'gym-template-1';

function reorder(list, startIndex, endIndex) {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

function SectionsManager() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const { data } = await SectionsApi.list(USER_ID, TEMPLATE_ID);
      setSections(data.sort((a, b) => a.order - b.order));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

 const onDragEnd = (result) => {
  if (!result.destination) return;

  const from = result.source.index;
  const to = result.destination.index;

  // Map filtered indexes back to real indexes in full sections array
  const sourceId = filteredSections[from]._id;
  const targetId = filteredSections[to]._id;

  const realFrom = sections.findIndex((s) => s._id === sourceId);
  const realTo = sections.findIndex((s) => s._id === targetId);

  const reordered = reorder(sections, realFrom, realTo);
  setSections(reordered);
};


  const persistOrder = async () => {
    setSavingOrder(true);
    try {
      const updates = sections.map((s, i) => ({ _id: s._id, order: i }));
      await SectionsApi.reorder(USER_ID, TEMPLATE_ID, updates);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingOrder(false);
      fetchSections();
    }
  };

  const handleAddSection = async ({ type, title }) => {
    try {
      const cleanSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const { data: created } = await SectionsApi.create(USER_ID, TEMPLATE_ID, {
        type,
        title,
        ...(type === 'page' ? { slug: cleanSlug } : {})
      });

      if (type === 'page') {
        await axios.post('http://localhost:5000/api/pages/generate', {
          title: created.title,
          slug: created.slug || cleanSlug,
        });
      }

      setShowAdd(false);
      fetchSections();
    } catch (err) {
      console.error('Error creating section:', err);
    }
  };

  const handleToggleVisible = async (section) => {
    try {
      await SectionsApi.patch(section._id, { visible: !section.visible });
      setSections((prev) =>
        prev.map((s) => (s._id === section._id ? { ...s, visible: !s.visible } : s))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await SectionsApi.remove(deleteTarget._id);
      setDeleteTarget(null);
      fetchSections();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredSections = sections.filter((s) => {
    if (filter === 'page') return s.type === 'page';
    if (filter === 'section') return s.type !== 'page';
    return true;
  });

  return (
    <>
      <Row className="mb-3 align-items-center">
        <Col><h3>Sections Manager</h3></Col>
        <Col className="text-end">
          <ButtonGroup className="me-2">
            <Button variant={filter === 'all' ? 'dark' : 'outline-secondary'} onClick={() => setFilter('all')}>All</Button>
            <Button variant={filter === 'page' ? 'dark' : 'outline-secondary'} onClick={() => setFilter('page')}>Pages</Button>
            <Button variant={filter === 'section' ? 'dark' : 'outline-secondary'} onClick={() => setFilter('section')}>Sections</Button>
          </ButtonGroup>
          <Button variant="success" className="me-2" onClick={() => setShowAdd(true)}>+ Add</Button>
          <Button variant="primary" onClick={persistOrder} disabled={savingOrder}>
            {savingOrder ? 'Saving…' : 'Save Order'}
          </Button>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="sections-droppable">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {filteredSections.map((section, index) => (
                  <Draggable draggableId={section._id} index={index} key={section._id}>
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="mb-2">
                        <Card className={`${snapshot.isDragging ? 'border-primary' : ''} ${section.parentPageId ? 'ms-3 border-start border-warning border-3' : ''}`}>
                          <Card.Body className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{section.title}</strong> <small className="text-muted">({section.type})</small>
                            </div>
                            <div className="d-flex gap-2">
                              <Form.Check
                                type="switch"
                                label={section.visible ? 'Visible' : 'Hidden'}
                                checked={section.visible}
                                onChange={() => handleToggleVisible(section)}
                              />
                              <Link href={`/editorpages/${section.type === 'page' ? 'page' : 'sections'}/${section._id}`} passHref>
                                <Button size="sm" variant="outline-primary">Edit</Button>
                              </Link>
                              <Button size="sm" variant="outline-danger" onClick={() => setDeleteTarget(section)}>Delete</Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <AddSectionModal show={showAdd} onHide={() => setShowAdd(false)} onSubmit={handleAddSection} />
      <ConfirmDeleteModal show={!!deleteTarget} onHide={() => setDeleteTarget(null)} onConfirm={handleDelete} title={deleteTarget?.title} />
    </>
  );
}

SectionsManager.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;

export default SectionsManager;


