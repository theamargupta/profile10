import { createStaticClient } from "@/lib/supabase/static";

export type ProjectDate = { id: string; updatedAt: string | null };

// Sitemap source for project pages: each id with the newest date its row carries.
// Caveat: no trigger maintains projects.updated_at and the admin edit path does
// not set it, so it is the last data write, not every edit. It is still a real,
// stable date, which the request time it replaces was not.
export async function getProjectsWithDates(): Promise<ProjectDate[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase.from("projects").select("id, updated_at, created_at");
  if (error) throw new Error(`projects read failed: ${error.message}`);
  return (data ?? []).map((p) => ({ id: p.id, updatedAt: p.updated_at ?? p.created_at ?? null }));
}
