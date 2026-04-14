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
    bio_short: toText(formData.get("bio_short")),
    how_i_work: toText(formData.get("how_i_work")),
    email: toText(formData.get("email")),
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
    location: toText(formData.get("location")),
    description: toText(formData.get("description")),
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
