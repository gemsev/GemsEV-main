import type { Request, Response, NextFunction } from "express";
import { db, ownersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

function resolveOwnerId(req: Request): number | null {
  if (req.session?.ownerId) return req.session.ownerId;
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer session-")) {
    const id = parseInt(auth.replace("Bearer session-", ""), 10);
    if (!isNaN(id)) return id;
  }
  return null;
}

export async function requireLogin(req: Request, res: Response, next: NextFunction) {
  const ownerId = resolveOwnerId(req);
  if (!ownerId) {
    return res.status(401).json({ error: "Login required" });
  }
  const [owner] = await db.select().from(ownersTable).where(eq(ownersTable.id, ownerId)).limit(1);
  if (!owner || owner.status !== "approved") {
    return res.status(401).json({ error: "Login required" });
  }
  (req as any).currentOwner = owner;
  return next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const ownerId = resolveOwnerId(req);
  if (!ownerId) {
    return res.status(401).json({ error: "Login required" });
  }
  const [owner] = await db.select().from(ownersTable).where(eq(ownersTable.id, ownerId)).limit(1);
  if (!owner || owner.status !== "approved") {
    return res.status(401).json({ error: "Login required" });
  }
  if (owner.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  (req as any).currentOwner = owner;
  return next();
}
