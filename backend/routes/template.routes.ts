// og
// import { Router } from "express";
// import {
//   listTemplates,
//   upsertTemplate,
//   selectTemplate,
//   getUserSelectedTemplate,
// } from "../controllers/template.controller";

// const router = Router();

// router.get("/", listTemplates);                          // list
// router.post("/", upsertTemplate);                        // seed/update
// router.post("/:templateId/select", selectTemplate);      // select/switch
// router.get("/user/:userId/selected", getUserSelectedTemplate); // read selection

// export default router;





// // reset

// import { Router } from "express";
// import {
//   listTemplates,
//   upsertTemplate,
//   selectTemplate,
//   getUserSelectedTemplate,
//   resetTemplateForUser,          // ✅ ensure this name matches your export
// } from "../controllers/template.controller";

// const router = Router();

// router.get("/", listTemplates);
// router.post("/", upsertTemplate);
// router.post("/:templateId/select", selectTemplate);
// router.get("/user/:userId/selected", getUserSelectedTemplate);

// // ✅ reset to defaults
// router.post("/:templateId/reset", resetTemplateForUser);

// export default router;







// backend/routes/template.routes.ts
import { Router } from "express";
import {
  listTemplates,
  upsertTemplate,
  selectTemplate,
  getUserSelectedTemplate,
} from "../controllers/template.controller";

const router = Router();

router.get("/", listTemplates);
router.post("/", upsertTemplate);
router.post("/:templateId/select", selectTemplate);
router.get("/user/:userId/selected", getUserSelectedTemplate);

// ⛔️ removed the reset route entirely

export default router;
