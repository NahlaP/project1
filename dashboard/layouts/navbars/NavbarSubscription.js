import { Navbar, Container } from "react-bootstrap";

const NavbarSubscription = () => {
  return (
    <Navbar bg="white" className="shadow-sm border-bottom py-3">
      <Container fluid>
        <h4 className="mb-0 fw-bold">Subscription</h4>
        <p className="text-muted mb-0">Manage your ION7 subscription plan</p>
      </Container>
    </Navbar>
  );
};

export default NavbarSubscription;
