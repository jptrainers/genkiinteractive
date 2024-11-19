import type { Express } from "express";
import { db } from "../db";
import { lessons, progress, users } from "@db/schema";
import { eq, and } from "drizzle-orm";

export function registerRoutes(app: Express) {
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
