import type { Express } from "express";
import { db } from "../db";
import { lessons, progress, users, conversations, dialogueProgress } from "@db/schema";
import { eq, and } from "drizzle-orm";

export function registerRoutes(app: Express) {
  // Get all conversations
  app.get("/api/conversations", async (req, res) => {
    const conversationList = await db.query.conversations.findMany({
      orderBy: (conversations, { asc }) => [asc(conversations.order)],
    });
    res.json(conversationList);
  });

  // Get dialogue content for a specific conversation
  app.get("/api/conversations/:id/dialogue", async (req, res) => {
    const { id } = req.params;
    const dialogue = await db.query.lessons.findMany({
      where: and(
        eq(lessons.section, "dialogue"),
        eq(lessons.conversationId, parseInt(id))
      ),
    });
    res.json(dialogue);
  });

  // Get dialogue progress
  app.get("/api/dialogue-progress/:userId", async (req, res) => {
    const { userId } = req.params;
    const userProgress = await db.query.dialogueProgress.findMany({
      where: eq(dialogueProgress.userId, parseInt(userId)),
      with: {
        conversation: true,
      },
    });
    res.json(userProgress);
  });

  // Update dialogue progress
  app.post("/api/dialogue-progress", async (req, res) => {
    const { userId, conversationId, linesCompleted, completed } = req.body;
    const result = await db
      .insert(dialogueProgress)
      .values({
        userId,
        conversationId,
        linesCompleted,
        completed,
        lastAttempt: new Date(),
      })
      .onConflictDoUpdate({
        target: [dialogueProgress.userId, dialogueProgress.conversationId],
        set: { linesCompleted, completed, lastAttempt: new Date() },
      });
    res.json(result);
  });

  // Get all lessons for a section
  app.get("/api/lessons/:section", async (req, res) => {
    const { section } = req.params;
    const lessonList = await db.query.lessons.findMany({
      where: eq(lessons.section, section),
    });
    res.json(lessonList);
  });

  // Get user progress
  app.get("/api/progress/:userId", async (req, res) => {
    const { userId } = req.params;
    const userProgress = await db.query.progress.findMany({
      where: eq(progress.userId, parseInt(userId)),
      with: {
        lesson: true,
      },
    });
    res.json(userProgress);
  });

  // Update progress
  app.post("/api/progress", async (req, res) => {
    const { userId, lessonId, completed, score } = req.body;
    const result = await db
      .insert(progress)
      .values({
        userId,
        lessonId,
        completed,
        score,
        lastAttempt: new Date(),
      })
      .onConflictDoUpdate({
        target: [progress.userId, progress.lessonId],
        set: { completed, score, lastAttempt: new Date() },
      });
    res.json(result);
  });
}
