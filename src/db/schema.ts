import { sqliteTable, text, integer, boolean } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').default('user'), // 'admin' | 'user'
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const guides = sqliteTable('guides', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull(),
  views: integer('views').default(0),
  popularityScore: integer('popularity_score').default(0),
});

export const gameResults = sqliteTable('game_results', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').references(() => users.id),
  correct: integer('correct').default(0),
  incorrect: integer('incorrect').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const ogImageCache = sqliteTable('og_image_cache', {
  id: text('id').primaryKey(),
  url: text('url').notNull(),
  sha: text('sha').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const githubFailureLogs = sqliteTable('github_failure_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  timestamp: integer('timestamp', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  filePath: text('file_path').notNull(),
  errorMessage: text('error_message').notNull(),
  notified: boolean('notified').default(false),
});
