import { pgTable, uuid, text, timestamp, bigserial, integer, inet, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  displayName: text('display_name'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// One-time codes (OTP) for email authentication
export const loginCodes = pgTable('login_codes', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  codeHash: text('code_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  consumedAt: timestamp('consumed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  attemptCount: integer('attempt_count').notNull().default(0),
}, (table) => {
  return {
    userIdIdx: index('login_codes_user_id_idx').on(table.userId),
    codeHashIdx: uniqueIndex('login_codes_code_hash_idx').on(table.codeHash),
  };
});

// Sessions table for opaque tokens
export const sessions = pgTable('sessions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  userAgent: text('user_agent'),
  ip: inet('ip'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
}, (table) => {
  return {
    userIdIdx: index('sessions_user_id_idx').on(table.userId),
  };
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  loginCodes: many(loginCodes),
  sessions: many(sessions),
}));

export const loginCodesRelations = relations(loginCodes, ({ one }) => ({
  user: one(users, {
    fields: [loginCodes.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));
