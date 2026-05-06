import { Router } from "express";
import { db, ownersTable } from "@workspace/db";
import { eq, and, like, or, sql } from "drizzle-orm";
import type { Request } from "express";
import { requireLogin, requireAdmin } from "../middlewares/auth";

const router = Router();

// GET /owners — requires login
router.get("/owners", requireLogin, async (req: Request, res) => {
  try {
    const { search, carModel, city } = req.query as Record<string, string>;

    let query = db.select().from(ownersTable)
      .$dynamic();

    const conditions = [eq(ownersTable.status, "approved")];

    if (search) {
      conditions.push(
        or(
          like(ownersTable.name, `%${search}%`),
          like(ownersTable.email, `%${search}%`),
          like(ownersTable.occupation, `%${search}%`)
        )!
      );
    }
    if (city) {
      conditions.push(like(ownersTable.city, `%${city}%`));
    }

    let owners = await query.where(and(...conditions));

    if (carModel) {
      owners = owners.filter(o => o.evCarsOwned.includes(carModel));
    }

    const safeOwners = owners.map(({ passwordHash: _, ...o }) => o);
    return res.json(safeOwners);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch owners" });
  }
});

// GET /owners/:id — requires admin
router.get("/owners/:id", requireAdmin, async (req: Request, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [owner] = await db.select().from(ownersTable).where(eq(ownersTable.id, id)).limit(1);
    if (!owner || owner.status !== "approved") {
      return res.status(404).json({ error: "Owner not found" });
    }
    const { passwordHash: _, ...safeOwner } = owner;
    return res.json(safeOwner);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch owner" });
  }
});

// PATCH /owners/:id/profile
router.patch("/owners/:id/profile", async (req: Request, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { bio, avatarUrl, whatsappNumber, telegramId } = req.body;

    const [updated] = await db.update(ownersTable)
      .set({ bio, avatarUrl, whatsappNumber, telegramId, updatedAt: new Date() })
      .where(eq(ownersTable.id, id))
      .returning();

    const { passwordHash: _, ...safeOwner } = updated;
    return res.json(safeOwner);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
