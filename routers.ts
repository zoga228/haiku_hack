import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { emailAuthRouter } from "./routers/emailAuth";
import { walletRouter } from "./routers/wallet";
import { friendsRouter } from "./routers/friends";
import { productsRouter } from "./routers/products";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts,
  // all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  emailAuth: emailAuthRouter,
  wallet: walletRouter,
  friends: friendsRouter,
  products: productsRouter,
});

export type AppRouter = typeof appRouter;
