// backend/scripts/seed-gym-template.ts
import "dotenv/config";
import mongoose from "mongoose";
import { TemplateModel } from "../models/TemplateV";

async function main() {
  const MONGO = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ion7";
  await mongoose.connect(MONGO);

  const templateId = "gym-template-1"; // MUST match the card you select in dashboard
  const tag = "v1";
  const number = 1;

  const base =
    "https://ion7-templates.s3.ap-south-1.amazonaws.com/gym-template/v1/";

  const U = (...parts: string[]) =>
    base + parts.map((p) => String(p).replace(/^\/+/, "")).join("");

  const defaultSections = [
    {
      type: "hero",
      order: 1,
      content: {
        heading: "Best Metalcraft Solutions",
        subheading: "",
        ctaText: "Explore More",
        ctaHref: "#",
        imageUrl: U("img/carousel-1.jpg"),
      },
    },
    {
      type: "about",
      order: 2,
      content: {
        title: "Ultimate Welding and Quality Metal Solutions",
        text:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur tellus augue, iaculis id elit eget, ultrices pulvinar tortor.",
        imageUrl: U("img/about.jpg"),
        featuresInline: [
          { icon: "fa-users-cog", label: "Certified Expert & Team" },
          { icon: "fa-tachometer-alt", label: "Fast & Reliable Services" },
        ],
        checks: [
          "Many variations of passages of lorem ipsum",
          "Many variations of passages of lorem ipsum",
          "Many variations of passages of lorem ipsum",
        ],
        banner:
          "We’re Good in All Metal Works Using Quality Welding Tools",
      },
    },
   
    {
      type: "whychooseus",
      order: 4,
      content: {
        title:
          "Why You should Choose Our welding Services",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur tellus augue.",
        stats: [
          { label: "Satisfied Clients", value: 9999 },
          { label: "Complete Projects", value: 9999 },
        ],
        progress: [
          { label: "Experience", value: 90 },
          { label: "Work Done", value: 95 },
        ],
      },
    },
    {
  type: "services",
  order: 5,
  content: {
    title: "Reliable & High-Quality Welding Services",
    items: [
      {
        title: "Metal Works",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur tellus augue.",
        imageUrl: U("img/service-1.jpg"),
        href: "#",
        delay: ".1s",
      },
      {
        title: "Steel Welding",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur tellus augue.",
        imageUrl: U("img/service-2.jpg"),
        href: "#",
        delay: ".2s",
      },
      {
        title: "Pipe Welding",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur tellus augue.",
        imageUrl: U("img/service-3.jpg"),
        href: "#",
        delay: ".3s",
      },
      {
        title: "Custom Welding",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur tellus augue.",
        imageUrl: U("img/service-4.jpg"),
        href: "#",
        delay: ".4s",
      },
      {
        title: "Steel Welding",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur tellus augue.",
        imageUrl: U("img/service-5.jpg"),
        href: "#",
        delay: ".1s",
      },
      {
        title: "Metal Work",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur tellus augue.",
        imageUrl: U("img/service-6.jpg"),
        href: "#",
        delay: ".2s",
      },
      {
        title: "Custom Welding",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur tellus augue.",
        imageUrl: U("img/service-7.jpg"),
        href: "#",
        delay: ".3s",
      },
      {
        title: "Pipe Welding",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur tellus augue.",
        imageUrl: U("img/service-8.jpg"),
        href: "#",
        delay: ".4s",
      },
    ],
  },
},

    {
      type: "appointment",
      order: 6,
      content: {
        headingLeft:
          "We Complete Welding & Metal Projects in Time",
        descriptionLeft:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        officeAddress: "123 Street, New York, USA",
        officeTime: "Mon-Sat 09am-5pm, Sun Closed",
     backgroundImage: "assets/img/appointment-bg.jpg",
        form: {
          title: "Online Appointment",
          fields: [
            { name: "name", label: "Your Name", type: "text" },
            { name: "mail", label: "Your Email", type: "email" },
            { name: "mobile", label: "Your Mobile", type: "text" },
            {
              name: "service",
              label: "Choose A Service",
              type: "select",
              options: ["Steel Welding", "Pipe Welding"],
            },
            { name: "message", label: "Message", type: "textarea", rows: 5 },
          ],
          submitText: "Submit Now",
        },
      },
    },
    {
      type: "team",
      order: 7,
      content: {
        title: "Meet Our Professional and Experienced Welders",
        members: [
          { name: "Alex Robin", role: "Welder", imageUrl: U("img/team-1.jpg") },
          { name: "Andrew Bon", role: "Welder", imageUrl: U("img/team-2.jpg") },
          { name: "Martin Tompson", role: "Welder", imageUrl: U("img/team-3.jpg") },
          { name: "Clarabelle Samber", role: "Welder", imageUrl: U("img/team-4.jpg") },
        ],
      },
    },
{
  type: "testimonials",
  order: 8,
  content: {
    title: "What They’re Talking About Our Welding Work",
    items: [
      {
        name: "Client 1",
        role: "Profession",
        imageUrl: U("img/testimonial-1.jpg"),
        text: "Dolores sed duo clita tempor justo dolor.",
      },
      {
        name: "Client 2",
        role: "Profession",
        imageUrl: U("img/testimonial-2.jpg"),
        text: "Dolores sed duo clita tempor justo dolor.",
      },
      {
        name: "Client 3",
        role: "Profession",
        imageUrl: U("img/testimonial-3.jpg"),
        text: "Dolores sed duo clita tempor justo dolor.",
      },
      {
        name: "Client 4",
        role: "Profession",
        imageUrl: U("img/testimonial-4.jpg"),
        text: "Dolores sed duo clita tempor justo dolor.",
      },
    ],
  },
},

  {
  type: "contact",
  order: 9,
  content: {
    office: {
      address: "123 Street, New York, USA",
      phone: "+012 345 67890",
      email: "info@example.com",
      socials: [
        { icon: "fab fa-twitter", href: "#" },
        { icon: "fab fa-facebook-f", href: "#" },
        { icon: "fab fa-youtube", href: "#" },
        { icon: "fab fa-linkedin-in", href: "#" }
      ]
    },
    businessHours: [
      { label: "Monday - Friday", value: "09:00 am - 07:00 pm" },
      { label: "Saturday", value: "09:00 am - 12:00 pm" },
      { label: "Sunday", value: "Closed" }
    ],
    copyrightHtml:
      '&copy; <a href="#">Your Site Name</a>. Designed by <a href="https://htmlcodex.com">HTML Codex</a>'
  }
},

  ];

  // Upsert template & replace v1 cleanly
  await TemplateModel.updateOne(
    { templateId },
    {
      $setOnInsert: { templateId },
      $set: { currentTag: tag },
      $pull: { versions: { tag } }, // remove existing v1 if present
    },
    { upsert: true }
  );

  await TemplateModel.updateOne(
    { templateId },
    {
      $push: {
        versions: {
          tag,
          number,
          baseUrl: base,
          defaultSections,
        },
      },
    }
  );

  console.log(`✅ Seeded ${templateId} version ${tag} successfully`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
