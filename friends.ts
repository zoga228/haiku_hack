import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

// Mock data for the hackathon
const MOCK_FRIENDS = [
  { id: 101, name: "Александр Иванов", email: "alex@example.com" },
  { id: 102, name: "Мария Смирнова", email: "maria@example.com" },
  { id: 103, name: "Дмитрий Петров", email: "test@example.com" },
];

const MOCK_MESSAGES: Record<number, any[]> = {
  101: [{ id: 1, senderId: 101, receiverId: 999, content: "Привет! Давай сделаем коллективную покупку?", createdAt: new Date() }],
  102: [{ id: 2, senderId: 102, receiverId: 999, content: "Привет! Видела твои товары в корзине, классный выбор!", createdAt: new Date() }],
  103: [{ id: 3, senderId: 103, receiverId: 999, content: "Готов присоединиться к заказу!", createdAt: new Date() }],
};

export const friendsRouter = router({
  /** Search for a user by email to add as a friend */
  searchByEmail: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      try {
        const found = await db.searchUserByEmail(input.email);
        if (found) {
          if (found.id === ctx.user.id) return null;
          return { id: found.id, name: found.name, email: found.email };
        }
      } catch (e) {}
      
      const mockFound = MOCK_FRIENDS.find(f => f.email === input.email);
      if (mockFound) return mockFound;
      return null;
    }),

  /** Send a friend request */
  sendRequest: protectedProcedure
    .input(z.object({ receiverId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (input.receiverId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot add yourself" });
      }
      const alreadyFriends = await areFriends(ctx.user.id, input.receiverId);
      if (alreadyFriends) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Already friends" });
      }
      await sendFriendRequest(ctx.user.id, input.receiverId);
      return { success: true };
    }),

  /** Get pending incoming friend requests */
  getPendingRequests: protectedProcedure.query(async ({ ctx }) => {
    return getPendingRequests(ctx.user.id);
  }),

  /** Accept or decline a friend request */
  respondToRequest: protectedProcedure
    .input(z.object({
      requestId: z.number(),
      action: z.enum(["accepted", "declined"]),
    }))
    .mutation(async ({ ctx, input }) => {
      await respondToFriendRequest(input.requestId, ctx.user.id, input.action);
      return { success: true };
    }),

  /** List all confirmed friends */
  listFriends: protectedProcedure.query(async ({ ctx }) => {
    try {
      const friends = await db.getFriends(ctx.user.id);
      if (friends && friends.length > 0) {
        return friends.map(f => ({ id: f.id, name: f.name, email: f.email }));
      }
    } catch (e) {}
    return MOCK_FRIENDS;
  }),

  /** Send a message to a friend */
  sendMessage: protectedProcedure
    .input(z.object({
      receiverId: z.number(),
      content: z.string().min(1).max(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      const friends = await areFriends(ctx.user.id, input.receiverId);
      if (!friends) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only message friends" });
      }
      await sendMessage(ctx.user.id, input.receiverId, input.content);
      return { success: true };
    }),

  /** Get unread message counts per sender */
  getUnreadCounts: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await db.getUnreadCounts(ctx.user.id);
    } catch (e) {
      return { 101: 1, 102: 1, 103: 1 };
    }
  }),

  /** Get conversation with a friend */
  getMessages: protectedProcedure
    .input(z.object({ friendId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const friends = await db.areFriends(ctx.user.id, input.friendId);
        if (friends) {
          await db.markMessagesRead(ctx.user.id, input.friendId);
          const msgs = await db.getMessages(ctx.user.id, input.friendId, 50);
          return msgs.reverse();
        }
      } catch (e) {}
      
      return MOCK_MESSAGES[input.friendId] || [];
    }),
});
