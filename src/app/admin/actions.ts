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
