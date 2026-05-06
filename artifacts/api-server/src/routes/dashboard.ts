import { Router } from "express";
import { db, ownersTable, blogPostsTable, galleryItemsTable, cposTable, accessoriesTable, faqItemsTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";
import type { Request } from "express";

const router = Router();

router.get("/dashboard/stats", async (req: Request, res) => {
  try {
    const [ownersCount] = await db.select({ count: count() }).from(ownersTable).where(eq(ownersTable.status, "approved"));
    const [pendingCount] = await db.select({ count: count() }).from(ownersTable).where(eq(ownersTable.status, "pending"));
    const [blogCount] = await db.select({ count: count() }).from(blogPostsTable).where(eq(blogPostsTable.published, true));
    const [galleryCount] = await db.select({ count: count() }).from(galleryItemsTable);
    const [cposCount] = await db.select({ count: count() }).from(cposTable);
    const [accessoriesCount] = await db.select({ count: count() }).from(accessoriesTable);
    const [faqCount] = await db.select({ count: count() }).from(faqItemsTable);

    // Car model breakdown
    const allOwners = await db.select({ evCarsOwned: ownersTable.evCarsOwned })
      .from(ownersTable).where(eq(ownersTable.status, "approved"));
    const modelMap: Record<string, number> = {};
    for (const owner of allOwners) {
      for (const car of owner.evCarsOwned) {
        modelMap[car] = (modelMap[car] || 0) + 1;
      }
    }
    const carModelBreakdown = Object.entries(modelMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([model, count]) => ({ model, count }));

    // City breakdown
    const cityOwners = await db.select({ city: ownersTable.city })
      .from(ownersTable).where(eq(ownersTable.status, "approved"));
    const cityMap: Record<string, number> = {};
    for (const owner of cityOwners) {
      if (owner.city) cityMap[owner.city] = (cityMap[owner.city] || 0) + 1;
    }
    const cityBreakdown = Object.entries(cityMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([city, count]) => ({ city, count }));

    // Recent registrations
    const recentRegistrations = await db.select().from(ownersTable)
      .orderBy(sql`${ownersTable.createdAt} DESC`)
      .limit(5);
    const safeRecent = recentRegistrations.map(({ passwordHash: _, ...o }) => o);

    return res.json({
      totalOwners: ownersCount.count,
      pendingRegistrations: pendingCount.count,
      totalBlogPosts: blogCount.count,
      totalGalleryItems: galleryCount.count,
      totalCpos: cposCount.count,
      totalAccessories: accessoriesCount.count,
      totalFaqItems: faqCount.count,
      carModelBreakdown,
      cityBreakdown,
      recentRegistrations: safeRecent,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
