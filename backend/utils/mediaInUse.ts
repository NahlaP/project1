// backend/utils/mediaInUse.ts
import Section from "../models/Section"; // unified sections (if still used)
import HeroSection from "../models/HeroSection";
import About from "../models/About";
import Service from "../models/Service";
import WhyChooseUs from "../models/WhyChooseUs";
import TeamMember from "../models/TeamMember";
import Testimonial from "../models/Testimonial";
import Footer from "../models/Footer";
import Navbar from "../models/Navbar";
import Topbar from "../models/Topbar";
import Projects from "../models/Projects";
import Blog from "../models/Blog";
import Brands from "../models/Brands";
import Appointment from "../models/Appointment";
import ContactInfo from "../models/Contact";
import Media from "../models/Media";

type UsedIn = {
  source: string;
  id: any;
  field?: string;
  title?: string;
  extra?: any;
};

export async function checkMediaInUse(mediaId: string) {
  const media = await Media.findById(mediaId).lean();
  if (!media) return { inUse: false, usedIn: [] as UsedIn[] };

  // token list from any possible field names
  const tokenList = [
    (media as any).key,
    (media as any).url,

    (media as any).imageKey,
    (media as any).imageUrl,

    (media as any).videoKey,
    (media as any).posterKey,
  ].filter(Boolean);

  if (tokenList.length === 0) {
    return { inUse: false, usedIn: [] as UsedIn[] };
  }

  const usedIn: UsedIn[] = [];

  /* ----------------------------- Helper ----------------------------- */
  const pushMatches = (source: string, docs: any[], field?: string, extraBuilder?: (d:any)=>any) => {
    for (const d of docs) {
      usedIn.push({
        source,
        id: d._id,
        field,
        title: d.title || d.name || source,
        extra: extraBuilder ? extraBuilder(d) : undefined,
      });
    }
  };

  /* ----------------------------- 1) Unified Section ----------------------------- */
  try {
    const sections = await Section.find({
      $or: tokenList.map((t) => ({
        $or: [
          { "content.imageUrl": t },
          { "content.imageKey": t },
          { "content.bgImageUrl": t },
          { "content.backgroundImage": t },
          { "content.logoUrl": t },
          { "content.videoKey": t },
          { "content.posterKey": t },
          { content: { $regex: t, $options: "i" } }, // fallback
        ],
      })),
    })
      .select("_id type title slug content")
      .lean();

    pushMatches("section", sections, "content/*", (s) => ({
      type: s.type,
      slug: s.slug,
    }));
  } catch {
    // if you ever remove Section model, ignore
  }

  /* ----------------------------- 2) Hero ----------------------------- */
  const heroMatches = await HeroSection.find({
    $or: tokenList.flatMap((t) => [
      { imageUrl: t },
      { videoKey: t },
      { posterKey: t },
      { content: { $regex: t, $options: "i" } },
    ]),
  })
    .select("_id userId templateId")
    .lean();

  pushMatches("hero", heroMatches, "imageUrl/videoKey/posterKey");

  /* ----------------------------- 3) About ----------------------------- */
  const aboutMatches = await About.find({
    $or: tokenList.flatMap((t) => [
      { imageUrl: t },
      { description: { $regex: t, $options: "i" } },
      { highlight: { $regex: t, $options: "i" } },
    ]),
  })
    .select("_id title imageUrl")
    .lean();

  pushMatches("about", aboutMatches, "imageUrl");

  /* ----------------------------- 4) Services ----------------------------- */
  const serviceMatches = await Service.find({
    $or: tokenList.map((t) => ({
      services: { $elemMatch: { imageUrl: t } },
    })),
  })
    .select("_id services")
    .lean();

  pushMatches("services", serviceMatches, "services[].imageUrl");

  /* ----------------------------- 5) WhyChooseUs (bg image) ----------------------------- */
  const whyChooseMatches = await WhyChooseUs.find({
    $or: tokenList.flatMap((t) => [
      { bgImageUrl: t },
      { description: { $regex: t, $options: "i" } },
    ]),
  })
    .select("_id bgImageUrl")
    .lean();

  pushMatches("whyChooseUs", whyChooseMatches, "bgImageUrl");

  /* ----------------------------- 6) Team Members ----------------------------- */
  const teamMatches = await TeamMember.find({
    $or: tokenList.flatMap((t) => [
      { imageUrl: t },
      { name: { $regex: t, $options: "i" } },
    ]),
  })
    .select("_id name imageUrl")
    .lean();

  pushMatches("team", teamMatches, "imageUrl", (d) => ({ name: d.name }));

  /* ----------------------------- 7) Testimonials ----------------------------- */
  const testimonialMatches = await Testimonial.find({
    $or: tokenList.flatMap((t) => [
      { imageUrl: t },
      { message: { $regex: t, $options: "i" } },
    ]),
  })
    .select("_id name imageUrl")
    .lean();

  pushMatches("testimonial", testimonialMatches, "imageUrl", (d) => ({ name: d.name }));

  /* ----------------------------- 8) Footer ----------------------------- */
  const footerMatches = await Footer.find({
    $or: tokenList.flatMap((t) => [
      { logoUrl: t },
      { copyrightHtml: { $regex: t, $options: "i" } },
    ]),
  })
    .select("_id logoUrl")
    .lean();

  pushMatches("footer", footerMatches, "logoUrl");

  /* ----------------------------- 9) Navbar (rare, but check anyway) ----------------------------- */
  const navbarMatches = await Navbar.find({
    $or: tokenList.map((t) => ({
      $or: [
        { items: { $elemMatch: { href: { $regex: t, $options: "i" } } } },
        { items: { $elemMatch: { label: { $regex: t, $options: "i" } } } },
      ],
    })),
  })
    .select("_id items")
    .lean();

  if (navbarMatches.length) {
    pushMatches("navbar", navbarMatches, "items[].href/label");
  }

  /* ----------------------------- 10) Topbar ----------------------------- */
  const topbarMatches = await Topbar.find({
    $or: tokenList.flatMap((t) => [
      { logoUrl: t },
      { email: { $regex: t, $options: "i" } },
      { address: { $regex: t, $options: "i" } },
    ]),
  })
    .select("_id logoUrl")
    .lean();

  pushMatches("topbar", topbarMatches, "logoUrl");

  /* ----------------------------- 11) Projects ----------------------------- */
  const projectsMatches = await Projects.find({
    $or: tokenList.map((t) => ({
      projects: { $elemMatch: { imageUrl: t } },
    })),
  })
    .select("_id projects")
    .lean();

  pushMatches("projects", projectsMatches, "projects[].imageUrl");

  /* ----------------------------- 12) Blog ----------------------------- */
  const blogMatches = await Blog.find({
    $or: tokenList.map((t) => ({
      items: { $elemMatch: { imageUrl: t } },
    })),
  })
    .select("_id items")
    .lean();

  pushMatches("blog", blogMatches, "items[].imageUrl");

  /* ----------------------------- 13) Brands ----------------------------- */
  const brandsMatches = await Brands.find({
    $or: tokenList.map((t) => ({
      items: { $elemMatch: { imageUrl: t } },
    })),
  })
    .select("_id items")
    .lean();

  pushMatches("brands", brandsMatches, "items[].imageUrl");

  /* ----------------------------- 14) Appointment (backgroundImage) ----------------------------- */
  const appointmentMatches = await Appointment.find({
    $or: tokenList.flatMap((t) => [
      { backgroundImage: t },
      { title: { $regex: t, $options: "i" } },
    ]),
  })
    .select("_id backgroundImage")
    .lean();

  pushMatches("appointment", appointmentMatches, "backgroundImage");

  /* ----------------------------- 15) ContactInfo (no images now but safe regex) ----------------------------- */
  const contactMatches = await ContactInfo.find({
    $or: tokenList.map((t) => ({
      $or: [
        { subtitle: { $regex: t, $options: "i" } },
        { titleStrong: { $regex: t, $options: "i" } },
        { titleLight: { $regex: t, $options: "i" } },
      ],
    })),
  })
    .select("_id")
    .lean();

  if (contactMatches.length) {
    pushMatches("contact", contactMatches, "text-fields");
  }

  return { inUse: usedIn.length > 0, usedIn };
}
