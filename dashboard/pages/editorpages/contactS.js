





// 'use client';

// import React, { useEffect, useState } from 'react';
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Form,
//   Button,
//   Alert,
// } from 'react-bootstrap';
// import EditorDashboardLayout from '../layouts/EditorDashboardLayout';
// import { backendBaseUrl, userId, templateId } from '../../lib/config';
// import BackBar from "../components/BackBar";
// function ContactEditor() {
//   const [form, setForm] = useState({
//     address: '',
//     phone: '',
//     email: '',
//     socialLinks: {
//       facebook: '',
//       twitter: '',
//       youtube: '',
//       linkedin: '',
//     },
//     businessHours: {
//       mondayToFriday: '',
//       saturday: '',
//       sunday: '',
//     },
//   });

//   const [success, setSuccess] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch(
//           `${backendBaseUrl}/api/contact-info/${userId}/${templateId}`
//         );
//         const data = await res.json();
//         if (data) setForm((prev) => ({ ...prev, ...data }));
//       } catch (err) {
//         console.error(err);
//         setError('❌ Failed to load contact info');
//       }
//     })();
//   }, []);

//   const handleChange = (key, value) => {
//     setForm((prev) => ({ ...prev, [key]: value }));
//   };

//   const handleNestedChange = (section, key, value) => {
//     setForm((prev) => ({
//       ...prev,
//       [section]: {
//         ...prev[section],
//         [key]: value,
//       },
//     }));
//   };

//   const handleSave = async () => {
//     setLoading(true);
//     setSuccess('');
//     setError('');
//     try {
//       const res = await fetch(
//         `${backendBaseUrl}/api/contact-info/${userId}/${templateId}`,
//         {
//           method: 'PUT',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(form),
//         }
//       );
//       const result = await res.json();
//       if (result.message) setSuccess('✅ Contact info saved successfully!');
//     } catch (err) {
//       setError('❌ Failed to save');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Container fluid className="py-4">
//       <Row>
//         <Col>
//           <BackBar />
//           <h4 className="fw-bold">📞 Contact Section Editor</h4>
//         </Col>
//       </Row>
//       {success && <Alert variant="success">{success}</Alert>}
//       {error && <Alert variant="danger">{error}</Alert>}

//       <Card className="p-4 shadow-sm mb-4">
//         <Row>
//           <Col md={4}>
//             <Form.Group className="mb-3">
//               <Form.Label>Address</Form.Label>
//               <Form.Control
//                 value={form.address}
//                 onChange={(e) => handleChange('address', e.target.value)}
//               />
//             </Form.Group>
//           </Col>
//           <Col md={4}>
//             <Form.Group className="mb-3">
//               <Form.Label>Phone</Form.Label>
//               <Form.Control
//                 value={form.phone}
//                 onChange={(e) => handleChange('phone', e.target.value)}
//               />
//             </Form.Group>
//           </Col>
//           <Col md={4}>
//             <Form.Group className="mb-3">
//               <Form.Label>Email</Form.Label>
//               <Form.Control
//                 value={form.email}
//                 onChange={(e) => handleChange('email', e.target.value)}
//               />
//             </Form.Group>
//           </Col>
//         </Row>

//         <Row className="mt-3">
//           <Col>
//             <h6 className="text-uppercase">🌐 Social Links</h6>
//           </Col>
//         </Row>
//         <Row>
//           {['facebook', 'twitter', 'youtube', 'linkedin'].map((key) => (
//             <Col md={3} key={key}>
//               <Form.Group className="mb-3">
//                 <Form.Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Form.Label>
//                 <Form.Control
//                   value={form.socialLinks?.[key]}
//                   onChange={(e) =>
//                     handleNestedChange('socialLinks', key, e.target.value)
//                   }
//                 />
//               </Form.Group>
//             </Col>
//           ))}
//         </Row>

//         <Row className="mt-3">
//           <Col>
//             <h6 className="text-uppercase">⏰ Business Hours</h6>
//           </Col>
//         </Row>
//         <Row>
//           {[
//             ['mondayToFriday', 'Monday - Friday'],
//             ['saturday', 'Saturday'],
//             ['sunday', 'Sunday'],
//           ].map(([key, label]) => (
//             <Col md={4} key={key}>
//               <Form.Group className="mb-3">
//                 <Form.Label>{label}</Form.Label>
//                 <Form.Control
//                   value={form.businessHours?.[key]}
//                   onChange={(e) =>
//                     handleNestedChange('businessHours', key, e.target.value)
//                   }
//                 />
//               </Form.Group>
//             </Col>
//           ))}
//         </Row>

//         <div className="d-flex justify-content-end">
//           <Button onClick={handleSave} disabled={loading} variant="primary">
//             {loading ? 'Saving...' : '💾 Save Contact Info'}
//           </Button>
//         </div>
//       </Card>

//       {/* Preview card */}
//       <Card className="p-4 bg-dark text-white">
//         <Row className="g-5">
//           <Col md={6} lg={3}>
//             <h5 className="text-uppercase text-light mb-4">Our Office</h5>
//             <p><i className="fa fa-map-marker-alt text-primary me-2"></i>{form.address}</p>
//             <p><i className="fa fa-phone-alt text-primary me-2"></i>{form.phone}</p>
//             <p><i className="fa fa-envelope text-primary me-2"></i>{form.email}</p>
//             <div className="d-flex pt-3">
//               {form.socialLinks.twitter && (
//                 <a
//                   className="btn btn-square btn-light me-2"
//                   href={form.socialLinks.twitter}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   <i className="fab fa-twitter"></i>
//                 </a>
//               )}
//               {form.socialLinks.facebook && (
//                 <a
//                   className="btn btn-square btn-light me-2"
//                   href={form.socialLinks.facebook}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   <i className="fab fa-facebook-f"></i>
//                 </a>
//               )}
//               {form.socialLinks.youtube && (
//                 <a
//                   className="btn btn-square btn-light me-2"
//                   href={form.socialLinks.youtube}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   <i className="fab fa-youtube"></i>
//                 </a>
//               )}
//               {form.socialLinks.linkedin && (
//                 <a
//                   className="btn btn-square btn-light me-2"
//                   href={form.socialLinks.linkedin}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   <i className="fab fa-linkedin-in"></i>
//                 </a>
//               )}
//             </div>
//           </Col>

//           <Col md={6} lg={3}>
//             <h5 className="text-uppercase text-light mb-4">Business Hours</h5>
//             <p className="text-uppercase mb-0">Monday - Friday</p>
//             <p>{form.businessHours.mondayToFriday}</p>
//             <p className="text-uppercase mb-0">Saturday</p>
//             <p>{form.businessHours.saturday}</p>
//             <p className="text-uppercase mb-0">Sunday</p>
//             <p>{form.businessHours.sunday}</p>
//           </Col>

//           <Col md={12} lg={6}>
//             {/* Placeholder for image gallery (optional future use) */}
//             <div className="row g-1">
//               {[1, 2, 3, 4, 5, 6].map((i) => (
//                 <div className="col-4" key={i}>
//                   {/* Example: <img src={`/img/service-${i}.jpg`} alt={`Gallery ${i}`} className="img-fluid" /> */}
//                 </div>
//               ))}
//             </div>
//           </Col>
//         </Row>
//       </Card>
//     </Container>
//   );
// }

// ContactEditor.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );

// export default ContactEditor;





// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\contactS.js
'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Toast,
  ToastContainer,
} from 'react-bootstrap';
import EditorDashboardLayout from '../layouts/EditorDashboardLayout';
import { backendBaseUrl, userId, templateId } from '../../lib/config';
import BackBar from "../components/BackBar";

function ContactEditor() {
  const [form, setForm] = useState({
    address: '',
    phone: '',
    email: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      youtube: '',
      linkedin: '',
    },
    businessHours: {
      mondayToFriday: '',
      saturday: '',
      sunday: '',
    },
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Ensure nested objects exist (in case backend omits them)
  const normalize = (data) => ({
    address: data?.address || '',
    phone: data?.phone || '',
    email: data?.email || '',
    socialLinks: {
      facebook: data?.socialLinks?.facebook || '',
      twitter:  data?.socialLinks?.twitter  || '',
      youtube:  data?.socialLinks?.youtube  || '',
      linkedin: data?.socialLinks?.linkedin || '',
    },
    businessHours: {
      mondayToFriday: data?.businessHours?.mondayToFriday || '',
      saturday:       data?.businessHours?.saturday       || '',
      sunday:         data?.businessHours?.sunday         || '',
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${backendBaseUrl}/api/contact-info/${userId}/${templateId}`,
          { headers: { Accept: 'application/json' }, cache: 'no-store' }
        );
        const data = await res.json();
        if (data) setForm(normalize(data));
      } catch (err) {
        console.error(err);
        setError('❌ Failed to load contact info');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNestedChange = (section, key, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const withHttp = (url) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await fetch(
        `${backendBaseUrl}/api/contact-info/${userId}/${templateId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || 'Save failed');
      if (result.message) {
        setSuccess('✅ Contact info saved successfully!');
        setShowToast(true);
      }
    } catch (err) {
      setError('❌ Failed to save');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h4 className="fw-bold">📞 Contact Section Editor</h4>
          <BackBar />
        </Col>
      </Row>
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="p-4 shadow-sm mb-4">
        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="123 Example St, City"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 555 123 4567"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="you@example.com"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col>
            <h6 className="text-uppercase">🌐 Social Links</h6>
          </Col>
        </Row>
        <Row>
          {['facebook', 'twitter', 'youtube', 'linkedin'].map((key) => (
            <Col md={3} key={key}>
              <Form.Group className="mb-3">
                <Form.Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Form.Label>
                <Form.Control
                  value={form.socialLinks?.[key]}
                  onChange={(e) =>
                    handleNestedChange('socialLinks', key, e.target.value)
                  }
                  placeholder={`https://www.${key}.com/yourpage`}
                />
              </Form.Group>
            </Col>
          ))}
        </Row>

        <Row className="mt-3">
          <Col>
            <h6 className="text-uppercase">⏰ Business Hours</h6>
          </Col>
        </Row>
        <Row>
          {[
            ['mondayToFriday', 'Monday - Friday'],
            ['saturday', 'Saturday'],
            ['sunday', 'Sunday'],
          ].map(([key, label]) => (
            <Col md={4} key={key}>
              <Form.Group className="mb-3">
                <Form.Label>{label}</Form.Label>
                <Form.Control
                  value={form.businessHours?.[key]}
                  onChange={(e) =>
                    handleNestedChange('businessHours', key, e.target.value)
                  }
                  placeholder={key === 'mondayToFriday' ? '09:00 – 18:00' : 'Closed / 10:00 – 16:00'}
                />
              </Form.Group>
            </Col>
          ))}
        </Row>

        <div className="d-flex justify-content-end">
          <Button onClick={handleSave} disabled={loading} variant="primary">
            {loading ? 'Saving...' : '💾 Save Contact Info'}
          </Button>
        </div>
      </Card>

      {/* Preview card */}
      <Card className="p-4 bg-dark text-white">
        <Row className="g-5">
          <Col md={6} lg={3}>
            <h5 className="text-uppercase text-light mb-4">Our Office</h5>
            <p><i className="fa fa-map-marker-alt text-primary me-2"></i>{form.address}</p>
            <p>
              <i className="fa fa-phone-alt text-primary me-2"></i>
              {form.phone ? <a href={`tel:${form.phone}`} className="text-white text-decoration-none">{form.phone}</a> : ''}
            </p>
            <p>
              <i className="fa fa-envelope text-primary me-2"></i>
              {form.email ? <a href={`mailto:${form.email}`} className="text-white text-decoration-none">{form.email}</a> : ''}
            </p>
            <div className="d-flex pt-3">
              {form.socialLinks.twitter && (
                <a
                  className="btn btn-square btn-light me-2"
                  href={withHttp(form.socialLinks.twitter)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-twitter"></i>
                </a>
              )}
              {form.socialLinks.facebook && (
                <a
                  className="btn btn-square btn-light me-2"
                  href={withHttp(form.socialLinks.facebook)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
              )}
              {form.socialLinks.youtube && (
                <a
                  className="btn btn-square btn-light me-2"
                  href={withHttp(form.socialLinks.youtube)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-youtube"></i>
                </a>
              )}
              {form.socialLinks.linkedin && (
                <a
                  className="btn btn-square btn-light me-2"
                  href={withHttp(form.socialLinks.linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-linkedin-in"></i>
                </a>
              )}
            </div>
          </Col>

          <Col md={6} lg={3}>
            <h5 className="text-uppercase text-light mb-4">Business Hours</h5>
            <p className="text-uppercase mb-0">Monday - Friday</p>
            <p>{form.businessHours.mondayToFriday}</p>
            <p className="text-uppercase mb-0">Saturday</p>
            <p>{form.businessHours.saturday}</p>
            <p className="text-uppercase mb-0">Sunday</p>
            <p>{form.businessHours.sunday}</p>
          </Col>

          <Col md={12} lg={6}>
            {/* Placeholder for image gallery (optional future use) */}
            <div className="row g-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div className="col-4" key={i}>
                  {/* Example: <img src={`/img/service-${i}.jpg`} alt={`Gallery ${i}`} className="img-fluid" /> */}
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </Card>

      {/* Floating success toast */}
      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          bg="success"
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={2200}
          autohide
        >
          <Toast.Body className="text-white">
            {success || 'Saved successfully.'}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

ContactEditor.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default ContactEditor;
