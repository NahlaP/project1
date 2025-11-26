// dashboard/pages/settings/index.js
import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { useRouter } from "next/router";

import NavbarTop from "../../layouts/navbars/NavbarTop";
import SidebarDashly from "../../layouts/navbars/NavbarVertical";
import { api } from "../../lib/api";

const NAVBAR_H = 68;
const SIDEBAR_W = 260;

const SettingsPage = () => {
  const router = useRouter();

  // Sidebar state
  const [isOpen, setIsOpen] = useState(true);
  const [isCompact, setIsCompact] = useState(false);

  // Account details
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");

  // Change email
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [confirmNewEmail, setConfirmNewEmail] = useState("");
  const [changingEmail, setChangingEmail] = useState(false);

  // Change password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Toast
  const [toast, setToast] = useState({
    show: false,
    bg: "success",
    message: "",
  });

  const showToast = (message, bg = "success") => {
    setToast({ show: true, bg, message });
  };

  // Load current user details (for Account details widget)
  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        setLoadingProfile(true);

        const me = await api.me(); // backend: { user, next, meta, subscription }
        if (!mounted || !me) return;

        // Make it easy to debug:
        if (typeof window !== "undefined") {
          window.__ION7_SETTINGS_ME__ = me;
        }

        const u = me.user || me; // fallback if api.me() ever returns just user

        setFullName(u.fullName || u.name || "");
        setCompany(u.company || "");
        setCountry(u.country || "");
        setEmail(u.email || "");
      } catch (err) {
        console.error("Failed to load profile", err);
        if (mounted) {
          showToast(
            err?.message || "Failed to load account details.",
            "danger"
          );
        }
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    };

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  // Save Account details
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      await api.updateProfile({
        fullName,
        company,
        country,
      });
      showToast("Account details updated.");
    } catch (err) {
      console.error("Failed to update profile", err);
      showToast(
        err?.message || "Failed to update account details.",
        "danger"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // Change email
  const handleChangeEmail = async (e) => {
    e.preventDefault();

    if (!newEmail || !confirmNewEmail) {
      showToast("Please fill both new email fields.", "danger");
      return;
    }
    if (newEmail !== confirmNewEmail) {
      showToast("New email and confirm email do not match.", "danger");
      return;
    }

    try {
      setChangingEmail(true);
      await api.changeEmail(emailCurrentPassword, newEmail);
      showToast("Email updated successfully. Use new email on next login.");

      setEmail(newEmail);
      setNewEmail("");
      setConfirmNewEmail("");
      setEmailCurrentPassword("");
    } catch (err) {
      console.error("Failed to change email", err);
      showToast(err?.message || "Failed to change email.", "danger");
    } finally {
      setChangingEmail(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmNewPassword) {
      showToast("Please fill all password fields.", "danger");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast("New password and confirm password do not match.", "danger");
      return;
    }

    try {
      setChangingPassword(true);
      await api.changePassword(currentPassword, newPassword);
      showToast("Password changed successfully.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      console.error("Failed to change password", err);
      showToast(err?.message || "Failed to change password.", "danger");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <>
      {/* Top bar */}
      <NavbarTop
        isMobile={isCompact}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      {/* Sidebar */}
      <SidebarDashly
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isCompact={isCompact}
        setIsCompact={setIsCompact}
      />

      {/* Main content */}
      <main
        style={{
          marginTop: NAVBAR_H,
          marginLeft: isCompact ? 0 : SIDEBAR_W,
          transition: "margin-left 0.2s ease",
          padding: "1.5rem",
        }}
      >
        <Container fluid className="py-3">
          <Row className="mb-3">
            <Col>
              <h3 className="mb-1">Settings</h3>
              <div className="text-muted">
                Manage your account details, email, and password.
              </div>
            </Col>
          </Row>

          <Row>
            {/* Account details widget */}
            <Col lg={6} className="mb-3">
              <Card className="h-100">
                <Card.Header>
                  <Card.Title as="h5" className="mb-0">
                    Account details
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  {loadingProfile ? (
                    <div className="d-flex align-items-center">
                      <Spinner animation="border" size="sm" className="me-2" />
                      <span>Loading account details...</span>
                    </div>
                  ) : (
                    <Form onSubmit={handleSaveProfile}>
                      <Form.Group className="mb-3" controlId="settingsFullName">
                        <Form.Label>Full name</Form.Label>
                        <Form.Control
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your full name"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="settingsCompany">
                        <Form.Label>Company</Form.Label>
                        <Form.Control
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Company name"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="settingsCountry">
                        <Form.Label>Country</Form.Label>
                        <Form.Control
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="Country"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="settingsEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          value={email}
                          readOnly
                          disabled
                        />
                        <Form.Text className="text-muted">
                          Email is managed from the “Change email” section
                          below.
                        </Form.Text>
                      </Form.Group>

                      <div className="d-flex justify-content-end">
                        <Button
                          type="submit"
                          variant="primary"
                          disabled={savingProfile}
                        >
                          {savingProfile && (
                            <Spinner
                              animation="border"
                              size="sm"
                              className="me-2"
                            />
                          )}
                          Save changes
                        </Button>
                      </div>
                    </Form>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Change email + change password widgets */}
            <Col lg={6} className="mb-3">
              {/* Change email */}
              <Card className="mb-3">
                <Card.Header>
                  <Card.Title as="h5" className="mb-0">
                    Change email
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleChangeEmail}>
                    <Form.Group
                      className="mb-3"
                      controlId="settingsEmailCurrentPassword"
                    >
                      <Form.Label>Current password</Form.Label>
                      <Form.Control
                        type="password"
                        value={emailCurrentPassword}
                        onChange={(e) =>
                          setEmailCurrentPassword(e.target.value)
                        }
                        placeholder="Enter current password"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="settingsNewEmail">
                      <Form.Label>New email</Form.Label>
                      <Form.Control
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Enter new email"
                      />
                    </Form.Group>

                    <Form.Group
                      className="mb-3"
                      controlId="settingsConfirmNewEmail"
                    >
                      <Form.Label>Confirm new email</Form.Label>
                      <Form.Control
                        type="email"
                        value={confirmNewEmail}
                        onChange={(e) => setConfirmNewEmail(e.target.value)}
                        placeholder="Re-enter new email"
                      />
                    </Form.Group>

                    <div className="d-flex justify-content-end">
                      <Button
                        type="submit"
                        variant="outline-primary"
                        disabled={changingEmail}
                      >
                        {changingEmail && (
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                        )}
                        Update email
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>

              {/* Change password */}
              <Card>
                <Card.Header>
                  <Card.Title as="h5" className="mb-0">
                    Change password
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleChangePassword}>
                    <Form.Group
                      className="mb-3"
                      controlId="settingsCurrentPassword"
                    >
                      <Form.Label>Current password</Form.Label>
                      <Form.Control
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                    </Form.Group>

                    <Form.Group
                      className="mb-3"
                      controlId="settingsNewPassword"
                    >
                      <Form.Label>New password</Form.Label>
                      <Form.Control
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                    </Form.Group>

                    <Form.Group
                      className="mb-3"
                      controlId="settingsConfirmNewPassword"
                    >
                      <Form.Label>Confirm new password</Form.Label>
                      <Form.Control
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) =>
                          setConfirmNewPassword(e.target.value)
                        }
                        placeholder="Re-enter new password"
                      />
                    </Form.Group>

                    <div className="d-flex justify-content-end">
                      <Button
                        type="submit"
                        variant="outline-danger"
                        disabled={changingPassword}
                      >
                        {changingPassword && (
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                        )}
                        Update password
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>

      {/* Toast */}
      <ToastContainer
        position="bottom-end"
        className="p-3"
        style={{ zIndex: 9999 }}
      >
        <Toast
          bg={toast.bg}
          show={toast.show}
          onClose={() => setToast({ ...toast, show: false })}
          delay={4000}
          autohide
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default SettingsPage;
