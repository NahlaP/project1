// // components/sections/Hero.js
// import { useEffect, useState } from 'react';
// import { Spinner } from 'react-bootstrap';
// import axios from 'axios';

// const backendBaseUrl = "http://localhost:5000";
// const userId = "demo-user";
// const templateId = "gym-template-1";

// const Hero = () => {
//   const [hero, setHero] = useState(null);

//   useEffect(() => {
//     const fetchHero = async () => {
//       try {
//         const res = await axios.get(`${backendBaseUrl}/api/hero/${userId}/${templateId}`);
//         setHero(res.data);
//       } catch (err) {
//         console.error("❌ Failed to fetch hero content", err);
//         setHero({ content: "", imageUrl: "" });
//       }
//     };
//     fetchHero();
//   }, []);

//   if (!hero?.content && !hero?.imageUrl) {
//     return (
//       <div className="p-3 bg-light border rounded mb-3">
//         <h5>Hero Section</h5>
//         <p className="text-muted">No content found in /api/hero route.</p>
//       </div>
//     );
//   }

//   return (
//     <section className="mb-5">
//       <div id="header-carousel" className="carousel slide">
//         <div className="carousel-inner">
//           <div className="carousel-item active" style={{ minHeight: "100vh", position: "relative" }}>
//             {hero.imageUrl && (
//               <img
//                 src={hero.imageUrl.startsWith("http") ? hero.imageUrl : `${backendBaseUrl}${hero.imageUrl}`}
//                 alt="Hero"
//                 className="w-100 h-100"
//                 style={{ objectFit: "cover", height: "auto", maxHeight: "100vh" }}
//               />
//             )}
//             <div
//               className="carousel-caption"
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 bottom: 0,
//                 left: 0,
//                 right: 0,
//                 display: "flex",
//                 flexDirection: "column",
//                 justifyContent: "center",
//                 alignItems: "flex-start",
//                 background: "rgba(0, 0, 0, 0.5)",
//                 padding: "4rem 4rem 4rem 11rem",
//                 zIndex: 10,
//               }}
//             >
//               <h1
//                 style={{
//                   fontSize: "2.5rem",
//                   fontWeight: "bold",
//                   color: "white",
//                   maxWidth: "700px",
//                 }}
//               >
//                 {hero.content}
//               </h1>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Hero;


import { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import axios from 'axios';
import { backendBaseUrl, userId, templateId } from '../../lib/config';

const Hero = () => {
  const [hero, setHero] = useState(null);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await axios.get(`${backendBaseUrl}/api/hero/${userId}/${templateId}`);
        setHero(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch hero content", err);
        setHero({ content: "", imageUrl: "" });
      }
    };
    fetchHero();
  }, []);

  if (!hero?.content && !hero?.imageUrl) {
    return (
      <div className="p-3 bg-light border rounded mb-3">
        <h5>Hero Section</h5>
        <p className="text-muted">No content found in /api/hero route.</p>
      </div>
    );
  }

  return (
    <section className="mb-5">
      <div id="header-carousel" className="carousel slide">
        <div className="carousel-inner">
          <div className="carousel-item active" style={{ minHeight: "100vh", position: "relative" }}>
            {hero.imageUrl && (
              <img
                src={hero.imageUrl.startsWith("http") ? hero.imageUrl : `${backendBaseUrl}${hero.imageUrl}`}
                alt="Hero"
                className="w-100 h-100"
                style={{ objectFit: "cover", height: "auto", maxHeight: "100vh" }}
              />
            )}
            <div
              className="carousel-caption"
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                background: "rgba(0, 0, 0, 0.5)",
                padding: "4rem 4rem 4rem 11rem",
                zIndex: 10,
              }}
            >
              <h1
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  color: "white",
                  maxWidth: "700px",
                }}
              >
                {hero.content}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
