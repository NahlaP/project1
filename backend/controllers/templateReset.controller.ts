


// backend/controllers/templateReset.controller.ts
import { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

/* ---- explicit override models (sir-template style) ---- */
import HeroSection from "../models/HeroSection";
import About from "../models/About";
import Projects from "../models/Projects";
import Marquee from "../models/Marquee";
import Brands from "../models/Brands";
import Service from "../models/Service";
import Blog from "../models/Blog";
import Contact from "../models/Contact";
import Footer from "../models/Footer";

/* ---- gym-template explicit content models ---- */
import Appointment from "../models/Appointment";
import TeamMember from "../models/TeamMember";

/* ---- other explicit content you added ---- */
import WhyChooseUs from "../models/WhyChooseUs";
import Testimonial from "../models/Testimonial";
import Topbar from "../models/Topbar";
import Navbar from "../models/Navbar";

/* ---- versioned Template model ---- */
import { TemplateModel } from "../models/TemplateV";

/* ---- optional models (layout container) ---- */
let SectionModel: any = null;
let PageModel: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const m = require("../models/Section");
  SectionModel = m?.default ?? m;
} catch {}
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const p = require("../models/Page");
  PageModel = p?.default ?? p;
} catch {}

/* ---------------- helpers ---------------- */
const ids = (req: Request) => ({
  userId: (req.params as any).userId,
  templateId: (req.params as any).templateId,
});

const HIDE_WORKS = false;


/**
 * Canonicalizes section type names to the ones your editor expects.
 */
function canonicalType(t: string) {
  const s = String(t || "").toLowerCase().trim();
  if (s === "works") return "projects";
  if (s === "clients") return "brands";
  if (s === "servicesaccordion") return "services";
  if (s === "bloglist") return "blog";
  if (s === "testimonial") return "testimonials";
  if (s === "feature") return "features";
  return s;
}

function normalizeTypeForDashboard(row: any) {
  if (!row || typeof row !== "object") return row;
  const out: any = { ...row };
  const t = canonicalType(out.type);
  out.type = t;
  if (t === "projects" && (!out.title || /^works$/i.test(String(out.title))))
    out.title = "Projects";
  if (t === "brands" && (!out.title || /^clients$/i.test(String(out.title))))
    out.title = "Brands";
  if (t === "services" && (!out.title || /services.*accordion/i.test(String(out.title || ""))))
    out.title = "Services";
  if (t === "blog" && (!out.title || /^blog\s*list$/i.test(String(out.title || ""))))
    out.title = "Blog";
  return out;
}

function normalizeListForDashboard(rows: any[]) {
  const list = Array.isArray(rows) ? rows.map(normalizeTypeForDashboard) : [];
  return HIDE_WORKS ? list.filter((r) => canonicalType(r.type) !== "projects") : list;
}

function pickSafeSectionFields(s: any, fallbackOrder: number) {
  return {
    type: canonicalType(s?.type || "unknown"),
    title: s?.title || undefined,
    slug: s?.slug || undefined,
    order: typeof s?.order === "number" ? s.order : fallbackOrder,
    parentPageId: s?.parentPageId || undefined,
    content: s?.content ?? {},
    collapsed: !!s?.collapsed,
  };
}

/** Resolve/create the *same* Home page your editor uses. */
async function ensureHomePageId(userId: string, templateId: string) {
  if (PageModel) {
    let home =
      (await PageModel.findOne({
        userId,
        templateId,
        $or: [{ isHome: true }, { slug: "home" }, { title: "Home" }],
      })) || null;

    if (!home) {
      home = await PageModel.create({
        userId,
        templateId,
        title: "Home",
        slug: "home",
        isHome: true,
        order: 0,
      });
    }
    return { ok: true as const, id: String(home._id) };
  }

  if (!SectionModel) return { ok: false as const, reason: "Section model not found" };

  let homeSec =
    (await SectionModel.findOne({
      userId,
      templateId,
      type: "page",
      $or: [{ slug: "home" }, { title: /home/i }],
    })) || null;

  if (!homeSec) {
    homeSec = await SectionModel.create({
      userId,
      templateId,
      type: "page",
      title: "Home",
      slug: "home",
      order: 0,
      content: {},
    });
  }

  return { ok: true as const, id: String(homeSec._id) };
}

/** Choose defaults from versions or legacy field. */
function pickVersionDefaults(tpl: any, verTag?: string): any[] {
  if (Array.isArray(tpl?.versions) && tpl.versions.length) {
    const fromQuery =
      verTag && tpl.versions.find((v: any) => String(v.tag) === String(verTag));
    const fromCurrent =
      !fromQuery &&
      tpl.currentTag &&
      tpl.versions.find((v: any) => String(v.tag) === String(tpl.currentTag));
    const chosen = fromQuery || fromCurrent || tpl.versions[0];
    if (Array.isArray(chosen?.defaultSections)) return chosen.defaultSections;
  }
  if (Array.isArray(tpl?.defaultSections)) return tpl.defaultSections;
  return [];
}

/* ---------------- controller ---------------- */
export const resetTemplateOverrides = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const verTag = String((req.query?.ver ?? "") as string).trim() || undefined;

    /**
     * SECTION KEYS
     * - model != null  => explicit content collection we should wipe on reset
     * - model == null  => layout-only (content comes from TemplateV -> Section layout)
     */
    const ALL: Array<{ key: string; label: string; model: any | null }> = [
      { key: "hero",         label: "Hero",           model: HeroSection },
      { key: "about",        label: "About",          model: About },
      { key: "projects",     label: "Projects",       model: Projects },
      { key: "marquee",      label: "Marquee",        model: Marquee },
      { key: "brands",       label: "Brands",         model: Brands },
      { key: "services",     label: "Services",       model: Service },
      { key: "blog",         label: "Blog",           model: Blog },
      { key: "contact",      label: "Contact",        model: Contact },
      { key: "footer",       label: "Footer",         model: Footer },

      // gym-template explicit content models
      { key: "appointment",  label: "Appointment",    model: Appointment },
      { key: "team",         label: "Team",           model: TeamMember },

      // 🔒 now also explicit content models you added
      { key: "whychooseus",  label: "Why Choose Us",  model: WhyChooseUs },
      { key: "testimonials", label: "Testimonials",   model: Testimonial },

      // 🔧 UI chrome (optional): allow clearing on demand via ?only=topbar,navbar
      { key: "topbar",       label: "Topbar",         model: Topbar },
      { key: "navbar",       label: "Navbar",         model: Navbar },

      // gym-template layout-only types (no separate collections)
      { key: "features",     label: "Features",       model: null },

      // virtual
      { key: "layout",       label: "Page Layout",    model: null },
    ];

    // Parse ?only=... and ?skipLayout=...
    const onlyParam = String((req.query?.only ?? "") as string).trim();
    const skipLayout = /^(1|true|yes)$/i.test(String(req.query?.skipLayout ?? ""));
    let targets = ALL;

    if (onlyParam) {
      const allow = new Set(
        onlyParam
          .split(",")
          .map((s) => canonicalType(s))
          .filter(Boolean)
      );
      targets = ALL.filter((s) => allow.has(s.key));
      if (targets.length === 0) {
        return res.status(400).json({
          ok: false,
          error:
            "No valid sections in 'only'. Valid keys: " +
            ALL.map((s) => s.key).join(", "),
        });
      }
    }

    // 1) Wipe user overrides for explicit models (including new ones)
    const dataTargets = targets.filter((t) => t.model);
    if (dataTargets.length) {
      await Promise.allSettled(
        dataTargets.map((t) => t.model!.deleteMany({ userId, templateId }))
      );
    }

    // Determine if we also reseed layout
    const includesAnyLayoutOnly = targets.some((t) => !t.model);
    const wantsLayout =
      (!onlyParam && !skipLayout) ||
      targets.some((t) => t.key === "layout") ||
      includesAnyLayoutOnly;

    if (!wantsLayout) {
      return res.json({
        ok: true,
        message: "✅ Content overrides cleared. Layout reseed skipped.",
        userId,
        templateId,
      });
    }

    if (!SectionModel) {
      return res.status(400).json({
        ok: false,
        error: "Section model not found; cannot reseed layout.",
      });
    }

    // 2) Reseed layout from TemplateV
    const home = await ensureHomePageId(userId, templateId);
    if (!home.ok || !home.id) {
      return res.status(400).json({
        ok: false,
        error: home.reason || "Could not resolve Home page id",
      });
    }

    const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
    if (!tpl) return res.status(404).json({ ok: false, error: "Template not found" });

    const defaultsRaw = pickVersionDefaults(tpl, verTag);
    if (!defaultsRaw.length) {
      return res.status(404).json({
        ok: false,
        error: "No defaultSections found for this template/version.",
      });
    }

    // Normalize list → canonical types, keep order, optionally filter by ?only=...
    const allowSet =
      onlyParam
        ? new Set(
            onlyParam
              .split(",")
              .map((s) => canonicalType(s))
              .filter(Boolean)
          )
        : null;

    const normalizedAll = normalizeListForDashboard(
      defaultsRaw
        .map((s: any, idx: number) =>
          pickSafeSectionFields({ ...s, content: s?.content ?? {} }, idx)
        )
        .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
    );

    const normalized = allowSet
      ? normalizedAll.filter((r) => allowSet.has(canonicalType(r.type)))
      : normalizedAll;

    // Remove existing layout rows for this (user, template, page)
    await SectionModel.deleteMany({
      userId,
      templateId,
      parentPageId: home.id,
      ...(allowSet
        ? { type: { $in: Array.from(allowSet.values()) } }
        : {}),
    });

    // Insert new layout rows (only what we keep)
    const docs = normalized.map((s) => ({
      userId,
      templateId,
      ...s,
      parentPageId: home.id,
    }));
    const inserted = docs.length ? await SectionModel.insertMany(docs) : [];

    return res.json({
      ok: true,
      message:
        "✅ Template reset complete. Pulled content + section order from version defaults.",
      userId,
      templateId,
      layout: {
        ok: true,
        parentPageId: home.id,
        versionUsed: verTag || tpl?.currentTag || (tpl?.versions?.[0]?.tag ?? "legacy"),
        inserted: inserted?.length || 0,
        filteredByOnly: !!allowSet,
      },
    });
  } catch (e) {
    console.error("resetTemplateOverrides error:", e);
    return res.status(500).json({ ok: false, error: "Failed to reset template overrides" });
  }
};

















