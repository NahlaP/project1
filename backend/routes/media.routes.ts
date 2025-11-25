// // backend/routes/media.routes.ts
// import { Router } from "express";
// import {
//   listMedia,
//   checkUsage,
//   deleteMedia,
//   downloadMedia,
// } from "../controllers/media.controller";

// const r = Router();

// /**
//  * ✅ list media using query params:
//  * /api/media?userId=...&templateId=...&type=image
//  */
// r.get("/", listMedia);

// /**
//  * ✅ list media using params:
//  * /api/media/:userId/:templateId?type=image
//  */
// r.get("/:userId/:templateId", listMedia);

// // check if media is used
// r.get("/check/:mediaId", checkUsage);

// // delete media (blocked if in use)
// r.delete("/:mediaId", deleteMedia);

// // download media (returns signed url)
// r.get("/download/:mediaId", downloadMedia);

// export default r;














// backend/routes/media.routes.ts
import { Router } from "express";
import {
  listMedia,
  checkUsage,
  deleteMedia,
  downloadMedia,
} from "../controllers/media.controller";

const r = Router();

/**
 * ✅ Check + download routes MUST come before the :userId/:templateId route,
 * otherwise "check" will be treated as userId.
 */

// check if media is used
r.get("/check/:mediaId", checkUsage);

// download media (returns signed url)
r.get("/download/:mediaId", downloadMedia);

// delete media (blocked if in use)
r.delete("/:mediaId", deleteMedia);

/**
 * ✅ list media using query params:
 * /api/media?userId=...&templateId=...&type=image
 */
r.get("/", listMedia);

/**
 * ✅ list media using params:
 * /api/media/:userId/:templateId?type=image
 */
r.get("/:userId/:templateId", listMedia);

export default r;
