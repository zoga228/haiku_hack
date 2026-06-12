import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Email/password accounts created via in-app registration (separate from Manus OAuth).
 * Stores a salted password hash (PBKDF2) so users can sign in with the same
 * credentials they registered with.
 */
export const accounts = mysqlTable("accounts", {
  id: int("id").autoincrement().primaryKey(),
  /** Unique login email. */
  email: varchar("email", { length: 320 }).notNull().unique(),
  /** Display name provided at registration. */
  name: varchar("name", { length: 255 }).notNull(),
  /** PBKDF2 password hash, hex encoded. */
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  /** Per-account random salt, hex encoded. */
  passwordSalt: varchar("passwordSalt", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;

// ─── WALLET ───────────────────────────────────────────────────────────────────

/**
 * One wallet per user. Stores the current balance in cents (USD).
 */
export const wallets = mysqlTable("wallets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  /** Balance in cents (e.g. 1000 = $10.00) */
  balanceCents: int("balanceCents").default(0).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Wallet = typeof wallets.$inferSelect;

/**
 * Saved payment cards (Stripe PaymentMethod references — no raw PAN stored).
 */
export const paymentCards = mysqlTable("payment_cards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Stripe PaymentMethod ID */
  stripePaymentMethodId: varchar("stripePaymentMethodId", { length: 64 }).notNull(),
  /** Stripe Customer ID */
  stripeCustomerId: varchar("stripeCustomerId", { length: 64 }).notNull(),
  /** Card brand: visa, mastercard, amex, etc. */
  brand: varchar("brand", { length: 32 }).notNull(),
  /** Last 4 digits of card number */
  last4: varchar("last4", { length: 4 }).notNull(),
  /** Expiry month (1-12) */
  expMonth: int("expMonth").notNull(),
  /** Expiry year (4-digit) */
  expYear: int("expYear").notNull(),
  isDefault: int("isDefault").default(0).notNull(), // 0=false, 1=true
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PaymentCard = typeof paymentCards.$inferSelect;

/**
 * Wallet transaction ledger.
 */
export const walletTransactions = mysqlTable("wallet_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Amount in cents, positive=credit, negative=debit */
  amountCents: int("amountCents").notNull(),
  type: mysqlEnum("type", ["topup", "purchase", "refund", "subscription"]).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  /** Optional Stripe PaymentIntent or Charge ID */
  stripeRef: varchar("stripeRef", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WalletTransaction = typeof walletTransactions.$inferSelect;

/**
 * Active user subscriptions.
 */
export const userSubscriptions = mysqlTable("user_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Plan identifier: explorer | member | business */
  plan: mysqlEnum("plan", ["explorer", "member", "business"]).notNull(),
  /** monthly | yearly */
  billingCycle: mysqlEnum("billingCycle", ["monthly", "yearly"]).notNull(),
  /** Stripe Subscription ID */
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 64 }),
  status: mysqlEnum("status", ["active", "cancelled", "past_due"]).default("active").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSubscription = typeof userSubscriptions.$inferSelect;

// ─── FRIENDS & CHAT ───────────────────────────────────────────────────────────

/**
 * Friend requests between users.
 */
export const friendRequests = mysqlTable("friend_requests", {
  id: int("id").autoincrement().primaryKey(),
  senderId: int("senderId").notNull(),
  receiverId: int("receiverId").notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "declined"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FriendRequest = typeof friendRequests.$inferSelect;

/**
 * Confirmed friendships (bidirectional — one row per pair, userId < friendId).
 */
export const friendships = mysqlTable("friendships", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  friendId: int("friendId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Friendship = typeof friendships.$inferSelect;

/**
 * Direct messages between friends.
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  senderId: int("senderId").notNull(),
  receiverId: int("receiverId").notNull(),
  content: text("content").notNull(),
  isRead: int("isRead").default(0).notNull(), // 0=unread, 1=read
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;