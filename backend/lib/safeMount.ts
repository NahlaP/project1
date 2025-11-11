import type { Express, Router } from "express";

/**
 * Lazily require a router and mount it safely.
 * Works with both `export default router` and `module.exports = router`.
 */
export function makeSafeMount(app: Express) {
  return function safeMount(basePath: string, loader: () => any) {
    try {
      const mod = loader();                 // require(...)
      const router: Router | undefined =
        (mod && (mod.default ?? mod)) as Router;

      // Basic sanity checks
      if (!router || typeof (router as any) !== "function") {
        console.warn(`⚠️  [safeMount] ${basePath}: module did not export an Express router.`);
        return;
      }

      app.use(basePath, router);
      console.log(`✅ Mounted ${basePath}`);
    } catch (err) {
      console.error(`❌ Failed to mount ${basePath}:`, err);
    }
  };
}
