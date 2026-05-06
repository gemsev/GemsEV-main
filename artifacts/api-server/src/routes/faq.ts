import { Router } from "express";
import { db, faqItemsTable, faqConversationsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { Request } from "express";

const router = Router();

router.get("/faq/questions", async (req: Request, res) => {
  try {
    const { carModel, category } = req.query as Record<string, string>;
    let faqs = await db.select().from(faqItemsTable).orderBy(faqItemsTable.category);
    if (category) faqs = faqs.filter(f => f.category.toLowerCase().includes(category.toLowerCase()));
    if (carModel) faqs = faqs.filter(f => f.carModels.length === 0 || f.carModels.includes(carModel));
    return res.json(faqs);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch FAQs" });
  }
});

router.post("/faq/questions", async (req: Request, res) => {
  try {
    const [faq] = await db.insert(faqItemsTable).values({
      ...req.body,
      carModels: Array.isArray(req.body.carModels) ? req.body.carModels : [],
    }).returning();
    return res.status(201).json(faq);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to create FAQ" });
  }
});

router.post("/faq/ask", async (req: Request, res) => {
  try {
    const { question, carModel, conversationId } = req.body;

    // Find related FAQs from knowledge base
    const allFaqs = await db.select().from(faqItemsTable);
    const questionLower = question.toLowerCase();
    const relatedFaqs = allFaqs.filter(f => {
      const qLower = f.question.toLowerCase();
      const aLower = f.answer.toLowerCase();
      return questionLower.split(" ").some(word => word.length > 3 && (qLower.includes(word) || aLower.includes(word)));
    }).slice(0, 3);

    // Generate a contextual answer
    let answer = "";
    if (relatedFaqs.length > 0) {
      const topFaq = relatedFaqs[0];
      answer = topFaq.answer;
      if (relatedFaqs.length > 1) {
        answer += `\n\nRelated information: ${relatedFaqs[1].answer}`;
      }
    } else {
      answer = `Thank you for your question about "${question}". ${
        carModel ? `For the ${carModel}, ` : ""
      }I recommend checking your owner's manual or contacting your nearest Tata/MG/BYD/Hyundai service centre for the most accurate answer. You can also post this question in the community blog for fellow EV owners to respond.`;
    }

    // Save conversation
    const convId = conversationId || randomUUID();
    const newMessage = { role: "user", content: question, timestamp: new Date().toISOString() };
    const aiMessage = { role: "assistant", content: answer, timestamp: new Date().toISOString() };

    const existing = await db.select().from(faqConversationsTable).where(eq(faqConversationsTable.id, convId)).limit(1);
    if (existing.length > 0) {
      const messages = JSON.parse(existing[0].messages);
      messages.push(newMessage, aiMessage);
      await db.update(faqConversationsTable).set({
        messages: JSON.stringify(messages),
        updatedAt: new Date(),
      }).where(eq(faqConversationsTable.id, convId));
    } else {
      await db.insert(faqConversationsTable).values({
        id: convId,
        messages: JSON.stringify([newMessage, aiMessage]),
      });
    }

    return res.json({ answer, conversationId: convId, relatedFaqs, sources: relatedFaqs.map(f => f.category) });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to process question" });
  }
});

router.get("/faq/conversations", async (req: Request, res) => {
  try {
    const conversations = await db.select().from(faqConversationsTable)
      .orderBy(sql`${faqConversationsTable.createdAt} DESC`).limit(20);

    return res.json(conversations.map(c => ({
      id: c.id,
      messages: JSON.parse(c.messages),
      createdAt: c.createdAt,
    })));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

export default router;
