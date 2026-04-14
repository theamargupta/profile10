"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateProjectJson } from "@/app/admin/project-json-schema";

function toText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toNumber(value: FormDataEntryValue | null, fallback = 0) {
  if (typeof value !== "string") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

/** Build /admin redirect URL preserving the active tab. */
function adminUrl(params: { success?: string; error?: string; tab?: string }) {
  const s = new URLSearchParams();
  if (params.tab) s.set("tab", params.tab);
  if (params.success) s.set("success", params.success);
  if (params.error) s.set("error", params.error);
  return `/admin?${s.toString()}`;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin?error=Please%20log%20in%20first");
  }

  return supabase;
}

/* ───────── Auth ───────── */

export async function loginAction(formData: FormData) {
  const email = toText(formData.get("email"));
  const password = toText(formData.get("password"));

  if (!email || !password) {
    redirect("/admin?error=Email%20and%20password%20are%20required");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(adminUrl({ error: error.message }));
  }

  redirect(adminUrl({ success: "Logged in" }));
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(adminUrl({ success: "Signed out" }));
}

/* ───────── Profile ───────── */

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(adminUrl({ error: "Please log in first" }));

  const profileId = toText(formData.get("id"));
  if (!profileId) redirect(adminUrl({ tab: "profile", error: "Profile record is missing" }));

  const payload = {
    name: toText(formData.get("name")) ?? "Your Name",
    title: toText(formData.get("title")) ?? "Your Title",
    headline: toText(formData.get("headline")),
    subtitle: toText(formData.get("subtitle")),
    summary: toText(formData.get("summary")),
    bio_short: toText(formData.get("bio_short")),
    bio_long: toText(formData.get("bio_long")),
    how_i_work: toText(formData.get("how_i_work")),
    email: toText(formData.get("email")),
    phone: toText(formData.get("phone")),
    location: toText(formData.get("location")),
    website: toText(formData.get("website")),
    avatar_url: toText(formData.get("avatar_url")),
    resume_url: toText(formData.get("resume_url")),
    available_for: toText(formData.get("available_for")),
    rate_range: toText(formData.get("rate_range")),
  };

  const { error } = await supabase.from("profiles").update(payload).eq("id", profileId);
  if (error) redirect(adminUrl({ tab: "profile", error: error.message }));

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "profile", success: "Profile updated" }));
}

/* ───────── Projects ───────── */

export async function createProjectAction(formData: FormData) {
  const supabase = await requireUser();

  const title = toText(formData.get("title")) ?? "New Project";
  const id =
    toText(formData.get("id")) ??
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const { error } = await supabase.from("projects").insert({
    id, title,
    description: toText(formData.get("description")),
    live_url: toText(formData.get("live_url")),
    repo_url: toText(formData.get("repo_url")),
    architecture: toText(formData.get("architecture")),
    featured: toBoolean(formData.get("featured")),
    sort_order: toNumber(formData.get("sort_order"), 0),
  });
  if (error) redirect(adminUrl({ tab: "projects", error: error.message }));

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "projects", success: "Project created" }));
}

export async function createProjectFromJsonAction(formData: FormData) {
  const supabase = await requireUser();
  const raw = toText(formData.get("json"));

  if (!raw) redirect(adminUrl({ tab: "projects", error: "JSON field is empty" }));

  const result = validateProjectJson(raw);

  if (!result.ok) {
    const msg = result.errors
      .filter((e) => !e.message.startsWith("Unknown"))
      .map((e) => `${e.field}: ${e.message}`)
      .join("; ");
    redirect(adminUrl({ tab: "projects", error: msg }));
  }

  const { data: allTools } = await supabase.from("tools").select("id, name");
  const toolMap = new Map<string, string>();
  for (const t of allTools ?? []) {
    toolMap.set(t.id.toLowerCase(), t.id);
    toolMap.set(t.name.toLowerCase(), t.id);
  }

  const created: string[] = [];

  for (const project of result.projects) {
    const { error } = await supabase.from("projects").insert({
      id: project.id, title: project.title,
      description: project.description, demo_img: project.demo_img,
      live_url: project.live_url, repo_url: project.repo_url,
      architecture: project.architecture,
      featured: project.featured ?? false, sort_order: project.sort_order ?? 0,
    });
    if (error) redirect(adminUrl({ tab: "projects", error: `Project "${project.title}": ${error.message}` }));

    if (project.tools && project.tools.length > 0) {
      const toolRows: { project_id: string; tool_id: string; sort_order: number }[] = [];
      for (let i = 0; i < project.tools.length; i++) {
        const input = project.tools[i];
        let resolved = toolMap.get(input.toLowerCase());
        if (!resolved) {
          const newId = input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          const { error: createErr } = await supabase.from("tools").insert({
            id: newId, name: input, icon: "SiHashnode", color: null,
          });
          if (createErr) redirect(adminUrl({ tab: "projects", error: `Auto-create tool "${input}": ${createErr.message}` }));
          toolMap.set(input.toLowerCase(), newId);
          toolMap.set(newId, newId);
          resolved = newId;
        }
        toolRows.push({ project_id: project.id!, tool_id: resolved, sort_order: i });
      }
      if (toolRows.length > 0) {
        const { error: toolError } = await supabase.from("project_tools").insert(toolRows);
        if (toolError) redirect(adminUrl({ tab: "projects", error: `Tools for "${project.title}": ${toolError.message}` }));
      }
    }

    if (project.features && project.features.length > 0) {
      const featureRows = project.features.map((feature, i) => ({ project_id: project.id!, feature, sort_order: i }));
      const { error: featError } = await supabase.from("project_features").insert(featureRows);
      if (featError) redirect(adminUrl({ tab: "projects", error: `Features for "${project.title}": ${featError.message}` }));
    }

    if (project.challenges && project.challenges.length > 0) {
      const challengeRows = project.challenges.map((c, i) => ({ project_id: project.id!, title: c.title, solution: c.solution, sort_order: i }));
      const { error: chalError } = await supabase.from("project_challenges").insert(challengeRows);
      if (chalError) redirect(adminUrl({ tab: "projects", error: `Challenges for "${project.title}": ${chalError.message}` }));
    }

    created.push(project.title);
    revalidatePath(`/project/${project.id}`);
  }

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin");
  const msg = created.length === 1 ? `Project "${created[0]}" created from JSON` : `${created.length} projects created from JSON`;
  redirect(adminUrl({ tab: "projects", success: msg }));
}

export async function updateProjectAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect(adminUrl({ tab: "projects", error: "Project id missing" }));

  const imageFile = formData.get("demo_img_file");
  let demoImageUrl = toText(formData.get("demo_img"));

  if (imageFile instanceof File && imageFile.size > 0) {
    const extension = imageFile.name.includes(".") ? imageFile.name.split(".").pop() : "jpg";
    const safeExtension = (extension ?? "jpg").toLowerCase();
    const filePath = `${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExtension}`;

    const bytes = await imageFile.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("project-images")
      .upload(filePath, bytes, { contentType: imageFile.type || "image/jpeg", upsert: false });
    if (uploadError) redirect(adminUrl({ tab: "projects", error: uploadError.message }));

    const { data: publicUrlData } = supabase.storage.from("project-images").getPublicUrl(filePath);
    demoImageUrl = publicUrlData.publicUrl;
  }

  const payload = {
    title: toText(formData.get("title")) ?? "Untitled Project",
    description: toText(formData.get("description")),
    demo_img: demoImageUrl,
    live_url: toText(formData.get("live_url")),
    repo_url: toText(formData.get("repo_url")),
    architecture: toText(formData.get("architecture")),
    featured: toBoolean(formData.get("featured")),
    sort_order: toNumber(formData.get("sort_order"), 0),
  };

  const { error } = await supabase.from("projects").update(payload).eq("id", id);
  if (error) redirect(adminUrl({ tab: "projects", error: error.message }));

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/project/${id}`);
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "projects", success: "Project updated" }));
}

export async function deleteProjectAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect(adminUrl({ tab: "projects", error: "Project id missing" }));

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) redirect(adminUrl({ tab: "projects", error: error.message }));

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "projects", success: "Project deleted" }));
}

/* ───────── Project Features ───────── */

export async function createProjectFeatureAction(formData: FormData) {
  const supabase = await requireUser();
  const projectId = toText(formData.get("project_id"));
  if (!projectId) redirect(adminUrl({ tab: "projects", error: "Project id missing" }));

  const { error } = await supabase.from("project_features").insert({
    project_id: projectId,
    feature: toText(formData.get("feature")) ?? "",
    sort_order: toNumber(formData.get("sort_order"), 0),
  });
  if (error) redirect(adminUrl({ tab: "projects", error: error.message }));

  revalidatePath(`/project/${projectId}`);
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "projects", success: "Feature added" }));
}

export async function deleteProjectFeatureAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect(adminUrl({ tab: "projects", error: "Feature id missing" }));

  const { error } = await supabase.from("project_features").delete().eq("id", id);
  if (error) redirect(adminUrl({ tab: "projects", error: error.message }));

  revalidatePath("/admin");
  redirect(adminUrl({ tab: "projects", success: "Feature removed" }));
}

/* ───────── Project Challenges ───────── */

export async function createProjectChallengeAction(formData: FormData) {
  const supabase = await requireUser();
  const projectId = toText(formData.get("project_id"));
  if (!projectId) redirect(adminUrl({ tab: "projects", error: "Project id missing" }));

  const { error } = await supabase.from("project_challenges").insert({
    project_id: projectId,
    title: toText(formData.get("title")) ?? "",
    solution: toText(formData.get("solution")) ?? "",
    sort_order: toNumber(formData.get("sort_order"), 0),
  });
  if (error) redirect(adminUrl({ tab: "projects", error: error.message }));

  revalidatePath(`/project/${projectId}`);
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "projects", success: "Challenge added" }));
}

export async function deleteProjectChallengeAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect(adminUrl({ tab: "projects", error: "Challenge id missing" }));

  const { error } = await supabase.from("project_challenges").delete().eq("id", id);
  if (error) redirect(adminUrl({ tab: "projects", error: error.message }));

  revalidatePath("/admin");
  redirect(adminUrl({ tab: "projects", success: "Challenge removed" }));
}

/* ───────── Project Tools (junction) ───────── */

export async function addProjectToolAction(formData: FormData) {
  const supabase = await requireUser();
  const projectId = toText(formData.get("project_id"));
  const toolId = toText(formData.get("tool_id"));
  if (!projectId || !toolId) redirect(adminUrl({ tab: "projects", error: "Project or tool id missing" }));

  const { error } = await supabase.from("project_tools").insert({
    project_id: projectId, tool_id: toolId,
    sort_order: toNumber(formData.get("sort_order"), 0),
  });
  if (error) redirect(adminUrl({ tab: "projects", error: error.message }));

  revalidatePath(`/project/${projectId}`);
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "projects", success: "Tool linked" }));
}

export async function removeProjectToolAction(formData: FormData) {
  const supabase = await requireUser();
  const projectId = toText(formData.get("project_id"));
  const toolId = toText(formData.get("tool_id"));
  if (!projectId || !toolId) redirect(adminUrl({ tab: "projects", error: "Missing ids" }));

  const { error } = await supabase.from("project_tools").delete().eq("project_id", projectId).eq("tool_id", toolId);
  if (error) redirect(adminUrl({ tab: "projects", error: error.message }));

  revalidatePath(`/project/${projectId}`);
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "projects", success: "Tool unlinked" }));
}

/* ───────── Services ───────── */

export async function createServiceAction(formData: FormData) {
  const supabase = await requireUser();

  const { error } = await supabase.from("services").insert({
    title: toText(formData.get("title")) ?? "New Service",
    description: toText(formData.get("description")) ?? "",
    icon: toText(formData.get("icon")),
    sort_order: toNumber(formData.get("sort_order"), 0),
  });
  if (error) redirect(adminUrl({ tab: "services", error: error.message }));

  revalidatePath("/");
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "services", success: "Service created" }));
}

export async function updateServiceAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect(adminUrl({ tab: "services", error: "Service id missing" }));

  const { error } = await supabase.from("services").update({
    title: toText(formData.get("title")) ?? "Service",
    description: toText(formData.get("description")) ?? "",
    icon: toText(formData.get("icon")),
    sort_order: toNumber(formData.get("sort_order"), 0),
  }).eq("id", id);
  if (error) redirect(adminUrl({ tab: "services", error: error.message }));

  revalidatePath("/");
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "services", success: "Service updated" }));
}

export async function deleteServiceAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect(adminUrl({ tab: "services", error: "Service id missing" }));

  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) redirect(adminUrl({ tab: "services", error: error.message }));

  revalidatePath("/");
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "services", success: "Service deleted" }));
}

/* ───────── Experience ───────── */

export async function createExperienceAction(formData: FormData) {
  const supabase = await requireUser();

  const { error } = await supabase.from("experiences").insert({
    company: toText(formData.get("company")) ?? "Company",
    job_title: toText(formData.get("job_title")) ?? "Role",
    employment_type: toText(formData.get("employment_type")),
    location: toText(formData.get("location")),
    description: toText(formData.get("description")),
    start_date: toText(formData.get("start_date")) ?? new Date().toISOString().slice(0, 10),
    end_date: toText(formData.get("end_date")),
    sort_order: toNumber(formData.get("sort_order"), 0),
  });
  if (error) redirect(adminUrl({ tab: "experience", error: error.message }));

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "experience", success: "Experience created" }));
}

export async function updateExperienceAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect(adminUrl({ tab: "experience", error: "Experience id missing" }));

  const { error } = await supabase.from("experiences").update({
    company: toText(formData.get("company")) ?? "Company",
    job_title: toText(formData.get("job_title")) ?? "Role",
    employment_type: toText(formData.get("employment_type")),
    location: toText(formData.get("location")),
    description: toText(formData.get("description")),
    start_date: toText(formData.get("start_date")) ?? new Date().toISOString().slice(0, 10),
    end_date: toText(formData.get("end_date")),
    sort_order: toNumber(formData.get("sort_order"), 0),
  }).eq("id", id);
  if (error) redirect(adminUrl({ tab: "experience", error: error.message }));

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "experience", success: "Experience updated" }));
}

export async function deleteExperienceAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect(adminUrl({ tab: "experience", error: "Experience id missing" }));

  const { error } = await supabase.from("experiences").delete().eq("id", id);
  if (error) redirect(adminUrl({ tab: "experience", error: error.message }));

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "experience", success: "Experience deleted" }));
}

/* ───────── Skill Categories ───────── */

export async function createSkillCategoryAction(formData: FormData) {
  const supabase = await requireUser();

  const { error } = await supabase.from("skill_categories").insert({
    category: toText(formData.get("category")) ?? "New Category",
    skills: toText(formData.get("skills")) ?? "",
    sort_order: toNumber(formData.get("sort_order"), 0),
  });
  if (error) redirect(adminUrl({ tab: "skills", error: error.message }));

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "skills", success: "Skill category created" }));
}

export async function updateSkillCategoryAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect(adminUrl({ tab: "skills", error: "Skill category id missing" }));

  const { error } = await supabase.from("skill_categories").update({
    category: toText(formData.get("category")) ?? "Category",
    skills: toText(formData.get("skills")) ?? "",
    sort_order: toNumber(formData.get("sort_order"), 0),
  }).eq("id", id);
  if (error) redirect(adminUrl({ tab: "skills", error: error.message }));

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "skills", success: "Skill category updated" }));
}

export async function deleteSkillCategoryAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect(adminUrl({ tab: "skills", error: "Skill category id missing" }));

  const { error } = await supabase.from("skill_categories").delete().eq("id", id);
  if (error) redirect(adminUrl({ tab: "skills", error: error.message }));

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "skills", success: "Skill category deleted" }));
}

/* ───────── Socials ───────── */

export async function createSocialAction(formData: FormData) {
  const supabase = await requireUser();

  const { error } = await supabase.from("socials").insert({
    name: toText(formData.get("name")) ?? "Social",
    href: toText(formData.get("href")) ?? "",
    icon: toText(formData.get("icon")) ?? "",
    color: toText(formData.get("color")),
    sort_order: toNumber(formData.get("sort_order"), 0),
  });
  if (error) redirect(adminUrl({ tab: "socials", error: error.message }));

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "socials", success: "Social created" }));
}

export async function updateSocialAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect(adminUrl({ tab: "socials", error: "Social id missing" }));

  const { error } = await supabase.from("socials").update({
    name: toText(formData.get("name")) ?? "Social",
    href: toText(formData.get("href")) ?? "",
    icon: toText(formData.get("icon")) ?? "",
    color: toText(formData.get("color")),
    sort_order: toNumber(formData.get("sort_order"), 0),
  }).eq("id", id);
  if (error) redirect(adminUrl({ tab: "socials", error: error.message }));

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "socials", success: "Social updated" }));
}

export async function deleteSocialAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect(adminUrl({ tab: "socials", error: "Social id missing" }));

  const { error } = await supabase.from("socials").delete().eq("id", id);
  if (error) redirect(adminUrl({ tab: "socials", error: error.message }));

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "socials", success: "Social deleted" }));
}

/* ───────── Blog ───────── */

export async function createBlogPostAction(formData: FormData) {
  const supabase = await requireUser();

  const title = toText(formData.get("title")) ?? "Untitled Post";
  const slug =
    toText(formData.get("slug")) ??
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const { error } = await supabase.from("blog_posts").insert({
    title, slug,
    excerpt: toText(formData.get("excerpt")),
    content: toText(formData.get("content")),
    cover_image: toText(formData.get("cover_image")),
    reading_time_minutes: toNumber(formData.get("reading_time_minutes"), 5),
    published: toBoolean(formData.get("published")),
    published_at: toBoolean(formData.get("published")) ? new Date().toISOString() : null,
  });
  if (error) redirect(adminUrl({ tab: "blog", error: error.message }));

  revalidatePath("/blog");
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "blog", success: "Blog post created" }));
}

export async function updateBlogPostAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect(adminUrl({ tab: "blog", error: "Blog post id missing" }));

  const slug = toText(formData.get("slug")) ?? "";
  const published = toBoolean(formData.get("published"));

  const { error } = await supabase.from("blog_posts").update({
    title: toText(formData.get("title")) ?? "Untitled",
    slug, excerpt: toText(formData.get("excerpt")),
    content: toText(formData.get("content")),
    cover_image: toText(formData.get("cover_image")),
    reading_time_minutes: toNumber(formData.get("reading_time_minutes"), 1),
    published,
    published_at: published ? new Date().toISOString() : null,
  }).eq("id", id);
  if (error) redirect(adminUrl({ tab: "blog", error: error.message }));

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "blog", success: "Blog post updated" }));
}

export async function deleteBlogPostAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect(adminUrl({ tab: "blog", error: "Blog post id missing" }));

  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) redirect(adminUrl({ tab: "blog", error: error.message }));

  revalidatePath("/blog");
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "blog", success: "Blog post deleted" }));
}

export async function createBlogTagAction(formData: FormData) {
  const supabase = await requireUser();

  const name = toText(formData.get("name")) ?? "New Tag";
  const slug =
    toText(formData.get("slug")) ??
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const { error } = await supabase.from("blog_tags").insert({ name, slug });
  if (error) redirect(adminUrl({ tab: "blog", error: error.message }));

  revalidatePath("/blog");
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "blog", success: "Blog tag created" }));
}

export async function updateBlogTagAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect(adminUrl({ tab: "blog", error: "Blog tag id missing" }));

  const { error } = await supabase.from("blog_tags").update({
    name: toText(formData.get("name")) ?? "Tag",
    slug: toText(formData.get("slug")) ?? "",
  }).eq("id", id);
  if (error) redirect(adminUrl({ tab: "blog", error: error.message }));

  revalidatePath("/blog");
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "blog", success: "Blog tag updated" }));
}

export async function deleteBlogTagAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect(adminUrl({ tab: "blog", error: "Blog tag id missing" }));

  const { error } = await supabase.from("blog_tags").delete().eq("id", id);
  if (error) redirect(adminUrl({ tab: "blog", error: error.message }));

  revalidatePath("/blog");
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "blog", success: "Blog tag deleted" }));
}

/* ───────── Blog Post Tags (junction) ───────── */

export async function addBlogPostTagAction(formData: FormData) {
  const supabase = await requireUser();
  const postId = toText(formData.get("post_id"));
  const tagId = toText(formData.get("tag_id"));
  if (!postId || !tagId) redirect(adminUrl({ tab: "blog", error: "Post or tag id missing" }));

  const { error } = await supabase.from("blog_post_tags").insert({ post_id: postId, tag_id: tagId });
  if (error) redirect(adminUrl({ tab: "blog", error: error.message }));

  revalidatePath("/blog");
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "blog", success: "Tag assigned" }));
}

export async function removeBlogPostTagAction(formData: FormData) {
  const supabase = await requireUser();
  const postId = toText(formData.get("post_id"));
  const tagId = toText(formData.get("tag_id"));
  if (!postId || !tagId) redirect(adminUrl({ tab: "blog", error: "Missing ids" }));

  const { error } = await supabase.from("blog_post_tags").delete().eq("post_id", postId).eq("tag_id", tagId);
  if (error) redirect(adminUrl({ tab: "blog", error: error.message }));

  revalidatePath("/blog");
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "blog", success: "Tag removed" }));
}

/* ───────── Tools ───────── */

export async function createToolAction(formData: FormData) {
  const supabase = await requireUser();

  const name = toText(formData.get("name")) ?? "New Tool";
  const id =
    toText(formData.get("id")) ??
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const { error } = await supabase.from("tools").insert({
    id, name,
    icon: toText(formData.get("icon")) ?? "",
    color: toText(formData.get("color")),
  });
  if (error) redirect(adminUrl({ tab: "tools", error: error.message }));

  revalidatePath("/");
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "tools", success: "Tool created" }));
}

export async function updateToolAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect(adminUrl({ tab: "tools", error: "Tool id missing" }));

  const { error } = await supabase.from("tools").update({
    name: toText(formData.get("name")) ?? "Tool",
    icon: toText(formData.get("icon")) ?? "",
    color: toText(formData.get("color")),
  }).eq("id", id);
  if (error) redirect(adminUrl({ tab: "tools", error: error.message }));

  revalidatePath("/");
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "tools", success: "Tool updated" }));
}

export async function deleteToolAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect(adminUrl({ tab: "tools", error: "Tool id missing" }));

  const { error } = await supabase.from("tools").delete().eq("id", id);
  if (error) redirect(adminUrl({ tab: "tools", error: error.message }));

  revalidatePath("/");
  revalidatePath("/admin");
  redirect(adminUrl({ tab: "tools", success: "Tool deleted" }));
}

/* ───────── Contact Submissions ───────── */

export async function markContactReadAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect(adminUrl({ tab: "contacts", error: "Submission id missing" }));

  const { error } = await supabase.from("contact_submissions").update({ read: true }).eq("id", id);
  if (error) redirect(adminUrl({ tab: "contacts", error: error.message }));

  revalidatePath("/admin");
  redirect(adminUrl({ tab: "contacts", success: "Marked as read" }));
}

export async function deleteContactSubmissionAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect(adminUrl({ tab: "contacts", error: "Submission id missing" }));

  const { error } = await supabase.from("contact_submissions").delete().eq("id", id);
  if (error) redirect(adminUrl({ tab: "contacts", error: error.message }));

  revalidatePath("/admin");
  redirect(adminUrl({ tab: "contacts", success: "Submission deleted" }));
}
