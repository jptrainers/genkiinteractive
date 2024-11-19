import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  progress: integer("progress").default(0).notNull()
});

export const conversations = pgTable("conversations", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull()
});

export const lessons = pgTable("lessons", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  section: text("section").notNull(), // dialogue, vocabulary, grammar, practice, culture
  category: text("category"), // For vocabulary categories
  conversationId: integer("conversation_id").references(() => conversations.id),
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

export const dialogueProgress = pgTable("dialogue_progress", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").notNull().references(() => users.id),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  linesCompleted: integer("lines_completed").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
  lastAttempt: timestamp("last_attempt").defaultNow()
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertLessonSchema = createInsertSchema(lessons);
export const selectLessonSchema = createSelectSchema(lessons);
export const insertProgressSchema = createInsertSchema(progress);
export const selectProgressSchema = createSelectSchema(progress);
export const insertConversationSchema = createInsertSchema(conversations);
export const selectConversationSchema = createSelectSchema(conversations);
export const insertDialogueProgressSchema = createInsertSchema(dialogueProgress);
export const selectDialogueProgressSchema = createSelectSchema(dialogueProgress);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;
export type Lesson = z.infer<typeof selectLessonSchema>;
export type Progress = z.infer<typeof selectProgressSchema>;
export type Conversation = z.infer<typeof selectConversationSchema>;
export type DialogueProgress = z.infer<typeof selectDialogueProgressSchema>;
