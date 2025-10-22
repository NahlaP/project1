// // backend/scripts/seed-sir-defaults.ts
// import "dotenv/config";
// import mongoose from "mongoose";
// import { TemplateModel } from "../models/Template";

// async function main() {
//   const MONGO = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ion7";
//   await mongoose.connect(MONGO);

//   // IMPORTANT: this points to your PUBLIC, read-only Bayone deploy
//   const base = "https://ion7-templates.s3.ap-south-1.amazonaws.com/sir-template-1/v1/";

//   // Helper to make absolute URLs cleanly
//   const U = (...parts: string[]) =>
//     base + parts.map(p => String(p).replace(/^\/+/, "")).join("");

//   // ⚠️ Only set fields your code reads: type, order, content (free-form JSON).
//   // The controller already allows absolute http(s) URLs for defaults.
//   const defaultSections = [
//     /* 1) HERO (header + caption + video) */
//     {
//       type: "hero",
//       order: 1,
//       content: {
//         headline:
//           "Branding, websites and digital experiences, crafted with love, intelligence and precision.",
//         // The page uses a <video> in the first “about” block right after header.
//         // Keeping video here as well so your renderers can pull from hero if needed.
//         videoUrl: U("assets/vid/vid-startup.mp4"),
//         // posterUrl optional:
//         // posterUrl: U("assets/imgs/works/full/1.jpg")
//       }
//     },

//     /* 2) INTRO / ABOUT (the “- About Us” and three lines of text) */
//     {
//       type: "about",
//       order: 2,
//       content: {
//         subtitle: "- About Us",
//         lines: [
//           "We are a creative agency working with",
//           "brands – building insightful strategy,",
//           "creating unique designs."
//         ],
//         // The service inline list (Branding, Strategy, Web Design)
//         servicesInline: [
//           { no: "01", tag: "Branding", title: "Branding & Design", href: U("about.html") },
//           { no: "02", tag: "Branding", title: "Brand Strategy & Voice", href: U("about.html") },
//           { no: "03", tag: "Design",   title: "Digital & Web Design",  href: U("about.html") }
//         ],
//         // Same video used directly under About in your HTML
//         videoUrl: U("assets/vid/vid-startup.mp4")
//       }
//     },

//     /* 3) WORKS (horizontal panels with image + title + year + link) */
//     {
//       type: "works",
//       order: 3,
//       content: {
//         items: [
//           { imageUrl: U("assets/imgs/works/full/1.jpg"), category: "Digital Design", title: "Retouch Photo", year: "2023", href: U("project1.html") },
//           { imageUrl: U("assets/imgs/works/full/2.jpg"), category: "Branding",       title: "Earthmade Aroma", year: "2023", href: U("project2.html") },
//           { imageUrl: U("assets/imgs/works/full/3.jpg"), category: "Branding",       title: "Bank Rebranding", year: "2023", href: U("project3.html") },
//           { imageUrl: U("assets/imgs/works/full/4.jpg"), category: "Product Design", title: "The joy of music", year: "2023", href: U("project4.html") },
//           { imageUrl: U("assets/imgs/works/full/5.jpg"), category: "Digital Art",    title: "Blue Adobe MAX",  year: "2023", href: U("project1.html") },
//           { imageUrl: U("assets/imgs/works/full/6.jpg"), category: "Web Design",     title: "Carved Wood",     year: "2023", href: U("project3.html") }
//         ]
//       }
//     },

//     /* 4) MARQUEE (moving text list) */
//     {
//       type: "marquee",
//       order: 4,
//       content: {
//         rows: [
//           ["UI-UX Experience", "Web Development", "Digital Marketing", "Product Design", "Mobile Solutions"],
//           ["UI-UX Experience", "Web Development", "Digital Marketing", "Product Design", "Mobile Solutions"]
//         ],
//         icon: "*" // purely decorative
//       }
//     },

//     /* 5) BRANDS / CLIENTS (swiper of logos) */
//     {
//       type: "clients",
//       order: 5,
//       content: {
//         logos: [
//           U("assets/imgs/brands/01.png"),
//           U("assets/imgs/brands/02.png"),
//           U("assets/imgs/brands/03.png"),
//           U("assets/imgs/brands/04.png"),
//           U("assets/imgs/brands/05.png")
//         ].map(src => ({ src, href: "#0", alt: "Brand" }))
//       }
//     },

//     /* 6) SERVICES (accordion with 4 items + left “12+ Years” badge) */
//     {
//       type: "servicesAccordion",
//       order: 6,
//       content: {
//         leftStat: { value: "12+", label: "Years of Experience" },
//         subtitle: "- Services",
//         titleRich: "What We <span class='f-ultra-light'>Do</span> ?",
//         items: [
//           { title: "The Power of Influencer Marketing", text: "Taken possession of my entire soul, like these sweet mornings of spring which i enjoy with my whole." },
//           { title: "Unique and Influential Design",     text: "Taken possession of my entire soul, like these sweet mornings of spring which i enjoy with my whole." },
//           { title: "We Build and Activate Brands",      text: "Taken possession of my entire soul, like these sweet mornings of spring which i enjoy with my whole." },
//           { title: "Unique and Influential Design",     text: "Taken possession of my entire soul, like these sweet mornings of spring which i enjoy with my whole." }
//         ]
//       }
//     },

//     /* 7) BLOG LIST (3 items) */
//     {
//       type: "blogList",
//       order: 7,
//       content: {
//         subtitle: "- News",
//         titleRich: "Blog & <span class='f-ultra-light'>Insights</span>",
//         viewAllHref: U("blog.html"),
//         items: [
//           {
//             tag: "Inspiration",
//             date: "August 7, 2022",
//             title: "Utilizing mobile technology in the field.",
//             href: U("blog-details.html"),
//             imageUrl: U("assets/imgs/blog/b1.jpg")
//           },
//           {
//             tag: "Inspiration",
//             date: "August 7, 2022",
//             title: "Working from home? Let’s get started.",
//             href: U("blog-details.html"),
//             imageUrl: U("assets/imgs/blog/b2.jpg")
//           },
//           {
//             tag: "Inspiration",
//             date: "August 7, 2022",
//             title: "There’s an actual science to create good music.",
//             href: U("blog-details.html"),
//             imageUrl: U("assets/imgs/blog/b3.jpg")
//           }
//         ]
//       }
//     },

//     /* 8) CONTACT (form + heading) */
//     {
//       type: "contact",
//       order: 8,
//       content: {
//         subtitle: "- Contact Us",
//         titleRich: "Get In <span class='f-ultra-light'>Touch</span>.",
//         form: {
//           // your original action (leave as-is if you proxy)
//           action: "https://ui-themez.smartinnovates.net/items/bayone1/contact.php",
//           fields: [
//             { name: "name", type: "text",    placeholder: "Name",    required: true },
//             { name: "email", type: "email",  placeholder: "Email",   required: true },
//             { name: "message", type: "textarea", placeholder: "Message", required: true }
//           ],
//           submitText: "Let's Talk"
//         }
//       }
//     },

//     /* 9) FOOTER (email, social, address, links) */
//     {
//       type: "footer",
//       order: 9,
//       content: {
//         emailHeading: "we would love to hear from you.",
//         email: "hello@Bayone.com",
//         logoUrl: U("assets/imgs/logo-light.png"),
//         socials: [
//           { label: "Facebook", href: "#0" },
//           { label: "twitter",  href: "#0" },
//           { label: "LinkedIn", href: "#0" },
//           { label: "Behance",  href: "#0" }
//         ],
//         office: {
//           address: "Besòs 1, 08174 Sant Cugat del Vallès, Barcelona",
//           phone: "+2 456 34324 45"
//         },
//         footerLinks: [
//           { label: "FAQ",        href: U("about.html") },
//           { label: "Careers",    href: U("about.html") },
//           { label: "Contact Us", href: U("contact.html") }
//         ],
//         copyrightHtml:
//           "© 2023 Bayone is Proudly Powered by <span class=\"underline\"><a href=\"https://themeforest.net/user/ui-themez\" target=\"_blank\">Ui-ThemeZ</a></span>"
//       }
//     }
//   ];

//   await TemplateModel.updateOne(
//     { templateId: "sir-template-1" },
//     {
//       $set: {
//         templateId: "sir-template-1",
//         version: 1,
//         defaultSections
//       }
//     },
//     { upsert: true }
//   );

//   console.log("✅ Seeded sir-template-1 full defaults (hero + all sections, version=1)");
//   await mongoose.disconnect();
// }

// main().catch((e) => {
//   console.error(e);
//   process.exit(1);
// });












// import "dotenv/config";
// import mongoose from "mongoose";
// import { TemplateModel } from "../models/TemplateV";

// async function main() {
//   const MONGO = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ion7";
//   await mongoose.connect(MONGO);

//   const tag = "v1";
//   const number = 1;
//   const base = "https://ion7-templates.s3.ap-south-1.amazonaws.com/sir-template-1/v1/";

//   const U = (...parts: string[]) => base + parts.map(p => String(p).replace(/^\/+/, "")).join("");

//   const defaultSections = [
//     { type: "hero", order: 1, content: { headline:
//       "Branding, websites and digital experiences, crafted with love, intelligence and precision.",
//       videoUrl: U("assets/vid/vid-startup.mp4"),
//     }},
//     { type: "about", order: 2, content: {
//       subtitle: "- About Us",
//       lines: [
//         "We are a creative agency working with",
//         "brands – building insightful strategy,",
//         "creating unique designs."
//       ],
//       servicesInline: [
//         { no: "01", tag: "Branding", title: "Branding & Design", href: U("about.html") },
//         { no: "02", tag: "Branding", title: "Brand Strategy & Voice", href: U("about.html") },
//         { no: "03", tag: "Design",   title: "Digital & Web Design", href: U("about.html") },
//       ],
//       videoUrl: U("assets/vid/vid-startup.mp4"),
//     }},
//     { type: "works", order: 3, content: {
//       items: [
//         { imageUrl: U("assets/imgs/works/full/1.jpg"), category: "Digital Design", title: "Retouch Photo", year: "2023", href: U("project1.html") },
//         { imageUrl: U("assets/imgs/works/full/2.jpg"), category: "Branding", title: "Earthmade Aroma", year: "2023", href: U("project2.html") },
//         { imageUrl: U("assets/imgs/works/full/3.jpg"), category: "Branding", title: "Bank Rebranding", year: "2023", href: U("project3.html") },
//         { imageUrl: U("assets/imgs/works/full/4.jpg"), category: "Product Design", title: "The joy of music", year: "2023", href: U("project4.html") },
//         { imageUrl: U("assets/imgs/works/full/5.jpg"), category: "Digital Art", title: "Blue Adobe MAX", year: "2023", href: U("project1.html") },
//         { imageUrl: U("assets/imgs/works/full/6.jpg"), category: "Web Design", title: "Carved Wood", year: "2023", href: U("project3.html") },
//       ],
//     }},
//     { type: "marquee", order: 4, content: {
//       rows: [
//         ["UI-UX Experience", "Web Development", "Digital Marketing", "Product Design", "Mobile Solutions"],
//         ["UI-UX Experience", "Web Development", "Digital Marketing", "Product Design", "Mobile Solutions"],
//       ],
//       icon: "*",
//     }},
//     { type: "clients", order: 5, content: {
//       logos: [
//         U("assets/imgs/brands/01.png"),
//         U("assets/imgs/brands/02.png"),
//         U("assets/imgs/brands/03.png"),
//         U("assets/imgs/brands/04.png"),
//         U("assets/imgs/brands/05.png"),
//       ].map(src => ({ src, href: "#0", alt: "Brand" })),
//     }},
//     { type: "servicesAccordion", order: 6, content: {
//       leftStat: { value: "12+", label: "Years of Experience" },
//       subtitle: "- Services",
//       titleRich: "What We <span class='f-ultra-light'>Do</span> ?",
//       items: [
//         { title: "The Power of Influencer Marketing", text: "Taken possession of my entire soul, like these sweet mornings of spring which i enjoy with my whole." },
//         { title: "Unique and Influential Design",     text: "Taken possession of my entire soul, like these sweet mornings of spring which i enjoy with my whole." },
//         { title: "We Build and Activate Brands",      text: "Taken possession of my entire soul, like these sweet mornings of spring which i enjoy with my whole." },
//         { title: "Unique and Influential Design",     text: "Taken possession of my entire soul, like these sweet mornings of spring which i enjoy with my whole." },
//       ],
//     }},
//     { type: "blogList", order: 7, content: {
//       subtitle: "- News",
//       titleRich: "Blog & <span class='f-ultra-light'>Insights</span>",
//       viewAllHref: U("blog.html"),
//       items: [
//         { tag: "Inspiration", date: "August 7, 2022", title: "Utilizing mobile technology in the field.", href: U("blog-details.html"), imageUrl: U("assets/imgs/blog/b1.jpg") },
//         { tag: "Inspiration", date: "August 7, 2022", title: "Working from home? Let’s get started.",     href: U("blog-details.html"), imageUrl: U("assets/imgs/blog/b2.jpg") },
//         { tag: "Inspiration", date: "August 7, 2022", title: "There’s an actual science to create good music.", href: U("blog-details.html"), imageUrl: U("assets/imgs/blog/b3.jpg") },
//       ],
//     }},
//     { type: "contact", order: 8, content: {
//       subtitle: "- Contact Us",
//       titleRich: "Get In <span class='f-ultra-light'>Touch</span>.",
//       form: {
//         action: "https://ui-themez.smartinnovates.net/items/bayone1/contact.php",
//         fields: [
//           { name: "name", type: "text", placeholder: "Name", required: true },
//           { name: "email", type: "email", placeholder: "Email", required: true },
//           { name: "message", type: "textarea", placeholder: "Message", required: true },
//         ],
//         submitText: "Let's Talk",
//       },
//     }},
//     { type: "footer", order: 9, content: {
//       emailHeading: "we would love to hear from you.",
//       email: "hello@Bayone.com",
//       logoUrl: U("assets/imgs/logo-light.png"),
//       socials: [
//         { label: "Facebook", href: "#0" },
//         { label: "twitter",  href: "#0" },
//         { label: "LinkedIn", href: "#0" },
//         { label: "Behance",  href: "#0" },
//       ],
//       office: {
//         address: "Besòs 1, 08174 Sant Cugat del Vallès, Barcelona",
//         phone: "+2 456 34324 45",
//       },
//       footerLinks: [
//         { label: "FAQ",        href: U("about.html") },
//         { label: "Careers",    href: U("about.html") },
//         { label: "Contact Us", href: U("contact.html") },
//       ],
//       copyrightHtml:
//         "© 2023 Bayone is Proudly Powered by <span class=\"underline\"><a href=\"https://themeforest.net/user/ui-themez\" target=\"_blank\">Ui-ThemeZ</a></span>",
//     }},
//   ];

//   // upsert with versions[]
//   await TemplateModel.updateOne(
//     { templateId: "sir-template-1" },
//     {
//       $setOnInsert: { templateId: "sir-template-1" },
//       $set: { currentTag: tag },
//       $pull: { versions: { tag } },                      // remove existing v1 to replace cleanly
//     },
//     { upsert: true }
//   );

//   await TemplateModel.updateOne(
//     { templateId: "sir-template-1" },
//     {
//       $push: {
//         versions: {
//           tag,
//           number,
//           baseUrl: base,
//           defaultSections,
//         },
//       },
//     }
//   );

//   console.log("✅ Seeded sir-template-1 version v1 (full defaults)");
//   await mongoose.disconnect();
// }

// main().catch((e) => {
//   console.error(e);
//   process.exit(1);
// });
