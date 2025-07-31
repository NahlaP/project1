
import { Modal, Button } from 'react-bootstrap';

function ConfirmDeleteModal({ show, onHide, onConfirm, title }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Delete Section</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete the section{' '}
        <strong>{title}</strong>? This cannot be undone.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Yes, Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmDeleteModal;
