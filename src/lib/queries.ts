import { createClient } from "@/lib/supabase/server";
import type {
  Profile,
  Project,
  Experience,
  SkillCategory,
  Service,
  Social,
  BlogPost,
  BlogTag,
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

export async function getBlogPosts(): Promise<BlogPost[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*, blog_post_tags(blog_tags(*))")
    .eq("published", true)
    .order("published_at", { ascending: false });
  return data ?? [];
}

export async function getBlogTags(): Promise<BlogTag[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("blog_tags").select("*").order("name");
  return data ?? [];
}

export async function getAllProjectSlugs(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("id");
  return data?.map((p) => p.id) ?? [];
}
