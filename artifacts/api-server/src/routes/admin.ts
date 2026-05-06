import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, ownersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Request } from "express";

const router = Router();

// GET /admin/registrations
router.get("/admin/registrations", async (req: Request, res) => {
  try {
    const { status } = req.query as { status?: string };
    let owners = await db.select().from(ownersTable);

    if (status && ["pending", "approved", "rejected"].includes(status)) {
      owners = owners.filter(o => o.status === status);
    }

    const safeOwners = owners.map(({ passwordHash: _, ...o }) => o);
    return res.json(safeOwners);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

// POST /admin/registrations/:id/approve
router.post("/admin/registrations/:id/approve", async (req: Request, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { username, password, blogEnabled } = req.body;

    // Check username unique
    const existing = await db.select().from(ownersTable)
      .where(eq(ownersTable.username, username)).limit(1);
    if (existing.length > 0 && existing[0].id !== id) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.update(ownersTable)
      .set({
        status: "approved",
        username,
        passwordHash,
        blogEnabled: blogEnabled ?? false,
        updatedAt: new Date(),
      })
      .where(eq(ownersTable.id, id));

    return res.json({ message: "Registration approved successfully" });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to approve registration" });
  }
});

// POST /admin/registrations/:id/reject
router.post("/admin/registrations/:id/reject", async (req: Request, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { reason } = req.body;

    await db.update(ownersTable)
      .set({ status: "rejected", rejectionReason: reason, updatedAt: new Date() })
      .where(eq(ownersTable.id, id));

    return res.json({ message: "Registration rejected" });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to reject registration" });
  }
});

export default router;
