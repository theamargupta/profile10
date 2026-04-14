import { createClient } from "@supabase/supabase-js";

/**
 * Lightweight Supabase client for build-time / static generation.
 * Does NOT use cookies — safe to call from generateStaticParams.
 */
export function createStaticClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
