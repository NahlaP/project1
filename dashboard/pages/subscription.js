// pages/subscription.js
import { Container, Row, Col, Card, Badge, Button, Table } from 'react-bootstrap';
import { FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

export default function SubscriptionPage() {
  return (
    <Container fluid className="px-6 mt-4">
      <Row>
        <Col md={12}>
          <h4 className="fw-bold mb-3">Subscription</h4>
          <p className="text-muted">Manage your ION7 subscription plan</p>
        </Col>

        {/* Main Subscription Info */}
        <Col md={12}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h6 className="text-muted">Current Plan</h6>
                  <h5 className="fw-bold">Pro <Badge bg="info">RECOMMENDED</Badge></h5>
                  <h2 className="fw-bold">$49 <span className="fs-6 fw-normal text-muted">/month</span></h2>
                  <p className="text-muted small">Billed monthly</p>

                  <div className="d-flex gap-2 mt-3">
                    <Button variant="primary" size="sm">Upgrade Plan</Button>
                    <Button variant="outline-secondary" size="sm">Change Billing Method</Button>
                  </div>
                </div>

                <div className="text-end">
                  <Badge bg="success" className="mb-2">Active</Badge>
                  <Card className="bg-light p-3 small border-0">
                    <div className="text-muted">Next payment</div>
                    <div className="fw-semibold">November 15, 2023</div>
                    <div className="text-muted">15 days remaining</div>
                  </Card>
                </div>
              </div>

              {/* Plan Features */}
              <hr />
              <h6 className="fw-bold mb-3">Plan Features</h6>
              <Row>
                <Col md={4}><p><FaCheckCircle className="text-success me-2" /> Unlimited Projects</p></Col>
                <Col md={4}><p><FaCheckCircle className="text-success me-2" /> 10 Team Members</p></Col>
                <Col md={4}><p><FaCheckCircle className="text-success me-2" /> Custom Domains</p></Col>
                <Col md={4}><p><FaCheckCircle className="text-success me-2" /> 50GB Storage</p></Col>
                <Col md={4}><p><FaCheckCircle className="text-success me-2" /> Priority Support</p></Col>
                <Col md={4}><p><FaCheckCircle className="text-success me-2" /> Advanced Analytics</p></Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Compare Plans */}
        <Col md={12}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h6 className="fw-bold mb-3">Compare Plans</h6>
              <Table striped bordered responsive className="mb-0">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Starter</th>
                    <th>Pro</th>
                    <th>Business</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Price</td><td>$19/mo</td><td>$49/mo</td><td>$99/mo</td></tr>
                  <tr><td>Projects</td><td>3</td><td>Unlimited</td><td>Unlimited</td></tr>
                  <tr><td>Storage</td><td>10GB</td><td>50GB</td><td>500GB</td></tr>
                  <tr><td>Team Members</td><td>3</td><td>10</td><td>Unlimited</td></tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Billing History */}
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Body>
              <h6 className="fw-bold mb-3">Billing History</h6>
              <Table striped bordered responsive>
                <thead>
                  <tr><th>Date</th><th>Amount</th><th>Status</th><th>Invoice</th></tr>
                </thead>
                <tbody>
                  <tr><td>October 15, 2023</td><td>$49.00</td><td><Badge bg="success">Paid</Badge></td><td>📄</td></tr>
                  <tr><td>September 15, 2023</td><td>$49.00</td><td><Badge bg="success">Paid</Badge></td><td>📄</td></tr>
                  <tr><td>August 15, 2023</td><td>$49.00</td><td><Badge bg="success">Paid</Badge></td><td>📄</td></tr>
                </tbody>
              </Table>
              <p className="text-danger mt-3">Cancel Subscription</p>
              <p className="text-muted small">Need help with your subscription? <a href="#">Contact Support</a></p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
// import { Container, Row, Col, Card, Badge, Button, Table } from "react-bootstrap";
// import { FaCheckCircle } from "react-icons/fa";
// import NavbarSubscription from "../layouts/navbars/NavbarSubscription";

// export default function SubscriptionPage() {
//   return (
//     <>
      
//     <Container className="mt-5 px-4">
    

//       {/* Current Plan and Billing */}
//       <Row className="mb-4">
//         <Col md={8}>
//           <Card className="shadow-sm h-100">
//             <Card.Body>
//               <h6 className="text-muted">Current Plan</h6>
//               <h3>Pro <Badge bg="light" className="text-dark ms-2">RECOMMENDED</Badge></h3>
//               <h2 className="fw-bold">$49 <span className="fs-6 fw-normal text-muted">/month</span></h2>
//               <p className="text-muted">Billed monthly</p>
//               <div className="d-flex gap-2">
//                 <Button variant="primary">Upgrade Plan</Button>
//                 <Button variant="outline-secondary">Change Billing Method</Button>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={4}>
//           <Card className="shadow-sm h-100">
//             <Card.Body>
//               <h6 className="text-muted">Next payment</h6>
//               <h5 className="mb-1">November 15, 2023</h5>
//               <p className="text-muted mb-0">15 days remaining</p>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* Plan Features */}
//       <Card className="mb-4 shadow-sm">
//         <Card.Body>
//           <h5 className="fw-bold mb-3">Plan Features</h5>
//           <Row>
//             {["Unlimited Projects", "10 Team Members", "Custom Domains",
//               "50GB Storage", "Priority Support", "Advanced Analytics"].map((feature, i) => (
//               <Col md={4} key={i} className="mb-2 d-flex align-items-center">
//                 <FaCheckCircle className="text-success me-2" />
//                 {feature}
//               </Col>
//             ))}
//           </Row>
//         </Card.Body>
//       </Card>

//       {/* Compare Plans */}
//       <Card className="mb-4 shadow-sm">
//         <Card.Body>
//           <h5 className="fw-bold mb-3">Compare Plans</h5>
//           <Table bordered>
//             <thead>
//               <tr>
//                 <th>Plan</th>
//                 <th>Starter</th>
//                 <th className="bg-light">Pro</th>
//                 <th>Business</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr><td>Price</td><td>$19/mo</td><td className="bg-light">$49/mo</td><td>$99/mo</td></tr>
//               <tr><td>Projects</td><td>3</td><td className="bg-light">Unlimited</td><td>Unlimited</td></tr>
//               <tr><td>Storage</td><td>10GB</td><td className="bg-light">50GB</td><td>500GB</td></tr>
//               <tr><td>Team Members</td><td>3</td><td className="bg-light">10</td><td>Unlimited</td></tr>
//             </tbody>
//           </Table>
//           <a href="#">View all plans →</a>
//         </Card.Body>
//       </Card>

//       {/* Billing History */}
//       <Card className="mb-4 shadow-sm">
//         <Card.Body>
//           <h5 className="fw-bold mb-3">Billing History</h5>
//           <Table responsive bordered>
//             <thead>
//               <tr>
//                 <th>Date</th><th>Amount</th><th>Status</th><th>Invoice</th>
//               </tr>
//             </thead>
//             <tbody>
//               {["October 15, 2023", "September 15, 2023", "August 15, 2023"].map((date, i) => (
//                 <tr key={i}>
//                   <td>{date}</td>
//                   <td>$49.00</td>
//                   <td><Badge bg="success">Paid</Badge></td>
//                   <td><a href="#">⬇️</a></td>
//                 </tr>
//               ))}
//             </tbody>
//           </Table>
//         </Card.Body>
//       </Card>

//       <div className="text-danger">Cancel Subscription</div>
//       <div className="text-muted mt-3">Need help with your subscription? <a href="#">Contact Support</a></div>
//     </Container>
//     </>
//   );
// }
