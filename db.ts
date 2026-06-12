import { and, desc, eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users, accounts, InsertAccount,
  wallets, paymentCards, walletTransactions, userSubscriptions,
  friendRequests, friendships, messages,
  type Wallet, type PaymentCard, type WalletTransaction, type UserSubscription,
  type FriendRequest, type Friendship, type Message,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Email/password account helpers ─────────────────────────────────────────

export async function getAccountByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const normalized = email.trim().toLowerCase();
  const result = await db
    .select()
    .from(accounts)
    .where(eq(accounts.email, normalized))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAccount(account: InsertAccount) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  await db.insert(accounts).values({
    ...account,
    email: account.email.trim().toLowerCase(),
  });
  return getAccountByEmail(account.email);
}

export async function touchAccountSignIn(email: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  await db
    .update(accounts)
    .set({ lastSignedIn: new Date() })
    .where(eq(accounts.email, email.trim().toLowerCase()));
}

// ─── Wallet helpers ──────────────────────────────────────────────────────────

export async function getOrCreateWallet(userId: number): Promise<Wallet> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  if (existing.length > 0) return existing[0];

  await db.insert(wallets).values({ userId, balanceCents: 0, currency: "USD" });
  const created = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  return created[0];
}

export async function getPaymentCards(userId: number): Promise<PaymentCard[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(paymentCards).where(eq(paymentCards.userId, userId));
}

export async function addPaymentCard(
  userId: number,
  card: { brand: string; last4: string; expMonth: number; expYear: number; stripePaymentMethodId?: string; stripeCustomerId?: string }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Clear any existing default first
  await db.update(paymentCards).set({ isDefault: 0 }).where(eq(paymentCards.userId, userId));
  await db.insert(paymentCards).values({
    userId,
    stripePaymentMethodId: card.stripePaymentMethodId ?? "mock_pm_" + Date.now(),
    stripeCustomerId: card.stripeCustomerId ?? "mock_cus_" + userId,
    brand: card.brand,
    last4: card.last4,
    expMonth: card.expMonth,
    expYear: card.expYear,
    isDefault: 1,
  });
}

export async function removePaymentCard(userId: number, cardId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Scope deletion by userId to prevent unauthorized removal
  await db.delete(paymentCards)
    .where(and(eq(paymentCards.id, cardId), eq(paymentCards.userId, userId)));
}

export async function getWalletTransactions(userId: number, limit = 20): Promise<WalletTransaction[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(walletTransactions)
    .where(eq(walletTransactions.userId, userId))
    .orderBy(desc(walletTransactions.createdAt))
    .limit(limit);
}

export async function addWalletTransaction(
  userId: number,
  tx: { amountCents: number; type: "topup" | "purchase" | "refund" | "subscription"; description: string; stripeRef?: string }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(walletTransactions).values({ userId, ...tx });
  // Update wallet balance
  const wallet = await getOrCreateWallet(userId);
  await db
    .update(wallets)
    .set({ balanceCents: wallet.balanceCents + tx.amountCents })
    .where(eq(wallets.userId, userId));
}

export async function getActiveSubscription(userId: number): Promise<UserSubscription | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Friends helpers ────────────────────────────────────────────────────────

export async function searchUserByEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const normalized = email.trim().toLowerCase();
  const result = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function sendFriendRequest(senderId: number, receiverId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Check if request already exists
  const existing = await db.select().from(friendRequests)
    .where(and(eq(friendRequests.senderId, senderId), eq(friendRequests.receiverId, receiverId)))
    .limit(1);
  if (existing.length > 0) return;
  await db.insert(friendRequests).values({ senderId, receiverId, status: "pending" });
}

export async function respondToFriendRequest(
  requestId: number,
  userId: number,
  action: "accepted" | "declined"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [req] = await db.select().from(friendRequests)
    .where(and(eq(friendRequests.id, requestId), eq(friendRequests.receiverId, userId)))
    .limit(1);
  if (!req) throw new Error("Request not found");
  await db.update(friendRequests).set({ status: action }).where(eq(friendRequests.id, requestId));
  if (action === "accepted") {
    // Store with smaller id first to keep unique pairs
    const [a, b] = req.senderId < userId ? [req.senderId, userId] : [userId, req.senderId];
    await db.insert(friendships).values({ userId: a, friendId: b });
  }
}

export async function getFriends(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const pairs = await db.select().from(friendships)
    .where(or(eq(friendships.userId, userId), eq(friendships.friendId, userId)));
  if (pairs.length === 0) return [];
  const friendIds = pairs.map(p => p.userId === userId ? p.friendId : p.userId);
  const friends = await Promise.all(
    friendIds.map(id => db.select().from(users).where(eq(users.id, id)).limit(1))
  );
  return friends.flatMap(r => r);
}

export async function getPendingRequests(userId: number): Promise<(FriendRequest & { senderName: string | null; senderEmail: string | null })[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const reqs = await db.select().from(friendRequests)
    .where(and(eq(friendRequests.receiverId, userId), eq(friendRequests.status, "pending")));
  return Promise.all(reqs.map(async req => {
    const [sender] = await db.select().from(users).where(eq(users.id, req.senderId)).limit(1);
    return { ...req, senderName: sender?.name ?? null, senderEmail: sender?.email ?? null };
  }));
}

export async function areFriends(userId: number, otherId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const [a, b] = userId < otherId ? [userId, otherId] : [otherId, userId];
  const result = await db.select().from(friendships)
    .where(and(eq(friendships.userId, a), eq(friendships.friendId, b)))
    .limit(1);
  return result.length > 0;
}

// ─── Chat helpers ────────────────────────────────────────────────────────────

export async function sendMessage(senderId: number, receiverId: number, content: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(messages).values({ senderId, receiverId, content });
}

export async function getMessages(userId: number, otherId: number, limit = 50): Promise<Message[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(messages)
    .where(
      or(
        and(eq(messages.senderId, userId), eq(messages.receiverId, otherId)),
        and(eq(messages.senderId, otherId), eq(messages.receiverId, userId))
      )
    )
    .orderBy(desc(messages.createdAt))
    .limit(limit);
}

export async function markMessagesRead(userId: number, senderId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(messages)
    .set({ isRead: 1 })
    .where(and(eq(messages.receiverId, userId), eq(messages.senderId, senderId)));
}

export async function getUnreadCounts(userId: number): Promise<Record<number, number>> {
  const db = await getDb();
  if (!db) return {};
  const rows = await db
    .select({ senderId: messages.senderId })
    .from(messages)
    .where(and(eq(messages.receiverId, userId), eq(messages.isRead, 0)));
  const counts: Record<number, number> = {};
  for (const row of rows) {
    counts[row.senderId] = (counts[row.senderId] ?? 0) + 1;
  }
  return counts;
}

export async function createSubscription(
  userId: number,
  plan: "explorer" | "member" | "business",
  billingCycle: "monthly" | "yearly"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Cancel any existing subscription first
  await db.update(userSubscriptions)
    .set({ status: "cancelled" })
    .where(eq(userSubscriptions.userId, userId));
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === "yearly" ? 12 : 1));
  await db.insert(userSubscriptions).values({
    userId,
    plan,
    billingCycle,
    status: "active",
    currentPeriodEnd: periodEnd,
  });
}


// ─── Block/Unblock helpers ──────────────────────────────────────────────────────

// export async function blockUser(blockerId: number, blockedId: number): Promise<void> {
//   const db = await getDb();
//   if (!db) throw new Error("Database not available");
//   const existing = await db.select().from(blockedUsers)
//     .where(and(eq(blockedUsers.blockerId, blockerId), eq(blockedUsers.blockedId, blockedId)))
//     .limit(1);
//   if (existing.length > 0) return;
//   await db.insert(blockedUsers).values({ blockerId, blockedId });
// }

// export async function unblockUser(blockerId: number, blockedId: number): Promise<void> {
//   const db = await getDb();
//   if (!db) throw new Error("Database not available");
//   await db.delete(blockedUsers)
//     .where(and(eq(blockedUsers.blockerId, blockerId), eq(blockedUsers.blockedId, blockedId)));
// }

// export async function isBlocked(blockerId: number, blockedId: number): Promise<boolean> {
//   const db = await getDb();
//   if (!db) return false;
//   const result = await db.select().from(blockedUsers)
//     .where(and(eq(blockedUsers.blockerId, blockerId), eq(blockedUsers.blockedId, blockedId)))
//     .limit(1);
//   return result.length > 0;
// }

// export async function getBlockedUsers(userId: number): Promise<number[]> {
//   const db = await getDb();
//   if (!db) return [];
//   const result = await db.select({ blockedId: blockedUsers.blockedId }).from(blockedUsers)
//     .where(eq(blockedUsers.blockerId, userId));
//   return result.map(r => r.blockedId);
// }

export async function removeFriend(userId: number, friendId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [a, b] = userId < friendId ? [userId, friendId] : [friendId, userId];
  await db.delete(friendships)
    .where(and(eq(friendships.userId, a), eq(friendships.friendId, b)));
}

// ─── Online status helpers ──────────────────────────────────────────────────────

export async function setUserOnline(userId: number, isOnline: boolean): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(userStatus).where(eq(userStatus.userId, userId)).limit(1);
  if (existing.length > 0) {
    await db.update(userStatus)
      .set({ isOnline: isOnline ? 1 : 0, updatedAt: new Date() })
      .where(eq(userStatus.userId, userId));
  } else {
    await db.insert(userStatus).values({ userId, isOnline: isOnline ? 1 : 0 });
  }
}

export async function getUserStatus(userId: number): Promise<UserStatus | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userStatus).where(eq(userStatus.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getFriendsStatus(userId: number): Promise<Record<number, boolean>> {
  const db = await getDb();
  if (!db) return {};
  const friends = await getFriends(userId);
  const statuses = await Promise.all(
    friends.map(f => getUserStatus(f.id))
  );
  const result: Record<number, boolean> = {};
  friends.forEach((f, i) => {
    result[f.id] = (statuses[i]?.isOnline ?? 0) === 1;
  });
  return result;
}
