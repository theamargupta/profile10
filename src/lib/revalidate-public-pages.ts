import { revalidatePath } from "next/cache";

/**
 * Public pages are cached on the CDN (docs/specs/public-pages-cdn-cache.md), so
 * a write to public content must invalidate them. One write can reach many
 * pages — socials render in the footer of every route, a post appears on /,
 * /blog and in every post's ReadNext — so this invalidates them all. They
 * re-render on their next visit, not now.
 *
 * Next 16.2 revalidatePath.md, "Revalidating all data": revalidatePath('/', 'layout')
 * "will purge the Client Cache, and invalidate all cached data for revalidation
 * on the next page visit."
 *
 * Call it only after the write has succeeded.
 */
export function revalidatePublicPages(): void {
  revalidatePath("/", "layout");
}
