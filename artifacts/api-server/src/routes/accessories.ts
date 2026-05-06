import { Router } from "express";
import { db, accessoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Request } from "express";

const router = Router();

router.get("/accessories", async (req: Request, res) => {
  try {
    const { category, carModel } = req.query as Record<string, string>;
    let accessories = await db.select().from(accessoriesTable).orderBy(accessoriesTable.category);
    if (category) accessories = accessories.filter(a => a.category.toLowerCase().includes(category.toLowerCase()));
    if (carModel) accessories = accessories.filter(a => a.compatibleCars.includes(carModel) || a.compatibleCars.length === 0);
    return res.json(accessories);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch accessories" });
  }
});

router.post("/accessories", async (req: Request, res) => {
  try {
    const [accessory] = await db.insert(accessoriesTable).values({
      ...req.body,
      compatibleCars: Array.isArray(req.body.compatibleCars) ? req.body.compatibleCars : [],
    }).returning();
    return res.status(201).json(accessory);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to create accessory" });
  }
});

router.patch("/accessories/:id", async (req: Request, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [updated] = await db.update(accessoriesTable).set(req.body).where(eq(accessoriesTable.id, id)).returning();
    return res.json(updated);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to update accessory" });
  }
});

router.delete("/accessories/:id", async (req: Request, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(accessoriesTable).where(eq(accessoriesTable.id, id));
    return res.json({ message: "Accessory deleted" });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to delete accessory" });
  }
});

export default router;
