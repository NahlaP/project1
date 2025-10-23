// import express from "express";
// import { resetTemplateOverrides } from "../controllers/templateReset.controller";

// const router = express.Router();


// router.post("/:userId/:templateId", resetTemplateOverrides);

// export default router;




// backend/routes/templatereset.routes.ts
import express from "express";
import { resetTemplateOverrides } from "../controllers/templateReset.controller";

const router = express.Router();

router.post("/:userId/:templateId", (req, res) => {
  return resetTemplateOverrides(req, res);
});

// Optional: guard other verbs
router.all("/:userId/:templateId", (_req, res) => {
  res.status(405).json({ ok: false, error: "Method Not Allowed" });
});

export default router;
