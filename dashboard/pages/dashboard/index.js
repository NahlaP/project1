
import {
  Container, Row, Col, Card, Button, Badge, ProgressBar
} from 'react-bootstrap';
import Link from "next/link"; 
import {
  FaPlusCircle, FaPaintBrush, FaChartLine, FaUserCircle, FaBell
} from 'react-icons/fa';
import { FaLock, FaInfoCircle } from 'react-icons/fa';

export default function DashboardHome() {
  return (
    <Container fluid className="mt-6 px-4">
      <h2 className="fw-bold">Dashboard</h2>
      <p className="text-muted mb-4">Welcome back! Here's what's happening with your website.</p>

      <Row className="g-4">
        {/* Left Side */}
        <Col md={8}>
          <Row className="g-4">
            {/* Subscription Card */}
            <Col md={6}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Subscription</span>
                    <Badge bg="success">Active</Badge>
                  </div>
                  <h5 className="fw-bold">
                    Pro Plan <Badge bg="light text-dark">CURRENT</Badge>
                  </h5>
                  <p className="fs-4 fw-bold text-dark">
                    $49 <span className="fs-6 fw-normal text-muted">/month</span>
                  </p>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-muted small">Next billing</span>
                    <span className="text-muted small">15 days left</span>
                  </div>
                  <ProgressBar now={70} className="mb-2" />
                  <p className="text-muted small mb-3">November 15, 2023 – $49.00</p>
                  <div className="d-flex gap-2">
                    <Button variant="primary" size="sm">Upgrade Plan</Button>
                    <Button variant="outline-secondary" size="sm">Change Payment</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Domain Card */}
            <Col md={6}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">My Domain</span>
                    <Badge bg="success">Active</Badge>
                  </div>
                  <p className="fw-semibold mb-2 text-success d-flex align-items-center">
                    <FaLock className="me-2 text-success" size={14} /> sarah.ion7cms.com
                  </p>
                  <Card className="mb-3 bg-light p-2 small border-0">
                    <span className="text-muted">
                      <FaInfoCircle className="text-primary me-2" style={{ fontSize: '16px' }} />
                      Want a custom domain? <br />
                      <small><strong className="text-primary p-5">Connect your own domain like yoursite.com</strong></small>
                    </span>
                  </Card>
                  <Button variant="primary" size="sm" className="w-100 fw-semibold">
                    Customize Domain
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            {/* Website Card */}
            <Col md={12}>
              <Card className="shadow-sm">
                <Card.Body className="d-flex align-items-center">
                  <img
                    src="/images/sample-thumbnail.jpg"
                    className="rounded border me-3"
                    alt="Website Thumbnail"
                    style={{ width: '150px', height: 'auto' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h6 className="text-muted">My Website</h6>
                    <div className="d-flex align-items-center mb-2">
                      <div className="px-3 py-1 bg-light border rounded me-2">
                        <strong>Sarah’s Portfolio</strong>
                      </div>
                      <Badge bg="success">Published</Badge>
                    </div>
                    <p className="text-muted small mb-1">Last updated: 2 hours ago</p>
                    <p className="text-muted small mb-3">Visitors this month: 1,247</p>
                    <div className="d-flex gap-2">
        {/* <Button as={Link} href="/editorpages" variant="primary" size="sm">
  Edit My Website
</Button>         */}
<Button as={Link} href="/editorpages/homepage" variant="primary" size="sm">
  Edit My Website
</Button>

<Button variant="outline-secondary" size="sm">Preview Site</Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Action Cards */}
            <Col md={4}>
              <Card className="h-100 shadow-sm text-center p-3">
                <Card.Body>
                  <FaPlusCircle size={24} className="mb-2 text-primary" />
                  <h6 className="fw-semibold">Add Content</h6>
                  <p className="text-muted small">Create new pages or posts</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 shadow-sm text-center p-3">
                <Card.Body>
                  <FaPaintBrush size={24} className="mb-2 text-info" />
                  <h6 className="fw-semibold">Customize Design</h6>
                  <p className="text-muted small">Change themes and styles</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 shadow-sm text-center p-3">
                <Card.Body>
                  <FaChartLine size={24} className="mb-2 text-success" />
                  <h6 className="fw-semibold">View Analytics</h6>
                  <p className="text-muted small">Track your site performance</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Setup Guide - Always Visible */}
        <Col md={4}>
          <div
            className="position-fixed"
            style={{
              top: '0',
              bottom: '0',
              right: '0',
              width: '320px',
              paddingTop: '1rem',
              paddingBottom: '1rem',
              overflowY: 'auto',
              zIndex: 1020,
              backgroundColor: '#fff',
              borderLeft: '1px solid #eee'
            }}
          >
            <div className="d-flex justify-content-end gap-3 px-3 mb-2">
              <FaBell size={18} className="text-muted" />
              <FaUserCircle size={22} className="text-muted" />
            </div>

            <Card className="shadow-sm border-0">
              <Card.Body>
                <h5 className="fw-bold mb-3">⚙️ Setup Guide</h5>
                <p className="text-muted small mb-4">
                  Complete these steps to get the most out of ION7
                </p>

                <div className="mb-3 d-flex align-items-start bg-light p-3 rounded border border-success border-2">
                  <span className="me-3 fs-5 text-success">✅</span>
                  <div>
                    <strong>Create your website</strong><br />
                    <span className="text-muted small">Choose a template and customize it</span>
                  </div>
                </div>

                <div className="mb-3 d-flex align-items-start">
                  <Badge bg="primary" className="me-3">2</Badge>
                  <div>
                    <strong>Add your content</strong><br />
                    <span className="text-muted small">Upload images and write your first post</span>
                  </div>
                </div>

                <div className="mb-3 d-flex align-items-start">
                  <Badge bg="secondary" className="me-3">3</Badge>
                  <div>
                    <strong>Connect a custom domain</strong><br />
                    <span className="text-muted small">Use your own URL</span>
                  </div>
                </div>

                <div className="mb-4 d-flex align-items-start">
                  <Badge bg="secondary" className="me-3">4</Badge>
                  <div>
                    <strong>Set up analytics</strong><br />
                    <span className="text-muted small">Track your visitors</span>
                  </div>
                </div>

                <div className="mb-0">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <p className="text-muted small mb-0">Progress</p>
                    <span className="text-dark small fw-semibold">1 of 4 complete</span>
                  </div>
                  <ProgressBar now={25} />
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
