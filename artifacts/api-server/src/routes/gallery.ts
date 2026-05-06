import { Router } from "express";
import { db, galleryItemsTable, ownersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import type { Request } from "express";

const router = Router();

router.get("/gallery", async (req: Request, res) => {
  try {
    const { ownerId, carModel } = req.query as Record<string, string>;

    let results = await db
      .select({ item: galleryItemsTable, ownerName: ownersTable.name, ownerAvatarUrl: ownersTable.avatarUrl })
      .from(galleryItemsTable)
      .leftJoin(ownersTable, eq(galleryItemsTable.ownerId, ownersTable.id))
      .orderBy(sql`${galleryItemsTable.createdAt} DESC`);

    if (ownerId) results = results.filter(r => r.item.ownerId === parseInt(ownerId, 10));
    if (carModel) results = results.filter(r => r.item.carModel === carModel);

    return res.json(results.map(({ item, ownerName, ownerAvatarUrl }) => ({
      ...item, ownerName: ownerName || "Unknown", ownerAvatarUrl,
    })));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch gallery" });
  }
});

router.post("/gallery", async (req: Request, res) => {
  try {
    const ownerId = req.session?.ownerId ||
      (() => {
        const auth = req.headers.authorization;
        if (auth?.startsWith("Bearer session-")) return parseInt(auth.replace("Bearer session-", ""), 10);
        return null;
      })();
    if (!ownerId) return res.status(401).json({ error: "Not authenticated" });

    const [item] = await db.insert(galleryItemsTable).values({
      ...req.body,
      ownerId,
    }).returning();

    const [owner] = await db.select().from(ownersTable).where(eq(ownersTable.id, ownerId)).limit(1);
    return res.status(201).json({ ...item, ownerName: owner?.name || "Unknown", ownerAvatarUrl: owner?.avatarUrl });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to upload gallery item" });
  }
});

router.delete("/gallery/:id", async (req: Request, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(galleryItemsTable).where(eq(galleryItemsTable.id, id));
    return res.json({ message: "Gallery item deleted" });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to delete gallery item" });
  }
});

export default router;
