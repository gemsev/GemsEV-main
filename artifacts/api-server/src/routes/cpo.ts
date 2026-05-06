import { Router } from "express";
import { db, cposTable } from "@workspace/db";
import { eq, like, and } from "drizzle-orm";
import type { Request } from "express";

const router = Router();

router.get("/cpo", async (req: Request, res) => {
  try {
    const { city, network } = req.query as Record<string, string>;
    let cpos = await db.select().from(cposTable).orderBy(cposTable.city);
    if (city) cpos = cpos.filter(c => c.city.toLowerCase().includes(city.toLowerCase()));
    if (network) cpos = cpos.filter(c => c.networkName.toLowerCase().includes(network.toLowerCase()));
    return res.json(cpos);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch CPOs" });
  }
});

router.post("/cpo", async (req: Request, res) => {
  try {
    const [cpo] = await db.insert(cposTable).values({
      ...req.body,
      chargerTypes: Array.isArray(req.body.chargerTypes) ? req.body.chargerTypes : [],
    }).returning();
    return res.status(201).json(cpo);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to create CPO" });
  }
});

router.patch("/cpo/:id", async (req: Request, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [updated] = await db.update(cposTable).set(req.body).where(eq(cposTable.id, id)).returning();
    return res.json(updated);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to update CPO" });
  }
});

router.delete("/cpo/:id", async (req: Request, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(cposTable).where(eq(cposTable.id, id));
    return res.json({ message: "CPO deleted" });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to delete CPO" });
  }
});

export default router;
