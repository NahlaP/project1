


import { Router } from "express";
import { signup, login, me } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

const r = Router();
r.post("/signup", signup);
r.post("/login",  login);
r.get("/me", requireAuth, me);
export default r;

