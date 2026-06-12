import { getDb } from "./db";
import { users, friendships, messages } from "../drizzle/schema";
import { eq, or, and } from "drizzle-orm";

async function seed() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return;
  }

  console.log("Seeding database...");

  // 1. Create a guest user if not exists
  const guestOpenId = "hackathon_guest_999";
  let [guest] = await db.select().from(users).where(eq(users.openId, guestOpenId)).limit(1);
  
  if (!guest) {
    await db.insert(users).values({
      openId: guestOpenId,
      name: "Гость (Хакатон)",
      email: "guest@example.com",
      role: "user",
    });
    [guest] = await db.select().from(users).where(eq(users.openId, guestOpenId)).limit(1);
  }

  // 2. Create some test friends
  const testFriends = [
    { openId: "test_friend_1", name: "Александр Иванов", email: "alex@example.com" },
    { openId: "test_friend_2", name: "Мария Смирнова", email: "maria@example.com" },
    { openId: "test_friend_3", name: "Дмитрий Петров", email: "test@example.com" },
  ];

  for (const f of testFriends) {
    let [friend] = await db.select().from(users).where(eq(users.openId, f.openId)).limit(1);
    if (!friend) {
      await db.insert(users).values({
        ...f,
        role: "user",
      });
      [friend] = await db.select().from(users).where(eq(users.openId, f.openId)).limit(1);
    }

    // Create friendship with guest
    const [a, b] = guest.id < friend.id ? [guest.id, friend.id] : [friend.id, guest.id];
    const [existingFriendship] = await db.select().from(friendships)
      .where(and(eq(friendships.userId, a), eq(friendships.friendId, b)))
      .limit(1);
    
    if (!existingFriendship) {
      await db.insert(friendships).values({ userId: a, friendId: b });
    }

    // Add some initial messages
    const [existingMsg] = await db.select().from(messages)
      .where(or(
        and(eq(messages.senderId, guest.id), eq(messages.receiverId, friend.id)),
        and(eq(messages.senderId, friend.id), eq(messages.receiverId, guest.id))
      ))
      .limit(1);

    if (!existingMsg) {
      await db.insert(messages).values({
        senderId: friend.id,
        receiverId: guest.id,
        content: `Привет! Я ${f.name}. Давай сделаем коллективную покупку?`,
      });
    }
  }

  console.log("Database seeded successfully!");
}

seed().catch(console.error);
