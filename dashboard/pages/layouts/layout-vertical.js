
import Link from "next/link";
import { Col, Row, Container, Image } from "react-bootstrap";

const DashboardLayout = () => {
  return (
    <div className="bg-white min-vh-100 py-4">
      <Container fluid className="px-6">
        <Row>
          <Col xl={12}>
            <div className="text-center mb-7">
              <h1 className="display-4">ION7 Dashboard Layouts</h1>
              <p>Choose your preferred layout to get started with the ION7 CMS.</p>
            </div>
            <span className="divider fw-bold my-3">Available Layouts</span>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col lg={3} sm={6} className="my-4">
            <Link className="card" href="/dashboard/ion7">
              <Image
                className="card-img-top"
                src="/images/layouts/default-classic.svg"
                alt="Classic ION7 Layout"
              />
              <div className="card-body text-center">
                <h5 className="mb-0">Classic ION7</h5>
              </div>
            </Link>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DashboardLayout;
