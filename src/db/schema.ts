import { pgTable, uuid, text, timestamp, bigserial, integer, inet, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  displayName: text('display_name'),
  // Departamento simples como string (não usar enum para permitir expansão futura)
  department: text('department'),
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

// Competition results (uma prova por semana por utilizador)
// Estrutura simples conforme pedido: regista data/hora, utilizador, áudio, métricas principais e score agregado.
export const competitionResults = pgTable('competition_results', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  audioId: text('audio_id').notNull(),
  // Métricas base (inteiros para simplicidade)
  wpm: integer('wpm').notNull(),
  precisionPercent: integer('precision_percent').notNull(), // arredondado
  score: integer('score').notNull(), // fórmula: precisionPercent * ln(1 + wpm)
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('competition_results_user_id_idx').on(table.userId),
    audioIdx: index('competition_results_audio_id_idx').on(table.audioId),
  };
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  loginCodes: many(loginCodes),
  sessions: many(sessions),
  competitionResults: many(competitionResults),
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

export const competitionResultsRelations = relations(competitionResults, ({ one }) => ({
  user: one(users, {
    fields: [competitionResults.userId],
    references: [users.id],
  }),
}));
