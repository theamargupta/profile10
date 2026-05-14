import { createClient } from "@/lib/supabase/server";
import { createStaticClient } from "@/lib/supabase/static";
import { mdToHtml } from "@/lib/markdown";
import type {
  Profile,
  Project,
  Tool,
  Experience,
  SkillCategory,
  Service,
  Social,
  BlogPost,
  BlogTag,
  ContactSubmission,
} from "@/lib/types";

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").single();
  return data;
}

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select(
      "*, project_tools(tool_id, sort_order, tools(*)), project_challenges(*), project_features(*)"
    )
    .order("sort_order");
  return data ?? [];
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select(
      "*, project_tools(tool_id, sort_order, tools(*)), project_challenges(*), project_features(*)"
    )
    .eq("featured", true)
    .order("sort_order");
  return data ?? [];
}

export async function getProjectBySlug(
  slug: string
): Promise<Project | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select(
      "*, project_tools(tool_id, sort_order, tools(*)), project_challenges(*), project_features(*)"
    )
    .eq("id", slug)
    .single();
  return data;
}

export async function getExperiences(): Promise<Experience[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("experiences")
    .select("*")
    .order("sort_order");
  return data ?? [];
}

export async function getSkillCategories(): Promise<SkillCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("skill_categories")
    .select("*")
    .order("sort_order");
  return data ?? [];
}

export async function getServices(): Promise<Service[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .order("sort_order");
  return data ?? [];
}

export async function getSocials(): Promise<Social[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("socials")
    .select("*")
    .order("sort_order");
  return data ?? [];
}

function renderManualPost<T extends { content: string | null }>(row: T): T {
  return { ...row, content: mdToHtml(row.content) };
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*, blog_post_tags(blog_tags(*))")
    .eq("published", true)
    .order("published_at", { ascending: false });
  return (data ?? []).map(renderManualPost);
}

export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*, blog_post_tags(blog_tags(*))")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  return data ? renderManualPost(data) : null;
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("published", true);
  const manual = data?.map((p) => p.slug) ?? [];
  const auto = await getAllAutoBlogSlugs();
  return [...manual, ...auto];
}

// ---- Auto-Blog (blog_published) — read-only mirror ----
// Auto-Blog (Swayam-owned) writes published posts into the shared Supabase
// project. We blend them into the manual /blog feed by normalizing to the
// existing BlogPost shape. Source of truth for these rows lives in
// swayam-nextjs; this file only reads.

type AutoBlogRow = {
  id: string;
  slug: string;
  title: string;
  body_md: string | null;
  body_html: string;
  hero_image_id: string | null;
  og_image_url: string | null;
  published_at: string;
  sources: unknown;
};

function autoBlogRowToPost(row: AutoBlogRow): BlogPost {
  const excerpt = (row.body_md ?? row.body_html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);
  // body_md is the canonical markdown source written by the Auto-Blog routine.
  // body_html historically held either raw markdown or markdown wrapped in a
  // thin <article> tag — neither rendered correctly. Render from body_md.
  const renderSource = row.body_md ?? row.body_html ?? "";
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: excerpt || null,
    content: mdToHtml(renderSource),
    cover_image: row.og_image_url ?? null,
    published: true,
    published_at: row.published_at,
    reading_time_minutes: row.body_md
      ? Math.max(1, Math.round(row.body_md.split(/\s+/).length / 220))
      : null,
    created_at: row.published_at,
    blog_post_tags: [],
  };
}

export async function getAutoBlogPosts(): Promise<BlogPost[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_published")
    .select(
      "id, slug, title, body_md, body_html, hero_image_id, og_image_url, published_at, sources",
    )
    .order("published_at", { ascending: false });
  return ((data ?? []) as AutoBlogRow[]).map(autoBlogRowToPost);
}

export async function getAutoBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_published")
    .select(
      "id, slug, title, body_md, body_html, hero_image_id, og_image_url, published_at, sources",
    )
    .eq("slug", slug)
    .maybeSingle();
  return data ? autoBlogRowToPost(data as AutoBlogRow) : null;
}

export async function getAllAutoBlogSlugs(): Promise<string[]> {
  const supabase = createStaticClient();
  const { data } = await supabase.from("blog_published").select("slug");
  return data?.map((p) => p.slug) ?? [];
}

// Combined feed — manual posts and Auto-Blog posts, sorted by published_at desc.
export async function getCombinedBlogPosts(): Promise<BlogPost[]> {
  const [manual, auto] = await Promise.all([getBlogPosts(), getAutoBlogPosts()]);
  return [...manual, ...auto].sort((a, b) => {
    const ad = a.published_at ?? a.created_at;
    const bd = b.published_at ?? b.created_at;
    if (!ad) return 1;
    if (!bd) return -1;
    return new Date(bd).getTime() - new Date(ad).getTime();
  });
}

export async function getCombinedBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const manual = await getBlogPostBySlug(slug);
  if (manual) return manual;
  return getAutoBlogPostBySlug(slug);
}

export async function getBlogTags(): Promise<BlogTag[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("blog_tags").select("*").order("name");
  return data ?? [];
}

export async function getAllProjectSlugs(): Promise<string[]> {
  const supabase = createStaticClient();
  const { data } = await supabase.from("projects").select("id");
  return data?.map((p) => p.id) ?? [];
}

export async function getTools(): Promise<Tool[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("tools").select("*").order("name");
  return data ?? [];
}

export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}
