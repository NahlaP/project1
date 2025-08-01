// document.addEventListener("DOMContentLoaded", loadTeamSection);

// async function loadTeamSection() {
//   const API = "http://localhost:5000/api/team";
//   const userId = "demo-user";
//   const templateId = "gym-template-1";
//   const wrapper = document.querySelector(".team .row");

//   try {
//     const res = await fetch(`${API}/${userId}/${templateId}`);
//     const data = await res.json();

//     wrapper.innerHTML = "";

//     data.forEach((member, index) => {
//       const delay = 0.3 + index * 0.1;
//       const socials = member.socials || {};

//       const col = document.createElement("div");
//       col.className = `col-lg-3 col-md-6 wow fadeInUp`;
//       col.setAttribute("data-wow-delay", `${delay.toFixed(1)}s`);

//       // ✅ Fix image URL here
//       const imageUrl = member.imageUrl
//         ? `http://localhost:5000${member.imageUrl}`
//         : "/img/default.jpg";

//       col.innerHTML = `
//         <div class="team-item">
//           <div class="position-relative overflow-hidden">
//             <img class="img-fluid w-100" src="${imageUrl}" alt="${member.name}">
//             <div class="team-social">
//               ${socials.facebook ? `<a class="btn btn-square btn-dark mx-1" href="${socials.facebook}" target="_blank"><i class="fab fa-facebook-f"></i></a>` : ""}
//               ${socials.twitter ? `<a class="btn btn-square btn-dark mx-1" href="${socials.twitter}" target="_blank"><i class="fab fa-twitter"></i></a>` : ""}
//               ${socials.linkedin ? `<a class="btn btn-square btn-dark mx-1" href="${socials.linkedin}" target="_blank"><i class="fab fa-linkedin-in"></i></a>` : ""}
//               ${socials.youtube ? `<a class="btn btn-square btn-dark mx-1" href="${socials.youtube}" target="_blank"><i class="fab fa-youtube"></i></a>` : ""}
//             </div>
//           </div>
//           <div class="text-center p-4">
//             <h5 class="mb-1">${member.name}</h5>
//             <span>${member.role}</span>
//           </div>
//         </div>
//       `;

//       wrapper.appendChild(col);
//     });
//   } catch (err) {
//     console.error("❌ Failed to load team members:", err);
//   }
// }



document.addEventListener("DOMContentLoaded", loadTeamSection);

async function loadTeamSection() {
  const API = "https://project1backend-2xvq.onrender.com/api/team";
  const userId = "demo-user";
  const templateId = "gym-template-1";
  const wrapper = document.querySelector(".team .row");

  try {
    const res = await fetch(`${API}/${userId}/${templateId}`);
    const data = await res.json();

    wrapper.innerHTML = "";

    data.forEach((member, index) => {
      const delay = 0.3 + index * 0.1;
      const socials = member.socials || {};

      const col = document.createElement("div");
      col.className = `col-lg-3 col-md-6 wow fadeInUp`;
      col.setAttribute("data-wow-delay", `${delay.toFixed(1)}s`);

      // ✅ Updated image URL
      const imageUrl = member.imageUrl
        ? `https://project1backend-2xvq.onrender.com${member.imageUrl}`
        : "/img/default.jpg";

      col.innerHTML = `
        <div class="team-item">
          <div class="position-relative overflow-hidden">
            <img class="img-fluid w-100" src="${imageUrl}" alt="${member.name}">
            <div class="team-social">
              ${socials.facebook ? `<a class="btn btn-square btn-dark mx-1" href="${socials.facebook}" target="_blank"><i class="fab fa-facebook-f"></i></a>` : ""}
              ${socials.twitter ? `<a class="btn btn-square btn-dark mx-1" href="${socials.twitter}" target="_blank"><i class="fab fa-twitter"></i></a>` : ""}
              ${socials.linkedin ? `<a class="btn btn-square btn-dark mx-1" href="${socials.linkedin}" target="_blank"><i class="fab fa-linkedin-in"></i></a>` : ""}
              ${socials.youtube ? `<a class="btn btn-square btn-dark mx-1" href="${socials.youtube}" target="_blank"><i class="fab fa-youtube"></i></a>` : ""}
            </div>
          </div>
          <div class="text-center p-4">
            <h5 class="mb-1">${member.name}</h5>
            <span>${member.role}</span>
          </div>
        </div>
      `;

      wrapper.appendChild(col);
    });
  } catch (err) {
    console.error("❌ Failed to load team members:", err);
  }
}
