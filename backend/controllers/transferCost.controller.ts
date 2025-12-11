// backend/controllers/transferCost.controller.ts
import { Request, Response } from "express";
import { getTldTransferCost } from "../services/resellerTransfer.service";

export async function getTransferCostController(req: Request, res: Response) {
  try {
    const { tld } = req.query;

    if (!tld) {
      return res.status(400).json({ error: "Missing ?tld=com" });
    }

    const cost = await getTldTransferCost(String(tld).toLowerCase());

    return res.json({
      ok: true,
      tld,
      transferAed: cost,
    });
  } catch (err: any) {
    console.error("Transfer Cost Error:", err);
    return res.status(500).json({ error: "Failed to fetch transfer cost" });
  }
}
