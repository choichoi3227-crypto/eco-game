import { sqliteTable, text, integer, boolean } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').default('user'), // 'admin' | 'user'
  experiencePoints: integer('experience_points').default(0), // 추가: 경험치
  level: integer('level').default(1), // 추가: 레벨
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


import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { users } from './schema'; // 기존 유저 테이블 임포트

// 뱃지 정의 테이블
export const badges = sqliteTable('badges', {
  id: text('id').primaryKey(), // 예: 'first_login', 'level_10'
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(), // 이모지 또는 SVG 경로
  requirementType: text('requirement_type').notNull(), // 'level', 'correct_answers' 등
  requirementValue: integer('requirement_value').notNull(),
});

// 유저별 획득 뱃지 (N:M 관계)
export const userBadges = sqliteTable('user_badges', {
  userId: text('user_id').notNull().references(() => users.id),
  badgeId: text('badge_id').notNull().references(() => badges.id),
  earnedAt: integer('earned_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.badgeId] }),
}));
