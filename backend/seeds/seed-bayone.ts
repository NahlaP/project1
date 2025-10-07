// // // backend/seeds/seed-sir-bayone.ts
// import "dotenv/config";
// import mongoose from "mongoose";
// import { TemplateModel } from "../models/Template";

// async function main() {
//   // set your DB (or use MONGO_URI from .env)
//   await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/project1");

//   // We seed the *sir-template-1* with Bayone defaults
//   const TEMPLATE_ID = "sir-template-1";

//   await TemplateModel.findOneAndUpdate(
//     { templateId: TEMPLATE_ID },
//     {
//       templateId: TEMPLATE_ID,
//       name: "Sir Template (Bayone defaults)",
//       version: 1,
//       // Everything the reset endpoint will clone
//       defaultSections: [
//         /* ===== PAGE ROOT ===== */
//         { type: "page", title: "Home", slug: "home", order: 0 },

//         /* ===== HERO ===== */
//         {
//           type: "hero",
//           title: "Hero",
//           parentSlug: "home",
//           order: 0,
//           content: {
//             heading: "Branding, websites and digital experiences…",
//             imageUrl: "", // keep empty; you use video or static image in template
//             videoUrl: "", // let the CMS fill if you set later
//             posterUrl: ""
//           }
//         },

//         /* ===== ABOUT (video + services inline) ===== */
//         {
//           type: "about",
//           title: "About",
//           parentSlug: "home",
//           order: 1,
//           content: {
//             label: "About Us",
//             introHtml: "", // your loader fills the text-reval
//             video: { src: "assets/vid/vid-startup.mp4" },
//             services: [
//               { label: "01", tag: "",        title: "Branding & Design",          href: "about.html" },
//               { label: "02", tag: "Branding", title: "Brand Strategy & Voice",     href: "about.html" },
//               { label: "03", tag: "Design",   title: "Digital & Web Design",       href: "about.html" }
//             ]
//           }
//         },

//         /* ===== WORKS / PANELS ===== */
//         {
//           type: "works",
//           title: "Works",
//           parentSlug: "home",
//           order: 2,
//           content: {
//             items: [
//               { tag: "Digital Design", title: "Retouch Photo",       year: "2023", imageUrl: "assets/imgs/works/full/1.jpg", href: "project1.html" },
//               { tag: "Branding",       title: "Earthmade Aroma",     year: "2023", imageUrl: "assets/imgs/works/full/2.jpg", href: "project2.html" },
//               { tag: "Branding",       title: "Bank Rebranding",     year: "2023", imageUrl: "assets/imgs/works/full/3.jpg", href: "project3.html" },
//               { tag: "Product Design", title: "The joy of music",     year: "2023", imageUrl: "assets/imgs/works/full/4.jpg", href: "project4.html" },
//               { tag: "Digital Art",    title: "Blue Adobe MAX",       year: "2023", imageUrl: "assets/imgs/works/full/5.jpg", href: "project1.html" },
//               { tag: "Web Design",     title: "Carved Wood",          year: "2023", imageUrl: "assets/imgs/works/full/6.jpg", href: "project3.html" }
//             ]
//           }
//         },

//         /* ===== MARQUEE ===== */
//         {
//           type: "marquee",
//           title: "Marquee",
//           parentSlug: "home",
//           order: 3,
//           content: {
//             items: [
//               "UI-UX Experience",
//               "Web Development",
//               "Digital Marketing",
//               "Product Design",
//               "Mobile Solutions"
//             ].map(t => ({ text: t, icon: "*" }))
//           }
//         },

//         /* ===== BRANDS / CLIENTS CAROUSEL ===== */
//         {
//           type: "brands",
//           title: "Brands",
//           parentSlug: "home",
//           order: 4,
//           content: {
//             items: [
//               { imageUrl: "assets/imgs/brands/01.png", href: "#0", alt: "Brand 1" },
//               { imageUrl: "assets/imgs/brands/02.png", href: "#0", alt: "Brand 2" },
//               { imageUrl: "assets/imgs/brands/03.png", href: "#0", alt: "Brand 3" },
//               { imageUrl: "assets/imgs/brands/04.png", href: "#0", alt: "Brand 4" },
//               { imageUrl: "assets/imgs/brands/05.png", href: "#0", alt: "Brand 5" }
//             ]
//           }
//         },

//         /* ===== SERVICES / ACCORDION ===== */
//         {
//           type: "services",
//           title: "Services",
//           parentSlug: "home",
//           order: 5,
//           content: {
//             label: "Services",
//             heading: { pre: "What We", emphasis: "Do" },
//             services: [
//               { title: "The Power of Influencer Marketing", description: "Taken possession of my entire soul, like these sweet mornings of spring which i enjoy with my whole." },
//               { title: "Unique and Influential Design",     description: "Taken possession of my entire soul, like these sweet mornings of spring which i enjoy with my whole." },
//               { title: "We Build and Activate Brands",       description: "Taken possession of my entire soul, like these sweet mornings of spring which i enjoy with my whole." },
//               { title: "Unique and Influential Design",     description: "Taken possession of my entire soul, like these sweet mornings of spring which i enjoy with my whole." }
//             ]
//           }
//         },

//         /* ===== BLOG LIST ===== */
//         {
//           type: "blog",
//           title: "Blog",
//           parentSlug: "home",
//           order: 6,
//           content: {
//             label: "News",
//             heading: { pre: "Blog &", emphasis: "Insights" },
//             items: [
//               { tag: "Inspiration", date: "August 7, 2022", title: "Utilizing mobile technology in the field.",            href: "blog-details.html", imageUrl: "" },
//               { tag: "Inspiration", date: "August 7, 2022", title: "Working from home? Let’s get started.",                href: "blog-details.html", imageUrl: "" },
//               { tag: "Inspiration", date: "August 7, 2022", title: "There’s an actual science to create good music.",      href: "blog-details.html", imageUrl: "" }
//             ],
//             allHref: "blog.html"
//           }
//         },

//         /* ===== CONTACT ===== */
//         {
//           type: "contact",
//           title: "Contact",
//           parentSlug: "home",
//           order: 7,
//           content: {
//             subtitle: "- Contact Us",
//             titleStrong: "Get In",
//             titleLight: "Touch",
//             buttonText: "Let's Talk",
//             formAction: "https://ui-themez.smartinnovates.net/items/bayone1/contact.php"
//           }
//         },

//         /* ===== FOOTER ===== */
//         {
//           type: "footer",
//           title: "Footer",
//           parentSlug: "home",
//           order: 8,
//           content: {
//             topSubtitle: "we would love to hear from you.",
//             emailHref: "mailto:hello@Bayone.com",
//             emailLabel: "hello@Bayone.com",
//             logoUrl: "assets/imgs/logo-light.png",
//             social: [
//               { label: "Facebook", href: "#0" },
//               { label: "twitter",  href: "#0" },
//               { label: "LinkedIn", href: "#0" },
//               { label: "Behance",  href: "#0" }
//             ],
//             officeAddress: "Besòs 1, 08174 Sant Cugat del Vallès, Barcelona",
//             officePhone: "+2 456 34324 45",
//             officePhoneHref: "tel:+24563432445",
//             links: [
//               { label: "FAQ",        href: "about.html" },
//               { label: "Careers",    href: "about.html" },
//               { label: "Contact Us", href: "contact.html" }
//             ],
//             copyrightHtml:
//               '© 2023 Bayone is Proudly Powered by <span class="underline"><a href="https://themeforest.net/user/ui-themez" target="_blank">Ui-ThemeZ</a></span>'
//           }
//         }
//       ]
//     },
//     { new: true, upsert: true }
//   );

//   console.log(`✅ Seeded Bayone defaults into templateId: ${TEMPLATE_ID}`);
//   await mongoose.disconnect();
// }

// main().catch((e) => {
//   console.error(e);
//   process.exit(1);
// });























import "dotenv/config";
import mongoose from "mongoose";
import { TemplateModel } from "../models/Template";

async function main() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/project1");

  const TEMPLATE_ID = "sir-template-1";

  await TemplateModel.findOneAndUpdate(
    { templateId: TEMPLATE_ID },
    {
      templateId: TEMPLATE_ID,
      name: "Sir Template (Bayone defaults)",
      version: 1,
      defaultSections: [
        /* ================= PAGE ROOT ================= */
        { type: "page", title: "Home", slug: "home", order: 0 },

        /* ================= HERO (now with video) ================= */
        {
          type: "hero",
          title: "Hero",
          parentSlug: "home",
          order: 0,
          content: {
            heading: "Branding, websites and digital experiences…",
            imageUrl: "",
            videoUrl: "assets/vid/vid-startup.mp4",            // 👈 use your local video
            posterUrl: "assets/imgs/works/full/1.jpg"          // 👈 optional hero poster
          }
        },

        /* ================= ABOUT (keeps video) ================= */
        {
          type: "about",
          title: "About",
          parentSlug: "home",
          order: 1,
          content: {
            label: "About Us",
            introHtml: "",
            video: { src: "assets/vid/vid-startup.mp4" },
            services: [
              { label: "01", tag: "",         title: "Branding & Design",      href: "about.html" },
              { label: "02", tag: "Branding", title: "Brand Strategy & Voice", href: "about.html" },
              { label: "03", tag: "Design",   title: "Digital & Web Design",   href: "about.html" }
            ]
          }
        },

        /* ================= WORKS / PANELS ================= */
        {
          type: "works",
          title: "Works",
          parentSlug: "home",
          order: 2,
          content: {
            items: [
              { tag: "Digital Design", title: "Retouch Photo",       year: "2023", imageUrl: "assets/imgs/works/full/1.jpg", href: "project1.html" },
              { tag: "Branding",       title: "Earthmade Aroma",     year: "2023", imageUrl: "assets/imgs/works/full/2.jpg", href: "project2.html" },
              { tag: "Branding",       title: "Bank Rebranding",     year: "2023", imageUrl: "assets/imgs/works/full/3.jpg", href: "project3.html" },
              { tag: "Product Design", title: "The joy of music",     year: "2023", imageUrl: "assets/imgs/works/full/4.jpg", href: "project4.html" },
              { tag: "Digital Art",    title: "Blue Adobe MAX",       year: "2023", imageUrl: "assets/imgs/works/full/5.jpg", href: "project1.html" },
              { tag: "Web Design",     title: "Carved Wood",          year: "2023", imageUrl: "assets/imgs/works/full/6.jpg", href: "project3.html" }
            ]
          }
        },

        /* ================= MARQUEE ================= */
        {
          type: "marquee",
          title: "Marquee",
          parentSlug: "home",
          order: 3,
          content: {
            items: [
              "UI-UX Experience",
              "Web Development",
              "Digital Marketing",
              "Product Design",
              "Mobile Solutions"
            ].map(t => ({ text: t, icon: "*" }))
          }
        },

        /* ================= BRANDS ================= */
        {
          type: "brands",
          title: "Brands",
          parentSlug: "home",
          order: 4,
          content: {
            items: [
              { imageUrl: "assets/imgs/brands/01.png", href: "#0", alt: "Brand 1" },
              { imageUrl: "assets/imgs/brands/02.png", href: "#0", alt: "Brand 2" },
              { imageUrl: "assets/imgs/brands/03.png", href: "#0", alt: "Brand 3" },
              { imageUrl: "assets/imgs/brands/04.png", href: "#0", alt: "Brand 4" },
              { imageUrl: "assets/imgs/brands/05.png", href: "#0", alt: "Brand 5" }
            ]
          }
        },

        /* ================= SERVICES (accordion) ================= */
        {
          type: "services",
          title: "Services",
          parentSlug: "home",
          order: 5,
          content: {
            label: "Services",
            heading: { pre: "What We", emphasis: "Do" },
            services: [
              { title: "The Power of Influencer Marketing", description: "Taken possession of my entire soul, like these sweet mornings of spring which i enjoy with my whole." },
              { title: "Unique and Influential Design",     description: "Taken possession of my entire soul, like these sweet mornings of spring which i enjoy with my whole." },
              { title: "We Build and Activate Brands",       description: "Taken possession of my entire soul, like these sweet mornings of spring which i enjoy with my whole." },
              { title: "Unique and Influential Design",     description: "Taken possession of my entire soul, like these sweet mornings of spring which i enjoy with my whole." }
            ]
          }
        },

        /* ================= BLOG (now with images) ================= */
        {
          type: "blog",
          title: "Blog",
          parentSlug: "home",
          order: 6,
          content: {
            label: "News",
            heading: { pre: "Blog &", emphasis: "Insights" },
            items: [
              { tag: "Inspiration", date: "August 7, 2022", title: "Utilizing mobile technology in the field.",            href: "blog-details.html", imageUrl: "assets/imgs/blog/b1.jpg" },
              { tag: "Inspiration", date: "August 7, 2022", title: "Working from home? Let’s get started.",                href: "blog-details.html", imageUrl: "assets/imgs/blog/b2.jpg" },
              { tag: "Inspiration", date: "August 7, 2022", title: "There’s an actual science to create good music.",      href: "blog-details.html", imageUrl: "assets/imgs/blog/b3.jpg" }
            ],
            allHref: "blog.html"
          }
        },

        /* ================= CONTACT ================= */
        {
          type: "contact",
          title: "Contact",
          parentSlug: "home",
          order: 7,
          content: {
            subtitle: "- Contact Us",
            titleStrong: "Get In",
            titleLight: "Touch",
            buttonText: "Let's Talk",
            formAction: "https://ui-themez.smartinnovates.net/items/bayone1/contact.php"
          }
        },

        /* ================= FOOTER ================= */
        {
          type: "footer",
          title: "Footer",
          parentSlug: "home",
          order: 8,
          content: {
            topSubtitle: "we would love to hear from you.",
            emailHref: "mailto:hello@Bayone.com",
            emailLabel: "hello@Bayone.com",
            logoUrl: "assets/imgs/logo-light.png",
            social: [
              { label: "Facebook", href: "#0" },
              { label: "twitter",  href: "#0" },
              { label: "LinkedIn", href: "#0" },
              { label: "Behance",  href: "#0" }
            ],
            officeAddress: "Besòs 1, 08174 Sant Cugat del Vallès, Barcelona",
            officePhone: "+2 456 34324 45",
            officePhoneHref: "tel:+24563432445",
            links: [
              { label: "FAQ",        href: "about.html" },
              { label: "Careers",    href: "about.html" },
              { label: "Contact Us", href: "contact.html" }
            ],
            copyrightHtml:
              '© 2023 Bayone is Proudly Powered by <span class="underline"><a href="https://themeforest.net/user/ui-themez" target="_blank">Ui-ThemeZ</a></span>'
          }
        }
      ]
    },
    { new: true, upsert: true }
  );

  console.log(`✅ Seeded Bayone defaults into templateId: ${TEMPLATE_ID}`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
