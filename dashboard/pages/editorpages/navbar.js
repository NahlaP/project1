


// // pages/editorpages/navbar.js

// import React, { useEffect, useState } from 'react';
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Button,
//   Form,
//   Table,
//   Alert,
// } from 'react-bootstrap';
// import EditorDashboardLayout from '../layouts/EditorDashboardLayout';

// const backendUrl = 'http://localhost:5000';
// const userId = 'demo-user';
// const templateId = 'gym-template-1';

// function NavbarEditorPage() {
//   const [items, setItems] = useState([]);
//   const [success, setSuccess] = useState('');
//   const [newItem, setNewItem] = useState({ label: '', href: '', type: 'link' });
//   const [sections, setSections] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const navRes = await fetch(`${backendUrl}/api/navbar/${userId}/${templateId}`);
//         const navItems = await navRes.json();

//         const secRes = await fetch(`${backendUrl}/api/sections/${userId}/${templateId}`);
//         const secData = await secRes.json();
//         const pages = secData.filter((s) => s.type === 'page');

//         const pageItems = pages.map((p) => ({
//           _id: p._id,
//           label: p.title || 'Untitled',
//           href: `page.html?slug=${p.slug}`,
//           type: 'page',
//         }));

//         setItems([...navItems, ...pageItems]);
//         setSections(pages);
//       } catch (err) {
//         console.error('Error loading:', err);
//       }
//     };
//     fetchData();
//   }, []);

//   const handleAddItem = async () => {
//     try {
//       const res = await fetch(`${backendUrl}/api/navbar/${userId}/${templateId}/add`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(newItem),
//       });
//       const data = await res.json();
//       setItems((prev) => [...prev, data]);
//       setNewItem({ label: '', href: '', type: 'link' });
//       setSuccess('✅ Item added');
//     } catch (err) {
//       console.error('Add error:', err);
//     }
//   };

//   const handleAddPage = async () => {
//     const slug = newItem.label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
//     try {
//       const res = await fetch(`${backendUrl}/api/sections`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           userId,
//           templateId,
//           title: newItem.label,
//           slug,
//           type: 'page',
//         }),
//       });
//       const data = await res.json();
//       const pageItem = {
//         _id: data._id,
//         label: data.title,
//         href: `page.html?slug=${data.slug}`,
//         type: 'page',
//       };
//       setItems((prev) => [...prev, pageItem]);
//       setSections((prev) => [...prev, data]);
//       setNewItem({ label: '', href: '', type: 'link' });
//       setSuccess('✅ Page created');
//     } catch (err) {
//       console.error('Page error:', err);
//     }
//   };

//   const handleDelete = async (index) => {
//     const item = items[index];

//     // 1. Try to delete from navbar collection
//     if (item._id && item.type !== 'page') {
//       await fetch(`${backendUrl}/api/navbar/${userId}/${templateId}/${item._id}`, {
//         method: 'DELETE',
//       });
//     }

//     // 2. Try to delete from sections if it's a dynamic page
//     const slug = item.href?.replace('page.html?slug=', '');
//     if (item.type === 'page' && slug) {
//       const matchingSection = sections.find((s) => s.slug === slug);
//       if (matchingSection) {
//         await fetch(`${backendUrl}/api/sections/${matchingSection._id}`, {
//           method: 'DELETE',
//         });
//         setSections((prev) => prev.filter((s) => s._id !== matchingSection._id));
//       }
//     }

//     // 3. Remove from local state
//     setItems((prev) => prev.filter((_, i) => i !== index));
//   };

//   const handleChange = (index, key, value) => {
//     const updated = [...items];
//     updated[index][key] = value;
//     setItems(updated);
//   };

//   const handleSave = async (item) => {
//     if (!item._id || item.type === 'page') return;

//     await fetch(`${backendUrl}/api/navbar/${userId}/${templateId}/${item._id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(item),
//     });
//     setSuccess('✅ Saved changes');
//   };

//   return (
//     <Container className="py-4">
//       <h4 className="fw-bold">🔧 Navbar Editor</h4>
//       {success && <Alert variant="success">{success}</Alert>}

//       <Card className="p-4 mb-4">
//         <h5>Add New Navbar Item / Page</h5>
//         <Row>
//           <Col md={3}>
//             <Form.Control
//               placeholder="Label"
//               value={newItem.label}
//               onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
//             />
//           </Col>
//           <Col md={3}>
//             <Form.Control
//               placeholder="Link (href)"
//               value={newItem.href}
//               onChange={(e) => setNewItem({ ...newItem, href: e.target.value })}
//             />
//           </Col>
//           <Col md={2}>
//             <Form.Select
//               value={newItem.type}
//               onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
//             >
//               <option value="link">Link</option>
//               <option value="dropdown">Dropdown</option>
//             </Form.Select>
//           </Col>
//           <Col md={2}>
//             <Button onClick={handleAddItem}>➕ Add Nav</Button>
//           </Col>
//           <Col md={2}>
//             <Button variant="secondary" onClick={handleAddPage}>➕ Add Page</Button>
//           </Col>
//         </Row>
//       </Card>

//       <Card className="p-3">
//         <h5 className="mb-3">Navbar Items & Pages Table</h5>
//         <Table bordered>
//           <thead>
//             <tr>
//               <th>Label</th>
//               <th>Link</th>
//               <th>Type</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.map((item, index) => (
//               <tr key={index}>
//                 <td>
//                   <Form.Control
//                     value={item.label}
//                     onChange={(e) => handleChange(index, 'label', e.target.value)}
//                     disabled={item.type === 'page'}
//                   />
//                 </td>
//                 <td>
//                   <Form.Control
//                     value={item.href}
//                     onChange={(e) => handleChange(index, 'href', e.target.value)}
//                     disabled={item.type === 'page'}
//                   />
//                 </td>
//                 <td>
//                   <Form.Select
//                     value={item.type}
//                     onChange={(e) => handleChange(index, 'type', e.target.value)}
//                     disabled={item.type === 'page'}
//                   >
//                     <option value="link">Link</option>
//                     <option value="dropdown">Dropdown</option>
//                     <option value="page">Page</option>
//                   </Form.Select>
//                 </td>
//                 <td>
//                   <Button size="sm" onClick={() => handleSave(item)} disabled={item.type === 'page'}>💾</Button>{' '}
//                   <Button variant="danger" size="sm" onClick={() => handleDelete(index)}>🗑️</Button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </Table>
//       </Card>
//     </Container>
//   );
// }

// NavbarEditorPage.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;

// export default NavbarEditorPage;



// pages/editorpages/navbar.js

import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Table,
  Alert,
} from 'react-bootstrap';
import EditorDashboardLayout from '../layouts/EditorDashboardLayout';
import { backendBaseUrl, userId, templateId } from '../../lib/config';

function NavbarEditorPage() {
  const [items, setItems] = useState([]);
  const [success, setSuccess] = useState('');
  const [newItem, setNewItem] = useState({ label: '', href: '', type: 'link' });
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const navRes = await fetch(`${backendBaseUrl}/api/navbar/${userId}/${templateId}`);
        const navItems = await navRes.json();

        const secRes = await fetch(`${backendBaseUrl}/api/sections/${userId}/${templateId}`);
        const secData = await secRes.json();
        const pages = secData.filter((s) => s.type === 'page');

        const pageItems = pages.map((p) => ({
          _id: p._id,
          label: p.title || 'Untitled',
          href: `page.html?slug=${p.slug}`,
          type: 'page',
        }));

        setItems([...navItems, ...pageItems]);
        setSections(pages);
      } catch (err) {
        console.error('Error loading navbar or pages:', err);
      }
    };
    fetchData();
  }, []);

  const handleAddItem = async () => {
    try {
      const res = await fetch(`${backendBaseUrl}/api/navbar/${userId}/${templateId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      const data = await res.json();
      setItems((prev) => [...prev, data]);
      setNewItem({ label: '', href: '', type: 'link' });
      setSuccess('✅ Nav item added');
    } catch (err) {
      console.error('Error adding nav item:', err);
    }
  };

  const handleAddPage = async () => {
    const slug = newItem.label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    try {
      const res = await fetch(`${backendBaseUrl}/api/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          templateId,
          title: newItem.label,
          slug,
          type: 'page',
        }),
      });
      const data = await res.json();
      const pageItem = {
        _id: data._id,
        label: data.title,
        href: `page.html?slug=${data.slug}`,
        type: 'page',
      };
      setItems((prev) => [...prev, pageItem]);
      setSections((prev) => [...prev, data]);
      setNewItem({ label: '', href: '', type: 'link' });
      setSuccess('✅ Page created');
    } catch (err) {
      console.error('Error creating page:', err);
    }
  };

  const handleDelete = async (index) => {
    const item = items[index];

    if (item._id && item.type !== 'page') {
      await fetch(`${backendBaseUrl}/api/navbar/${userId}/${templateId}/${item._id}`, {
        method: 'DELETE',
      });
    }

    const slug = item.href?.replace('page.html?slug=', '');
    if (item.type === 'page' && slug) {
      const match = sections.find((s) => s.slug === slug);
      if (match) {
        await fetch(`${backendBaseUrl}/api/sections/${match._id}`, {
          method: 'DELETE',
        });
        setSections((prev) => prev.filter((s) => s._id !== match._id));
      }
    }

    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (index, key, value) => {
    const updated = [...items];
    updated[index][key] = value;
    setItems(updated);
  };

  const handleSave = async (item) => {
    if (!item._id || item.type === 'page') return;
    await fetch(`${backendBaseUrl}/api/navbar/${userId}/${templateId}/${item._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    setSuccess('✅ Changes saved');
  };

  return (
    <Container className="py-4">
      <h4 className="fw-bold">🔧 Navbar Editor</h4>
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="p-4 mb-4">
        <h5>Add New Navbar Item / Page</h5>
        <Row>
          <Col md={3}>
            <Form.Control
              placeholder="Label"
              value={newItem.label}
              onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
            />
          </Col>
          <Col md={3}>
            <Form.Control
              placeholder="Link (href)"
              value={newItem.href}
              onChange={(e) => setNewItem({ ...newItem, href: e.target.value })}
              disabled={newItem.type === 'page'}
            />
          </Col>
          <Col md={2}>
            <Form.Select
              value={newItem.type}
              onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
            >
              <option value="link">Link</option>
              <option value="dropdown">Dropdown</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Button onClick={handleAddItem}>➕ Add Nav</Button>
          </Col>
          <Col md={2}>
            <Button variant="secondary" onClick={handleAddPage}>➕ Add Page</Button>
          </Col>
        </Row>
      </Card>

      <Card className="p-3">
        <h5 className="mb-3">Navbar Items & Pages</h5>
        <Table bordered>
          <thead>
            <tr>
              <th>Label</th>
              <th>Link</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>
                  <Form.Control
                    value={item.label}
                    onChange={(e) => handleChange(index, 'label', e.target.value)}
                    disabled={item.type === 'page'}
                  />
                </td>
                <td>
                  <Form.Control
                    value={item.href}
                    onChange={(e) => handleChange(index, 'href', e.target.value)}
                    disabled={item.type === 'page'}
                  />
                </td>
                <td>
                  <Form.Select
                    value={item.type}
                    onChange={(e) => handleChange(index, 'type', e.target.value)}
                    disabled={item.type === 'page'}
                  >
                    <option value="link">Link</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="page">Page</option>
                  </Form.Select>
                </td>
                <td>
                  <Button
                    size="sm"
                    onClick={() => handleSave(item)}
                    disabled={item.type === 'page'}
                  >
                    💾
                  </Button>{' '}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(index)}
                  >
                    🗑️
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
}

NavbarEditorPage.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;

export default NavbarEditorPage;
