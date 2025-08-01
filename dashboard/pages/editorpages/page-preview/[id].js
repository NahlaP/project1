
// // pages/editorpages/page-preview/[id].js
// import { useRouter } from 'next/router';
// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import EditorDashboardLayout from '../../layouts/EditorDashboardLayout';
// import { Spinner, Container } from 'react-bootstrap';

// // ✅ Import all your CMS-controlled section components
// import Hero from '../../components/sections/Hero';
// import About from '../homepage-sections/About';
// import WhyChoose from '../homepage-sections/WhyChoose';
// import Services from '../homepage-sections/Services';
// import Appointment from '../homepage-sections/Appointment';
// import Team from '../homepage-sections/Team';
// import Testimonial from '../homepage-sections/Testimonial';
// import Contact from '../homepage-sections/Contact';

// const USER_ID = 'demo-user';
// const TEMPLATE_ID = 'gym-template-1';

// const PagePreview = () => {
//   const { id } = useRouter().query;
//   const [page, setPage] = useState(null);
//   const [sections, setSections] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!id) return;

//     const fetchPage = async () => {
//       try {
//         const pageRes = await axios.get(`http://localhost:5000/api/sections/by-id/${id}`);
//         const sectionsRes = await axios.get(`http://localhost:5000/api/sections/${USER_ID}/${TEMPLATE_ID}`);
//         const childSections = sectionsRes.data.filter((s) => s.parentPageId === id);
//         setPage(pageRes.data);
//         setSections(childSections.sort((a, b) => a.order - b.order)); // ✅ Sort by order
//       } catch (err) {
//         console.error('❌ Failed to load preview data', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPage();
//   }, [id]);

//   const renderSection = (section) => {
//     switch (section.slug || section.type) {
//      case 'hero':
//   return <Hero key={section._id} />;

//       case 'about':
//         return <About key={section._id} section={section} />;
//       case 'why-choose':
//         return <WhyChoose key={section._id} section={section} />;
//       case 'services':
//         return <Services key={section._id} section={section} />;
//       case 'appointment':
//         return <Appointment key={section._id} section={section} />;
//       case 'team':
//         return <Team key={section._id} section={section} />;
//       case 'testimonial':
//         return <Testimonial key={section._id} section={section} />;
//       case 'contact':
//         return <Contact key={section._id} section={section} />;
//       default:
//         return (
//           <div key={section._id} className="p-3 border rounded bg-light mb-4">
//             <h5>{section.title || section.type}</h5>
//             <p className="text-muted">No preview available for this section.</p>
//           </div>
//         );
//     }
//   };

//   if (loading) return <div className="p-4 text-center"><Spinner animation="border" /></div>;

//   return (
//     <Container fluid className="p-4 bg-white">
//       <h2 className="mb-4">🖼️ Preview: {page?.title}</h2>
//       {sections.length === 0 ? (
//         <p className="text-danger">No sections linked to this page.</p>
//       ) : (
//         sections.map(renderSection)
//       )}
//     </Container>
//   );
// };

// // ✅ Wrap in CMS layout
// PagePreview.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;

// export default PagePreview;

// pages/editorpages/page-preview/[id].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import EditorDashboardLayout from '../../layouts/EditorDashboardLayout';
import { Spinner, Container } from 'react-bootstrap';
import { backendBaseUrl, userId, templateId } from '../../../lib/config';

// ✅ Import all CMS-controlled section components
import Hero from '../../components/sections/Hero';
import About from '../homepage-sections/About';
import WhyChoose from '../homepage-sections/WhyChoose';
import Services from '../homepage-sections/Services';
import Appointment from '../homepage-sections/Appointment';
import Team from '../homepage-sections/Team';
import Testimonial from '../homepage-sections/Testimonial';
import Contact from '../homepage-sections/Contact';

const PagePreview = () => {
  const { id } = useRouter().query;
  const [page, setPage] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchPage = async () => {
      try {
        const pageRes = await axios.get(`${backendBaseUrl}/api/sections/by-id/${id}`);
        const sectionsRes = await axios.get(`${backendBaseUrl}/api/sections/${userId}/${templateId}`);
        const childSections = sectionsRes.data.filter((s) => s.parentPageId === id);
        setPage(pageRes.data);
        setSections(childSections.sort((a, b) => a.order - b.order));
      } catch (err) {
        console.error('❌ Failed to load preview data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [id]);

  const renderSection = (section) => {
    switch (section.slug || section.type) {
      case 'hero':
        return <Hero key={section._id} />;
      case 'about':
        return <About key={section._id} section={section} />;
      case 'why-choose':
        return <WhyChoose key={section._id} section={section} />;
      case 'services':
        return <Services key={section._id} section={section} />;
      case 'appointment':
        return <Appointment key={section._id} section={section} />;
      case 'team':
        return <Team key={section._id} section={section} />;
      case 'testimonial':
        return <Testimonial key={section._id} section={section} />;
      case 'contact':
        return <Contact key={section._id} section={section} />;
      default:
        return (
          <div key={section._id} className="p-3 border rounded bg-light mb-4">
            <h5>{section.title || section.type}</h5>
            <p className="text-muted">No preview available for this section.</p>
          </div>
        );
    }
  };

  if (loading)
    return (
      <div className="p-4 text-center">
        <Spinner animation="border" />
      </div>
    );

  return (
    <Container fluid className="p-4 bg-white">
      <h2 className="mb-4">🖼️ Preview: {page?.title}</h2>
      {sections.length === 0 ? (
        <p className="text-danger">No sections linked to this page.</p>
      ) : (
        sections.map(renderSection)
      )}
    </Container>
  );
};

// ✅ Wrap in CMS layout
PagePreview.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;

export default PagePreview;
