import { appRouterFactory } from "./appTrpc";
import { adminAuthRouter } from "./routers/adminAuth";
import { catalogRouter } from "./routers/catalog";
import { siteRouter } from "./routers/site";
import { videosRouter } from "./routers/videos";

export const appRouter = appRouterFactory({
  adminAuth: adminAuthRouter,
  catalog: catalogRouter,
  videos: videosRouter,
  site: siteRouter,
});

export type AppRouter = typeof appRouter;
