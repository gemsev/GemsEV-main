import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, ownersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Request } from "express";

declare module "express-session" {
  interface SessionData {
    ownerId?: number;
  }
}

const router = Router();

// POST /auth/register
router.post("/auth/register", async (req: Request, res) => {
  try {
    const {
      email, name, age, phoneNumber, whatsappNumber, telegramId,
      areaOfStay, occupation, vehicleNumber, evCarsOwned,
      variantColor, otherCarModel, purchaseMonthYear, proofOfOwnershipUrl,
    } = req.body;

    // Extract city from areaOfStay (format: "Locality, City")
    const city = areaOfStay?.split(",").at(-1)?.trim() || areaOfStay;

    const existing = await db.select().from(ownersTable).where(eq(ownersTable.email, email)).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const [owner] = await db.insert(ownersTable).values({
      email, name, age: Number(age), phoneNumber, whatsappNumber,
      telegramId, areaOfStay, city, occupation, vehicleNumber,
      evCarsOwned: Array.isArray(evCarsOwned) ? evCarsOwned : [],
      variantColor, otherCarModel, purchaseMonthYear, proofOfOwnershipUrl,
      status: "pending",
    }).returning();

    return res.status(201).json({
      id: owner.id,
      message: "Registration submitted successfully. You will be notified once approved.",
      status: "pending",
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Registration failed" });
  }
});

// POST /auth/login
router.post("/auth/login", async (req: Request, res) => {
  try {
    const { username, password } = req.body;

    const [owner] = await db.select().from(ownersTable).where(eq(ownersTable.username, username)).limit(1);
    if (!owner) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (owner.status !== "approved") {
      return res.status(401).json({ error: "Account not yet approved" });
    }
    if (!owner.passwordHash || !await bcrypt.compare(password, owner.passwordHash)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.session!.ownerId = owner.id;

    const { passwordHash: _, ...safeOwner } = owner;
    return res.json({ owner: safeOwner, token: `session-${owner.id}` });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Login failed" });
  }
});

// PATCH /auth/change-password
router.patch("/auth/change-password", async (req: Request, res) => {
  try {
    const ownerId = req.session?.ownerId ||
      (() => {
        const auth = req.headers.authorization;
        if (auth?.startsWith("Bearer session-")) {
          return parseInt(auth.replace("Bearer session-", ""), 10);
        }
        return null;
      })();

    if (!ownerId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { newPassword } = req.body;
    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.update(ownersTable)
      .set({ passwordHash, mustChangePassword: false, updatedAt: new Date() })
      .where(eq(ownersTable.id, ownerId));

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to change password" });
  }
});

// POST /auth/logout
router.post("/auth/logout", async (req: Request, res) => {
  req.session?.destroy(() => {});
  return res.json({ message: "Logged out" });
});

// GET /auth/me
router.get("/auth/me", async (req: Request, res) => {
  try {
    // Support both session and Authorization header token
    const ownerId = req.session?.ownerId ||
      (() => {
        const auth = req.headers.authorization;
        if (auth?.startsWith("Bearer session-")) {
          return parseInt(auth.replace("Bearer session-", ""), 10);
        }
        return null;
      })();

    if (!ownerId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const [owner] = await db.select().from(ownersTable).where(eq(ownersTable.id, ownerId)).limit(1);
    if (!owner) {
      return res.status(401).json({ error: "User not found" });
    }

    const { passwordHash: _, ...safeOwner } = owner;
    return res.json(safeOwner);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
});

export default router;
