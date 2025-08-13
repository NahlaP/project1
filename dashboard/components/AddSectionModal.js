
import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function AddSectionModal({ show, onHide, onSubmit }) {
  const [type, setType] = useState('about');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !type) return;
    onSubmit({ type, title, slug });
    setTitle('');
    setSlug('');
    setType('about');
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Section</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter section title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Type</Form.Label>
            <Form.Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="about">About</option>
              <option value="services">Services</option>
              <option value="hero">Hero</option>
              <option value="appointment">Appointment</option>
              <option value="team">Team</option>
              <option value="testimonial">Testimonial</option>
              <option value="contact">Contact</option>
              <option value="why-choose">Why Choose</option>
              <option value="page">New Page</option>
            </Form.Select>
          </Form.Group>

          {type === 'page' && (
            <Form.Group>
              <Form.Label>Page Slug (e.g. offers)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Slug (no spaces or special characters)"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
            </Form.Group>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Add Section
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default AddSectionModal;
