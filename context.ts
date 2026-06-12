import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { getUserByOpenId } from "../db";
import { COOKIE_NAME } from "@shared/const";
import jwt from "jsonwebtoken";
import { ENV } from "./env";

export interface TrpcContext {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user?: {
    id: number;
    openId: string;
    name: string | null;
    email: string | null;
  };
}

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  const ctx: TrpcContext = {
    req: opts.req,
    res: opts.res,
  };

  try {
    // Try to get user from cookie
    const cookie = opts.req.cookies?.[COOKIE_NAME];
    if (!cookie) {
      return ctx;
    }

    // Verify JWT token
    const secret = process.env.JWT_SECRET || "dev-secret-key";
    const verified = jwt.verify(cookie, secret) as any;
    
    if (verified.userId) {
      // Email auth format
      ctx.user = {
        id: verified.userId,
        openId: `email_${verified.userId}`,
        name: null,
        email: verified.email || null,
      };
    } else if (verified.openId) {
      // OAuth format
      const user = await getUserByOpenId(verified.openId);
      if (user) {
        ctx.user = {
          id: user.id,
          openId: user.openId,
          name: user.name ?? null,
          email: user.email ?? null,
        };
      }
    }
  } catch (error) {
    // Invalid token, just continue without user
    console.error("Token verification error:", error);
  }

  return ctx;
}
