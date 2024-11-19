import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  progress: integer("progress").default(0).notNull()
});

export const lessons = pgTable("lessons", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  section: text("section").notNull(), // dialogue, vocabulary, grammar, practice, culture
  category: text("category"), // For vocabulary categories
  title: text("title").notNull(),
  content: text("content").notNull(),
  translation: text("translation"),
  furigana: text("furigana"),
  audioUrl: text("audio_url")
});

export const progress = pgTable("progress", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").notNull().references(() => users.id),
  lessonId: integer("lesson_id").notNull().references(() => lessons.id),
  completed: boolean("completed").default(false).notNull(),
  score: integer("score"),
  lastAttempt: timestamp("last_attempt").defaultNow()
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertLessonSchema = createInsertSchema(lessons);
export const selectLessonSchema = createSelectSchema(lessons);
export const insertProgressSchema = createInsertSchema(progress);
export const selectProgressSchema = createSelectSchema(progress);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;
export type Lesson = z.infer<typeof selectLessonSchema>;
export type Progress = z.infer<typeof selectProgressSchema>;
