/* eslint-disable no-console */
import "dotenv/config";
import mongoose from "mongoose";
import { TemplateModel } from "../models/Template";

async function main() {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/project1";
  await mongoose.connect(MONGO_URI);

  // MUST match window.APP_TEMPLATE_ID in your gym page-loader
  const TEMPLATE_ID = "gym-template-1";

  // NOTE:
  // Your page-loader expects section *types*:
  //  hero, about, whychooseus, services, appointment, team, testimonials, contact
  // And it requests API paths:
  //  /hero, /about, /whychoose, /services, /appointment, /team, /testimonial (singular in your code), /contact-info
  // This seed gives defaultSections using those types and the content shapes your renderers use.

  await TemplateModel.findOneAndUpdate(
    { templateId: TEMPLATE_ID },
    {
      templateId: TEMPLATE_ID,
      name: "Gym Template (Weldork defaults)",
      version: 1,
      defaultSections: [
        /* ===== PAGE ROOT ===== */
        {
          type: "page",
          title: "Home",
          slug: "home-page",              // your loader falls back to "home-page" if no slug is provided
          order: 0,
          parentPageId: null,
          visible: true,
          content: {},
        },

        /* ===== HERO ===== */
        {
          type: "hero",
          title: "Hero",
          order: 1,
          parentPageId: null,
          visible: true,
          content: {
            // rHero reads: title, imageUrl|imageKey|image.url
            title: "Welding & Fabrication Experts For Every Heavy-Duty Job",
            imageUrl: "img/carousel-1.jpg",  // can be local or S3 key
          },
        },

        /* ===== ABOUT ===== */
        {
          type: "about",
          title: "About",
          order: 2,
          parentPageId: null,
          visible: true,
          content: {
            // rAbout reads: title, description, bullets[], highlight, imageUrl|imageKey
            title: "Precision Welding. Industrial Reliability.",
            description:
              "We provide certified welding services for structural steel, pipelines, pressure vessels and custom fabrication. On-site or in-shop, our AWS-certified team delivers on time and to spec.",
            bullets: [
              "AWS & ASME Certified Welders",
              "MIG / TIG / Stick / Flux-Core",
              "Mobile Welding Units (24/7)",
              "CNC Plasma & Custom Fabrication",
            ],
            highlight: "10+ Years Serving Construction & Manufacturing",
            imageUrl: "img/about.jpg",
          },
        },

        /* ===== WHY CHOOSE US (your loader uses 'whychooseus') ===== */
        {
          type: "whychooseus",
          title: "Why Choose Us",
          order: 3,
          parentPageId: null,
          visible: true,
          content: {
            // rWhyChoose reads: title, description, stats[], progressBars[], bgImageUrl|bgImageKey, bgOverlay
            title: "Built For Harsh Conditions. Proven In The Field.",
            description:
              "From heavy equipment repairs to architectural metalwork, we combine certified procedures with robust QA to keep your operations safe and running.",
            stats: [
              { value: "1,200+", label: "Projects Completed" },
              { value: "98%", label: "On-time Delivery" },
              { value: "24/7", label: "Emergency Service" },
              { value: "50+", label: "Industrial Clients" },
            ],
            progressBars: [
              { label: "Structural Steel", percent: 95 },
              { label: "Stainless & Aluminum", percent: 90 },
              { label: "Pipe Welding", percent: 92 },
            ],
            bgImageUrl: "img/feature-bg.jpg",
            bgOverlay: 0.5,
          },
        },

        /* ===== SERVICES ===== */
        {
          type: "services",
          title: "Services",
          order: 4,
          parentPageId: null,
          visible: true,
          content: {
            // rServices reads: title, services[{ title, description, imageUrl|imageKey, buttonText, buttonHref }]
            title: "Our Welding & Fabrication Services",
            services: [
              {
                title: "Structural Welding",
                description:
                  "Certified on-site and shop welding for beams, columns, platforms, mezzanines, stairs, and railings.",
                imageUrl: "img/service-1.jpg",
                buttonText: "Read More",
                buttonHref: "#",
              },
              {
                title: "Pipe Welding",
                description:
                  "High-integrity pipe welding for water, gas, and process lines. GTAW/SMAW/GMAW/FCAW procedures.",
                imageUrl: "img/service-2.jpg",
                buttonText: "Read More",
                buttonHref: "#",
              },
              {
                title: "Stainless & Aluminum",
                description:
                  "Hygienic TIG welding for food-grade & pharmaceutical applications. Sanitary tubing & vessels.",
                imageUrl: "img/service-3.jpg",
                buttonText: "Read More",
                buttonHref: "#",
              },
              {
                title: "Custom Fabrication",
                description:
                  "CNC plasma cutting, forming and assemblies for brackets, guards, frames, and enclosures.",
                imageUrl: "img/service-4.jpg",
                buttonText: "Read More",
                buttonHref: "#",
              },
            ],
          },
        },

        /* ===== APPOINTMENT / CTA ===== */
        {
          type: "appointment",
          title: "Appointment",
          order: 5,
          parentPageId: null,
          visible: true,
          content: {
            // rAppointment reads: title, subtitle, backgroundImageUrl|backgroundImageKey
            title: "Book A Site Visit Or Send Your Drawings",
            subtitle:
              "Share your prints and specifications. We’ll quote quickly and schedule the earliest fabrication window.",
            backgroundImageUrl: "img/appointment-bg.jpg",
          },
        },

        /* ===== TEAM ===== */
        {
          type: "team",
          title: "Team",
          order: 6,
          parentPageId: null,
          visible: true,
          content: {
            // rTeam accepts: array OR { title, members: [...] }
            title: "Meet Our Certified Welders",
            members: [
              { name: "Michael Carter", role: "AWS D1.1 / D1.3 Welder", imageUrl: "img/team-1.jpg" },
              { name: "Sofia Patel", role: "TIG Specialist (Stainless)", imageUrl: "img/team-2.jpg" },
              { name: "Liam Chen", role: "Pipe Welder (ASME IX)", imageUrl: "img/team-3.jpg" },
              { name: "Ava Johnson", role: "Fabrication Lead", imageUrl: "img/team-4.jpg" },
            ],
          },
        },

        /* ===== TESTIMONIALS (your loader uses 'testimonials' and calls /testimonial or /testimonials — you have it singular in code) ===== */
        {
          type: "testimonials",
          title: "Testimonials",
          order: 7,
          parentPageId: null,
          visible: true,
          content: {
            // rTestimonials accepts: array OR { items: [...] }
            title: "What Our Clients Say",
            items: [
              {
                name: "Daniel M.",
                title: "Plant Manager",
                rating: 5,
                message:
                  "Fast response and solid workmanship. They kept our line running during a critical shutdown.",
                imageUrl: "img/testimonial-1.jpg",
              },
              {
                name: "Keira L.",
                title: "GC Superintendent",
                rating: 5,
                message:
                  "Field crew is professional and safe. Welds passed inspection without rework.",
                imageUrl: "img/testimonial-2.jpg",
              },
              {
                name: "Owen R.",
                title: "Maintenance Supervisor",
                rating: 5,
                message:
                  "Mobile unit arrived the same night and repaired our bucket in hours. Highly recommend.",
                imageUrl: "img/testimonial-3.jpg",
              },
              {
                name: "Santiago P.",
                title: "Facilities Director",
                rating: 5,
                message:
                  "Quality stainless TIG for our process area. Great finish and cleanliness.",
                imageUrl: "img/testimonial-4.jpg",
              },
            ],
          },
        },

        /* ===== CONTACT (your loader renders footer via rContact) ===== */
        {
          type: "contact",
          title: "Contact",
          order: 8,
          parentPageId: null,
          visible: true,
          content: {
            // rContact reads: title, address/office, phone, email, socialLinks{}, businessHours{}, copyright
            title: "Contact Us",
            address: "123 Industrial Ave, New York, NY 10001",
            phone: "+1 212 555 0199",
            email: "quotes@weldork.com",
            socialLinks: {
              facebook: "https://facebook.com",
              twitter: "https://twitter.com",
              youtube: "https://youtube.com",
              linkedin: "https://linkedin.com",
            },
            businessHours: {
              mondayToFriday: "09:00 am - 07:00 pm",
              saturday: "09:00 am - 12:00 pm",
              sunday: "Closed",
            },
            copyright: "WELDORK",
          },
        },
      ],
    },
    { new: true, upsert: true }
  );

  console.log(`✅ Seeded defaults for templateId: ${TEMPLATE_ID}`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
