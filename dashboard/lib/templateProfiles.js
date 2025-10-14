

export const TEMPLATE_PROFILES = {
  "sir-template-1": {
    hero: {
      fields: {
        heading: true,
        videoUrl: true,
        posterUrl: true,
        imageUrl: false, // sir-hero prefers video-only
        ctaText: false,
        ctaHref: false,
      },
    },
    about: {
      fields: {
        subtitle: true,
        title: true,
        lines: true,         // 3 lines
        description: true,
        highlight: true,
        imageUrl: false,     // sir-about prefers video
        videoUrl: true,
        posterUrl: true,
        imageAlt: false,
        services: true,      // 3 service tiles
        bullets: false,      // not used in this template
      },
    },
  },

  "gym-template-1": {
    hero: {
      fields: {
        heading: true,
        imageUrl: true,      // gym-hero prefers image
        videoUrl: false,
        posterUrl: false,
        ctaText: true,
        ctaHref: true,
      },
    },
    about: {
      fields: {
        subtitle: true,
        title: true,
        lines: false,        // not used for gym-about
        description: true,
        highlight: true,
        imageUrl: true,      // gym-about prefers image
        videoUrl: false,
        posterUrl: false,
        imageAlt: true,
        services: false,     // not used
        bullets: true,       // used by gym-about
      },
    },
  },
};

// Optional defaults shown when nothing exists yet (per template/section)
export const TEMPLATE_DEFAULTS = {
  "sir-template-1": {
    about: {
      subtitle: "- About Us",
      title: "brands – building insightful strategy\ncreating unique designs.",
      lines: ["building strategy", "creating unique designs", "since 2019"],
      videoUrl: "",
      posterUrl: "",
      description: "",
      highlight: "Your vision, our craft.",
      services: [
        { tag: "Branding", heading: "Branding & Design", href: "/about.html" },
        { tag: "Branding", heading: "Brand Strategy & Voice", href: "/about.html" },
        { tag: "Design",   heading: "Digital & Web Design",   href: "/about.html" },
      ],
    },
  },
  "gym-template-1": {
    about: {
      subtitle: "- About Us",
      title: "Train smart. Live strong.",
      imageUrl: "",
      imageAlt: "Gym About",
      description: "",
      highlight: "Start today.",
      bullets: [{ text: "" }, { text: "" }, { text: "" }],
    },
  },
};
