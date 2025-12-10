import { Router } from "express";
import {
  submitDomainTransfer,
  saveDnsOnlyDomain,
} from "../controllers/domaintransfer.controller";
import { requireAuth } from "../middleware/auth.middleware";

const r = Router();

r.post("/transfer", requireAuth, submitDomainTransfer);
r.post("/dns", requireAuth, saveDnsOnlyDomain);

export default r;















