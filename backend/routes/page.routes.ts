
import express from "express";
import { generateStaticPage } from "../controllers/page.controller";

const router = express.Router();

router.post("/pages/generate", generateStaticPage);

export default router;
