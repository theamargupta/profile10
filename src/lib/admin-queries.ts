// Reads that need the signed-in user (RLS: auth.role() = 'authenticated'), so
// they keep the cookie client. Only /admin imports this file — public pages
// read through queries.ts. Spec: docs/specs/public-pages-cdn-cache.md
import { createClient } from "@/lib/supabase/server";
import type { ContactSubmission } from "@/lib/types";

export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}
