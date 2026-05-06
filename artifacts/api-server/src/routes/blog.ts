import { Router } from "express";
import { db, blogPostsTable, ownersTable } from "@workspace/db";
import { eq, and, sql, count } from "drizzle-orm";
import type { Request } from "express";

const router = Router();

// GET /blog/posts
router.get("/blog/posts", async (req: Request, res) => {
  try {
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "10", 10);
    const authorId = req.query.authorId ? parseInt(req.query.authorId as string, 10) : undefined;
    const offset = (page - 1) * limit;

    let conditions: any[] = [eq(blogPostsTable.published, true)];
    if (authorId) conditions.push(eq(blogPostsTable.authorId, authorId));

    const posts = await db
      .select({
        post: blogPostsTable,
        authorName: ownersTable.name,
        authorAvatarUrl: ownersTable.avatarUrl,
      })
      .from(blogPostsTable)
      .leftJoin(ownersTable, eq(blogPostsTable.authorId, ownersTable.id))
      .where(and(...conditions))
      .orderBy(sql`${blogPostsTable.createdAt} DESC`)
      .limit(limit)
      .offset(offset);

    const [totalRow] = await db.select({ count: count() }).from(blogPostsTable).where(and(...conditions));

    const formatted = posts.map(({ post, authorName, authorAvatarUrl }) => ({
      ...post,
      authorName: authorName || "Unknown",
      authorAvatarUrl,
    }));

    return res.json({ posts: formatted, total: totalRow.count, page, limit });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

// POST /blog/posts
router.post("/blog/posts", async (req: Request, res) => {
  try {
    const ownerId = req.session?.ownerId ||
      (() => {
        const auth = req.headers.authorization;
        if (auth?.startsWith("Bearer session-")) return parseInt(auth.replace("Bearer session-", ""), 10);
        return null;
      })();
    if (!ownerId) return res.status(401).json({ error: "Not authenticated" });

    const { title, content, excerpt, coverImageUrl, tags, published } = req.body;

    const [post] = await db.insert(blogPostsTable).values({
      title, content, excerpt, coverImageUrl,
      tags: Array.isArray(tags) ? tags : [],
      authorId: ownerId,
      published: published ?? false,
    }).returning();

    const [owner] = await db.select().from(ownersTable).where(eq(ownersTable.id, ownerId)).limit(1);
    return res.status(201).json({ ...post, authorName: owner?.name || "Unknown", authorAvatarUrl: owner?.avatarUrl });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to create post" });
  }
});

// GET /blog/posts/:id
router.get("/blog/posts/:id", async (req: Request, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [result] = await db
      .select({ post: blogPostsTable, authorName: ownersTable.name, authorAvatarUrl: ownersTable.avatarUrl })
      .from(blogPostsTable)
      .leftJoin(ownersTable, eq(blogPostsTable.authorId, ownersTable.id))
      .where(eq(blogPostsTable.id, id))
      .limit(1);

    if (!result) return res.status(404).json({ error: "Post not found" });

    // Increment view count
    await db.update(blogPostsTable).set({ viewCount: result.post.viewCount + 1 }).where(eq(blogPostsTable.id, id));

    return res.json({ ...result.post, authorName: result.authorName || "Unknown", authorAvatarUrl: result.authorAvatarUrl });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch post" });
  }
});

// PUT /blog/posts/:id
router.put("/blog/posts/:id", async (req: Request, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, content, excerpt, coverImageUrl, tags, published } = req.body;

    const [updated] = await db.update(blogPostsTable).set({
      title, content, excerpt, coverImageUrl,
      tags: Array.isArray(tags) ? tags : undefined,
      published,
      updatedAt: new Date(),
    }).where(eq(blogPostsTable.id, id)).returning();

    const [owner] = await db.select().from(ownersTable).where(eq(ownersTable.id, updated.authorId)).limit(1);
    return res.json({ ...updated, authorName: owner?.name || "Unknown", authorAvatarUrl: owner?.avatarUrl });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to update post" });
  }
});

// DELETE /blog/posts/:id
router.delete("/blog/posts/:id", async (req: Request, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(blogPostsTable).where(eq(blogPostsTable.id, id));
    return res.json({ message: "Post deleted" });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to delete post" });
  }
});

export default router;
