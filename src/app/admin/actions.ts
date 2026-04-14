"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function toText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function loginAction(formData: FormData) {
  const email = toText(formData.get("email"));
  const password = toText(formData.get("password"));

  if (!email || !password) {
    redirect("/admin?error=Email%20and%20password%20are%20required");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin?success=Logged%20in");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin?success=Signed%20out");
}

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin?error=Please%20log%20in%20first");
  }

  const profileId = toText(formData.get("id"));
  if (!profileId) {
    redirect("/admin?error=Profile%20record%20is%20missing");
  }

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

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", profileId);

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin");
  redirect("/admin?success=Profile%20updated");
}

function toNumber(value: FormDataEntryValue | null, fallback = 0) {
  if (typeof value !== "string") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
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

export async function createProjectAction(formData: FormData) {
  const supabase = await requireUser();

  const title = toText(formData.get("title")) ?? "New Project";
  const id =
    toText(formData.get("id")) ??
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const { error } = await supabase.from("projects").insert({
    id,
    title,
    description: toText(formData.get("description")),
    live_url: toText(formData.get("live_url")),
    repo_url: toText(formData.get("repo_url")),
    architecture: toText(formData.get("architecture")),
    featured: toBoolean(formData.get("featured")),
    sort_order: toNumber(formData.get("sort_order"), 0),
  });
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin");
  redirect("/admin?success=Project%20created");
}

export async function updateProjectAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));

  if (!id) redirect("/admin?error=Project%20id%20missing");

  const imageFile = formData.get("demo_img_file");
  let demoImageUrl = toText(formData.get("demo_img"));

  if (imageFile instanceof File && imageFile.size > 0) {
    const extension = imageFile.name.includes(".")
      ? imageFile.name.split(".").pop()
      : "jpg";
    const safeExtension = (extension ?? "jpg").toLowerCase();
    const filePath = `${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExtension}`;

    const bytes = await imageFile.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("project-images")
      .upload(filePath, bytes, {
        contentType: imageFile.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      redirect(`/admin?error=${encodeURIComponent(uploadError.message)}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from("project-images")
      .getPublicUrl(filePath);

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
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/project/${id}`);
  revalidatePath("/admin");
  redirect("/admin?success=Project%20updated");
}

export async function createServiceAction(formData: FormData) {
  const supabase = await requireUser();

  const { error } = await supabase.from("services").insert({
    title: toText(formData.get("title")) ?? "New Service",
    description: toText(formData.get("description")) ?? "",
    icon: toText(formData.get("icon")),
    sort_order: toNumber(formData.get("sort_order"), 0),
  });
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?success=Service%20created");
}

export async function updateServiceAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect("/admin?error=Service%20id%20missing");

  const payload = {
    title: toText(formData.get("title")) ?? "Service",
    description: toText(formData.get("description")) ?? "",
    icon: toText(formData.get("icon")),
    sort_order: toNumber(formData.get("sort_order"), 0),
  };

  const { error } = await supabase.from("services").update(payload).eq("id", id);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?success=Service%20updated");
}

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
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin");
  redirect("/admin?success=Experience%20created");
}

export async function updateExperienceAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect("/admin?error=Experience%20id%20missing");

  const payload = {
    company: toText(formData.get("company")) ?? "Company",
    job_title: toText(formData.get("job_title")) ?? "Role",
    employment_type: toText(formData.get("employment_type")),
    location: toText(formData.get("location")),
    description: toText(formData.get("description")),
    start_date: toText(formData.get("start_date")) ?? new Date().toISOString().slice(0, 10),
    end_date: toText(formData.get("end_date")),
    sort_order: toNumber(formData.get("sort_order"), 0),
  };

  const { error } = await supabase.from("experiences").update(payload).eq("id", id);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin");
  redirect("/admin?success=Experience%20updated");
}

export async function createSkillCategoryAction(formData: FormData) {
  const supabase = await requireUser();

  const { error } = await supabase.from("skill_categories").insert({
    category: toText(formData.get("category")) ?? "New Category",
    skills: toText(formData.get("skills")) ?? "",
    sort_order: toNumber(formData.get("sort_order"), 0),
  });
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin");
  redirect("/admin?success=Skill%20category%20created");
}

export async function updateSkillCategoryAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect("/admin?error=Skill%20category%20id%20missing");

  const payload = {
    category: toText(formData.get("category")) ?? "Category",
    skills: toText(formData.get("skills")) ?? "",
    sort_order: toNumber(formData.get("sort_order"), 0),
  };

  const { error } = await supabase
    .from("skill_categories")
    .update(payload)
    .eq("id", id);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin");
  redirect("/admin?success=Skill%20category%20updated");
}

export async function createSocialAction(formData: FormData) {
  const supabase = await requireUser();

  const { error } = await supabase.from("socials").insert({
    name: toText(formData.get("name")) ?? "Social",
    href: toText(formData.get("href")) ?? "",
    icon: toText(formData.get("icon")) ?? "",
    color: toText(formData.get("color")),
    sort_order: toNumber(formData.get("sort_order"), 0),
  });
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin");
  redirect("/admin?success=Social%20created");
}

export async function updateSocialAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect("/admin?error=Social%20id%20missing");

  const payload = {
    name: toText(formData.get("name")) ?? "Social",
    href: toText(formData.get("href")) ?? "",
    icon: toText(formData.get("icon")) ?? "",
    color: toText(formData.get("color")),
    sort_order: toNumber(formData.get("sort_order"), 0),
  };

  const { error } = await supabase.from("socials").update(payload).eq("id", id);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin");
  redirect("/admin?success=Social%20updated");
}

export async function updateBlogPostAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect("/admin?error=Blog%20post%20id%20missing");

  const slug = toText(formData.get("slug")) ?? "";
  const published = toBoolean(formData.get("published"));

  const payload = {
    title: toText(formData.get("title")) ?? "Untitled",
    slug,
    excerpt: toText(formData.get("excerpt")),
    content: toText(formData.get("content")),
    cover_image: toText(formData.get("cover_image")),
    reading_time_minutes: toNumber(formData.get("reading_time_minutes"), 1),
    published,
    published_at: published ? new Date().toISOString() : null,
  };

  const { error } = await supabase.from("blog_posts").update(payload).eq("id", id);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin");
  redirect("/admin?success=Blog%20post%20updated");
}

export async function createBlogPostAction(formData: FormData) {
  const supabase = await requireUser();

  const title = toText(formData.get("title")) ?? "Untitled Post";
  const slug =
    toText(formData.get("slug")) ??
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const payload = {
    title,
    slug,
    excerpt: toText(formData.get("excerpt")),
    content: toText(formData.get("content")),
    cover_image: toText(formData.get("cover_image")),
    reading_time_minutes: toNumber(formData.get("reading_time_minutes"), 5),
    published: toBoolean(formData.get("published")),
    published_at: toBoolean(formData.get("published"))
      ? new Date().toISOString()
      : null,
  };

  const { error } = await supabase.from("blog_posts").insert(payload);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/blog");
  revalidatePath("/admin");
  redirect("/admin?success=Blog%20post%20created");
}

export async function updateBlogTagAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect("/admin?error=Blog%20tag%20id%20missing");

  const payload = {
    name: toText(formData.get("name")) ?? "Tag",
    slug: toText(formData.get("slug")) ?? "",
  };

  const { error } = await supabase.from("blog_tags").update(payload).eq("id", id);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/blog");
  revalidatePath("/admin");
  redirect("/admin?success=Blog%20tag%20updated");
}

export async function createBlogTagAction(formData: FormData) {
  const supabase = await requireUser();

  const name = toText(formData.get("name")) ?? "New Tag";
  const slug =
    toText(formData.get("slug")) ??
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const { error } = await supabase.from("blog_tags").insert({ name, slug });
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/blog");
  revalidatePath("/admin");
  redirect("/admin?success=Blog%20tag%20created");
}

/* ───────── Tools CRUD ───────── */

export async function createToolAction(formData: FormData) {
  const supabase = await requireUser();

  const name = toText(formData.get("name")) ?? "New Tool";
  const id =
    toText(formData.get("id")) ??
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const { error } = await supabase.from("tools").insert({
    id,
    name,
    icon: toText(formData.get("icon")) ?? "",
    color: toText(formData.get("color")),
  });
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?success=Tool%20created");
}

export async function updateToolAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect("/admin?error=Tool%20id%20missing");

  const { error } = await supabase
    .from("tools")
    .update({
      name: toText(formData.get("name")) ?? "Tool",
      icon: toText(formData.get("icon")) ?? "",
      color: toText(formData.get("color")),
    })
    .eq("id", id);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?success=Tool%20updated");
}

export async function deleteToolAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect("/admin?error=Tool%20id%20missing");

  const { error } = await supabase.from("tools").delete().eq("id", id);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?success=Tool%20deleted");
}

/* ───────── Project Features CRUD ───────── */

export async function createProjectFeatureAction(formData: FormData) {
  const supabase = await requireUser();
  const projectId = toText(formData.get("project_id"));
  if (!projectId) redirect("/admin?error=Project%20id%20missing");

  const { error } = await supabase.from("project_features").insert({
    project_id: projectId,
    feature: toText(formData.get("feature")) ?? "",
    sort_order: toNumber(formData.get("sort_order"), 0),
  });
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/project/${projectId}`);
  revalidatePath("/admin");
  redirect("/admin?success=Feature%20added");
}

export async function deleteProjectFeatureAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect("/admin?error=Feature%20id%20missing");

  const { error } = await supabase.from("project_features").delete().eq("id", id);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin");
  redirect("/admin?success=Feature%20removed");
}

/* ───────── Project Challenges CRUD ───────── */

export async function createProjectChallengeAction(formData: FormData) {
  const supabase = await requireUser();
  const projectId = toText(formData.get("project_id"));
  if (!projectId) redirect("/admin?error=Project%20id%20missing");

  const { error } = await supabase.from("project_challenges").insert({
    project_id: projectId,
    title: toText(formData.get("title")) ?? "",
    solution: toText(formData.get("solution")) ?? "",
    sort_order: toNumber(formData.get("sort_order"), 0),
  });
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/project/${projectId}`);
  revalidatePath("/admin");
  redirect("/admin?success=Challenge%20added");
}

export async function deleteProjectChallengeAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect("/admin?error=Challenge%20id%20missing");

  const { error } = await supabase.from("project_challenges").delete().eq("id", id);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin");
  redirect("/admin?success=Challenge%20removed");
}

/* ───────── Project Tools (junction) ───────── */

export async function addProjectToolAction(formData: FormData) {
  const supabase = await requireUser();
  const projectId = toText(formData.get("project_id"));
  const toolId = toText(formData.get("tool_id"));
  if (!projectId || !toolId) redirect("/admin?error=Project%20or%20tool%20id%20missing");

  const { error } = await supabase.from("project_tools").insert({
    project_id: projectId,
    tool_id: toolId,
    sort_order: toNumber(formData.get("sort_order"), 0),
  });
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/project/${projectId}`);
  revalidatePath("/admin");
  redirect("/admin?success=Tool%20linked");
}

export async function removeProjectToolAction(formData: FormData) {
  const supabase = await requireUser();
  const projectId = toText(formData.get("project_id"));
  const toolId = toText(formData.get("tool_id"));
  if (!projectId || !toolId) redirect("/admin?error=Missing%20ids");

  const { error } = await supabase
    .from("project_tools")
    .delete()
    .eq("project_id", projectId)
    .eq("tool_id", toolId);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/project/${projectId}`);
  revalidatePath("/admin");
  redirect("/admin?success=Tool%20unlinked");
}

/* ───────── Blog Post Tags (junction) ───────── */

export async function addBlogPostTagAction(formData: FormData) {
  const supabase = await requireUser();
  const postId = toText(formData.get("post_id"));
  const tagId = toText(formData.get("tag_id"));
  if (!postId || !tagId) redirect("/admin?error=Post%20or%20tag%20id%20missing");

  const { error } = await supabase.from("blog_post_tags").insert({
    post_id: postId,
    tag_id: tagId,
  });
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/blog");
  revalidatePath("/admin");
  redirect("/admin?success=Tag%20assigned");
}

export async function removeBlogPostTagAction(formData: FormData) {
  const supabase = await requireUser();
  const postId = toText(formData.get("post_id"));
  const tagId = toText(formData.get("tag_id"));
  if (!postId || !tagId) redirect("/admin?error=Missing%20ids");

  const { error } = await supabase
    .from("blog_post_tags")
    .delete()
    .eq("post_id", postId)
    .eq("tag_id", tagId);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/blog");
  revalidatePath("/admin");
  redirect("/admin?success=Tag%20removed");
}

/* ───────── Contact Submissions ───────── */

export async function markContactReadAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect("/admin?error=Submission%20id%20missing");

  const { error } = await supabase
    .from("contact_submissions")
    .update({ read: true })
    .eq("id", id);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin");
  redirect("/admin?success=Marked%20as%20read");
}

export async function deleteContactSubmissionAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect("/admin?error=Submission%20id%20missing");

  const { error } = await supabase.from("contact_submissions").delete().eq("id", id);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin");
  redirect("/admin?success=Submission%20deleted");
}

/* ───────── Generic Delete Actions ───────── */

export async function deleteProjectAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect("/admin?error=Project%20id%20missing");

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin");
  redirect("/admin?success=Project%20deleted");
}

export async function deleteServiceAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect("/admin?error=Service%20id%20missing");

  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?success=Service%20deleted");
}

export async function deleteExperienceAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect("/admin?error=Experience%20id%20missing");

  const { error } = await supabase.from("experiences").delete().eq("id", id);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin");
  redirect("/admin?success=Experience%20deleted");
}

export async function deleteSkillCategoryAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect("/admin?error=Skill%20category%20id%20missing");

  const { error } = await supabase.from("skill_categories").delete().eq("id", id);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin");
  redirect("/admin?success=Skill%20category%20deleted");
}

export async function deleteSocialAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect("/admin?error=Social%20id%20missing");

  const { error } = await supabase.from("socials").delete().eq("id", id);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin");
  redirect("/admin?success=Social%20deleted");
}

export async function deleteBlogPostAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect("/admin?error=Blog%20post%20id%20missing");

  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/blog");
  revalidatePath("/admin");
  redirect("/admin?success=Blog%20post%20deleted");
}

export async function deleteBlogTagAction(formData: FormData) {
  const supabase = await requireUser();
  const id = toText(formData.get("id"));
  if (!id) redirect("/admin?error=Blog%20tag%20id%20missing");

  const { error } = await supabase.from("blog_tags").delete().eq("id", id);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/blog");
  revalidatePath("/admin");
  redirect("/admin?success=Blog%20tag%20deleted");
}
