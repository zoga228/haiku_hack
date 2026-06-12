import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { userDb } from "../database";
import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-for-testing";

export const emailAuthRouter = router({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user already exists
      const existing = userDb.getByEmail(input.email);
      if (existing) {
        throw new Error("User already exists");
      }

      // Create user
      const user = await userDb.create(input.name, input.email, input.password);
      const userId = user.id;

      // Create JWT token
      const token = jwt.sign({ userId, email: input.email }, JWT_SECRET, {
        expiresIn: "30d",
      });

      // Set cookie
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return {
        success: true,
        userId,
        token,
        user: {
          id: userId,
          name: input.name,
          email: input.email,
        },
      };
    }),

  // Step 1: Verify email and password, send verification code
  loginStep1: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Find user
      const user = userDb.getByEmail(input.email);
      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Check password
      const isPasswordValid = await userDb.verifyPassword(user, input.password);

      if (!isPasswordValid) {
        throw new Error("Invalid email or password");
      }

      // Generate verification code
      const code = userDb.generateVerificationCode(user.id);

      // Log code (in production, send via email)
      console.log(`[2FA] Verification code for ${user.email}: ${code}`);

      return {
        success: true,
        userId: user.id,
        email: user.email,
        message: "Verification code sent to your email",
      };
    }),

  // Step 2: Verify code and complete login
  loginStep2: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        code: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify code
      const isCodeValid = userDb.verifyCode(input.userId, input.code);
      if (!isCodeValid) {
        throw new Error("Invalid or expired verification code");
      }

      // Get user
      const user = userDb.getById(input.userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Create JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        {
          expiresIn: "30d",
        }
      );

      // Set cookie
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return {
        success: true,
        userId: user.id,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    }),

  // Legacy login (without 2FA, for backward compatibility)
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Find user
      const user = userDb.getByEmail(input.email);
      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Check password
      const isPasswordValid = await userDb.verifyPassword(user, input.password);

      if (!isPasswordValid) {
        throw new Error("Invalid email or password");
      }

      // Create JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        {
          expiresIn: "30d",
        }
      );

      // Set cookie
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return {
        success: true,
        userId: user.id,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    }),

  getCurrentUser: publicProcedure.query(({ ctx }) => {
    console.log("getCurrentUser called, ctx.user:", ctx.user);
    if (!ctx.user) {
      return null;
    }

    // Check if it\'s an email user
    const userIdMatch = ctx.user.openId?.match(/email_(\d+)/);
    if (userIdMatch) {
      const userId = parseInt(userIdMatch[1]);
      const userData = userDb.getById(userId);
      console.log("Found userData from userDb:", userData);
      if (userData) {
        return {
          id: userData.id,
          name: userData.name,
          email: userData.email,
        };
      }
    }

    return ctx.user;
  }),

  ping: publicProcedure.query(() => "pong"),
});
