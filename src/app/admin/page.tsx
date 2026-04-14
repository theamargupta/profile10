import { createClient } from "@/lib/supabase/server";
import {
  getExperiences,
  getProfile,
  getProjects,
  getServices,
  getSkillCategories,
  getSocials,
  getTools,
  getContactSubmissions,
} from "@/lib/queries";
import {
  loginAction,
  createBlogPostAction,
  createBlogTagAction,
  createExperienceAction,
  createProjectAction,
  createServiceAction,
  createSkillCategoryAction,
  createSocialAction,
  updateBlogPostAction,
  updateBlogTagAction,
  signOutAction,
  updateExperienceAction,
  updateProfileAction,
  updateProjectAction,
  updateServiceAction,
  updateSkillCategoryAction,
  updateSocialAction,
  createToolAction,
  updateToolAction,
  deleteToolAction,
  createProjectFeatureAction,
  deleteProjectFeatureAction,
  createProjectChallengeAction,
  deleteProjectChallengeAction,
  addProjectToolAction,
  removeProjectToolAction,
  addBlogPostTagAction,
  removeBlogPostTagAction,
  markContactReadAction,
  deleteContactSubmissionAction,
  deleteProjectAction,
  deleteServiceAction,
  deleteExperienceAction,
  deleteSkillCategoryAction,
  deleteSocialAction,
  deleteBlogPostAction,
  deleteBlogTagAction,
} from "@/app/admin/actions";
import { AdminTabs } from "@/app/admin/admin-tabs";
import { CopyAllButton } from "@/app/admin/copy-all-button";
import { Button } from "@/components/ui/button";

type AdminPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function asMessage(value: string | string[] | undefined) {
  return typeof value === "string" ? value : null;
}

const inputClass =
  "w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-foreground outline-none ring-primary/40 transition placeholder:text-foreground/35 focus:ring-2";

const cardClass =
  "rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5";

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const success = asMessage(params.success);
  const error = asMessage(params.error);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="container mx-auto min-h-screen max-w-xl px-6 py-24">
        <section className="glass-panel rounded-3xl border border-white/10 p-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Admin Login
          </h1>
          <p className="mt-3 text-sm text-foreground/70">
            Sign in with your Supabase auth user to edit portfolio content.
          </p>
          {error ? (
            <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {success}
            </p>
          ) : null}

          <form action={loginAction} className="mt-8 space-y-4">
            <label className="block space-y-2 text-sm">
              <span className="text-foreground/80">Email</span>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-foreground outline-none ring-primary/40 transition focus:ring-2"
                placeholder="admin@example.com"
              />
            </label>

            <label className="block space-y-2 text-sm">
              <span className="text-foreground/80">Password</span>
              <input
                name="password"
                type="password"
                required
                className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-foreground outline-none ring-primary/40 transition focus:ring-2"
                placeholder="••••••••"
              />
            </label>

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </section>
      </main>
    );
  }

  const [profile, projects, services, experiences, skills, socials, tools, contactSubmissions] =
    await Promise.all([
      getProfile(),
      getProjects(),
      getServices(),
      getExperiences(),
      getSkillCategories(),
      getSocials(),
      getTools(),
      getContactSubmissions(),
    ]);
  const [{ data: blogPosts }, { data: blogTags }] = await Promise.all([
    supabase.from("blog_posts").select("*, blog_post_tags(blog_tags(*))").order("created_at", { ascending: false }),
    supabase.from("blog_tags").select("*").order("name"),
  ]);
  const unreadCount = contactSubmissions.filter((s) => !s.read).length;

  if (!profile) {
    return (
      <main className="container mx-auto min-h-screen max-w-2xl px-6 py-24">
        <section className="glass-panel rounded-3xl border border-white/10 p-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Admin
          </h1>
          <p className="mt-3 text-sm text-foreground/70">
            No profile row exists yet. Seed a profile first, then this editor will
            be available.
          </p>
          <form action={signOutAction} className="mt-8">
            <Button type="submit" variant="secondary">
              Sign Out
            </Button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="container mx-auto min-h-screen max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <section className="glass-panel rounded-3xl border border-white/10 p-5 md:p-8">
        <div className="sticky top-4 z-10 mb-6 rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                Admin Content Editor
              </h1>
              <p className="mt-1 text-xs text-foreground/70 md:text-sm">
                Clean editing flow for all portfolio sections.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CopyAllButton
                data={{
                  profile,
                  projects,
                  services,
                  experiences,
                  skills,
                  tools,
                  socials,
                  blogPosts: blogPosts ?? [],
                  blogTags: blogTags ?? [],
                  contactSubmissions,
                }}
              />
              <form action={signOutAction}>
                <Button type="submit" variant="secondary" size="sm">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-foreground/70">
            <span className="rounded-full border border-white/15 px-3 py-1">
              {projects.length} projects
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1">
              {services.length} services
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1">
              {experiences.length} experiences
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1">
              {skills.length} skill groups
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1">
              {tools.length} tools
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1">
              {socials.length} socials
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1">
              {(blogPosts ?? []).length} blog posts
            </span>
            {unreadCount > 0 && (
              <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-amber-200">
                {unreadCount} unread messages
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-medium tracking-tight text-foreground/90">
              Update and publish content quickly
            </h2>
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {success}
          </p>
        ) : null}

        <AdminTabs
          defaultTabId="profile"
          items={[
            {
              id: "profile",
              label: "Profile",
              content: (
                <section className={cardClass}>
            <h2 className="text-lg font-semibold text-foreground">Profile</h2>
            <form action={updateProfileAction} className="mt-5 space-y-5">
              <input type="hidden" name="id" value={profile.id} />

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-2 text-sm">
                  <span className="text-foreground/80">Name</span>
                  <input name="name" required defaultValue={profile.name} className={inputClass} />
                </label>
                <label className="block space-y-2 text-sm">
                  <span className="text-foreground/80">Title</span>
                  <input name="title" required defaultValue={profile.title} className={inputClass} />
                </label>
              </div>

              <label className="block space-y-2 text-sm">
                <span className="text-foreground/80">Headline</span>
                <textarea name="headline" rows={2} defaultValue={profile.headline ?? ""} className={inputClass} />
              </label>

              <label className="block space-y-2 text-sm">
                <span className="text-foreground/80">Subtitle</span>
                <textarea name="subtitle" rows={2} defaultValue={profile.subtitle ?? ""} className={inputClass} />
              </label>

              <label className="block space-y-2 text-sm">
                <span className="text-foreground/80">Summary</span>
                <textarea name="summary" rows={3} defaultValue={profile.summary ?? ""} className={inputClass} />
              </label>

              <label className="block space-y-2 text-sm">
                <span className="text-foreground/80">Short Bio</span>
                <textarea name="bio_short" rows={4} defaultValue={profile.bio_short ?? ""} className={inputClass} />
              </label>

              <label className="block space-y-2 text-sm">
                <span className="text-foreground/80">Long Bio</span>
                <textarea name="bio_long" rows={6} defaultValue={profile.bio_long ?? ""} className={inputClass} />
              </label>

              <label className="block space-y-2 text-sm">
                <span className="text-foreground/80">How I Work</span>
                <textarea name="how_i_work" rows={4} defaultValue={profile.how_i_work ?? ""} className={inputClass} />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-2 text-sm">
                  <span className="text-foreground/80">Email</span>
                  <input name="email" type="email" defaultValue={profile.email ?? ""} className={inputClass} />
                </label>
                <label className="block space-y-2 text-sm">
                  <span className="text-foreground/80">Phone</span>
                  <input name="phone" defaultValue={profile.phone ?? ""} className={inputClass} />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-2 text-sm">
                  <span className="text-foreground/80">Location</span>
                  <input name="location" defaultValue={profile.location ?? ""} className={inputClass} />
                </label>
                <label className="block space-y-2 text-sm">
                  <span className="text-foreground/80">Website</span>
                  <input name="website" defaultValue={profile.website ?? ""} className={inputClass} />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-2 text-sm">
                  <span className="text-foreground/80">Avatar URL</span>
                  <input name="avatar_url" defaultValue={profile.avatar_url ?? ""} className={inputClass} />
                </label>
                <label className="block space-y-2 text-sm">
                  <span className="text-foreground/80">Resume URL</span>
                  <input name="resume_url" defaultValue={profile.resume_url ?? ""} className={inputClass} />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-2 text-sm">
                  <span className="text-foreground/80">Available For</span>
                  <input name="available_for" defaultValue={profile.available_for ?? ""} placeholder="e.g. Freelance, Full-time" className={inputClass} />
                </label>
                <label className="block space-y-2 text-sm">
                  <span className="text-foreground/80">Rate Range</span>
                  <input name="rate_range" defaultValue={profile.rate_range ?? ""} placeholder="e.g. $100-150/hr" className={inputClass} />
                </label>
              </div>

              <div className="flex items-center justify-end">
                <Button type="submit" size="sm">Save Profile</Button>
              </div>
            </form>
          </section>
              ),
            },
            {
              id: "projects",
              label: "Projects",
              count: projects.length,
              content: (
                <section className={cardClass}>
                  <h2 className="text-lg font-semibold text-foreground">Projects</h2>

                  <details className="mt-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
                    <summary className="cursor-pointer list-none text-sm font-medium text-primary">
                      + Create New Project
                    </summary>
                    <form action={createProjectAction} className="mt-4 space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="block space-y-2 text-sm">
                          <span className="text-foreground/80">Title</span>
                          <input name="title" placeholder="Project title" required className={inputClass} />
                        </label>
                        <label className="block space-y-2 text-sm">
                          <span className="text-foreground/80">Slug ID</span>
                          <input name="id" placeholder="Auto from title if empty" className={inputClass} />
                        </label>
                      </div>
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Description</span>
                        <textarea name="description" rows={3} placeholder="Description" className={inputClass} />
                      </label>
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Architecture</span>
                        <textarea name="architecture" rows={2} placeholder="Architecture description" className={inputClass} />
                      </label>
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="block space-y-2 text-sm">
                          <span className="text-foreground/80">Live URL</span>
                          <input name="live_url" placeholder="https://..." className={inputClass} />
                        </label>
                        <label className="block space-y-2 text-sm">
                          <span className="text-foreground/80">Repo URL</span>
                          <input name="repo_url" placeholder="https://github.com/..." className={inputClass} />
                        </label>
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" name="featured" />
                          Featured
                        </label>
                        <label className="block space-y-1 text-sm">
                          <span className="text-foreground/80">Sort</span>
                          <input type="number" name="sort_order" defaultValue={0} className="w-24 rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm" />
                        </label>
                        <Button type="submit" size="sm">Create Project</Button>
                      </div>
                    </form>
                  </details>

            <div className="mt-4 grid gap-4">
              {projects.map((project) => (
                <div key={project.id} className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
                  <form action={updateProjectAction} className="space-y-3">
                    <input type="hidden" name="id" value={project.id} />
                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Title</span>
                        <input name="title" defaultValue={project.title} className={inputClass} />
                      </label>
                      <div className="flex items-center gap-3 rounded-xl border border-white/10 px-3 py-2 text-sm">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" name="featured" defaultChecked={project.featured} />
                          Featured
                        </label>
                        <label className="block space-y-1">
                          <span className="text-foreground/60">Sort</span>
                          <input type="number" name="sort_order" defaultValue={project.sort_order} className="w-20 rounded-lg border border-white/15 bg-black/20 px-2 py-1" />
                        </label>
                      </div>
                    </div>
                    <label className="block space-y-2 text-sm">
                      <span className="text-foreground/80">Description</span>
                      <textarea name="description" rows={3} defaultValue={project.description ?? ""} className={inputClass} />
                    </label>
                    <label className="block space-y-2 text-sm">
                      <span className="text-foreground/80">Architecture</span>
                      <textarea name="architecture" rows={2} defaultValue={project.architecture ?? ""} placeholder="Architecture description" className={inputClass} />
                    </label>
                    <div className="grid gap-3 md:grid-cols-[1fr_200px]">
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Image URL</span>
                        <input name="demo_img" defaultValue={project.demo_img ?? ""} placeholder="Project image URL" className={inputClass} />
                      </label>
                      <div className="h-24 overflow-hidden rounded-xl border border-white/10 bg-black/25">
                        {project.demo_img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={project.demo_img} alt={project.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-foreground/45">No image</div>
                        )}
                      </div>
                    </div>
                    <label className="block space-y-2 text-sm">
                      <span className="text-foreground/75">Upload new image (overrides URL on save)</span>
                      <input type="file" name="demo_img_file" accept="image/*" className="w-full rounded-xl border border-dashed border-white/20 bg-black/20 px-4 py-3 text-sm text-foreground/80" />
                    </label>
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Live URL</span>
                        <input name="live_url" defaultValue={project.live_url ?? ""} placeholder="https://..." className={inputClass} />
                      </label>
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Repo URL</span>
                        <input name="repo_url" defaultValue={project.repo_url ?? ""} placeholder="https://github.com/..." className={inputClass} />
                      </label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="submit" size="sm">Save Project</Button>
                    </div>
                  </form>

                  {/* ── Project Tools ── */}
                  <details className="rounded-lg border border-white/10 p-3">
                    <summary className="cursor-pointer text-xs font-medium text-foreground/70">
                      Tools ({project.project_tools.length})
                    </summary>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {project.project_tools.map((pt) => (
                        <form key={pt.tool_id} action={removeProjectToolAction} className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs">
                          <input type="hidden" name="project_id" value={project.id} />
                          <input type="hidden" name="tool_id" value={pt.tool_id} />
                          <span>{pt.tools.name}</span>
                          <button type="submit" className="ml-1 text-red-400 hover:text-red-300" title="Remove tool">&times;</button>
                        </form>
                      ))}
                    </div>
                    <form action={addProjectToolAction} className="mt-2 flex items-end gap-2">
                      <input type="hidden" name="project_id" value={project.id} />
                      <label className="block flex-1 space-y-1 text-xs">
                        <span className="text-foreground/60">Tool</span>
                        <select name="tool_id" className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm text-foreground">
                          {tools
                            .filter((t) => !project.project_tools.some((pt) => pt.tool_id === t.id))
                            .map((t) => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                      </label>
                      <label className="block space-y-1 text-xs">
                        <span className="text-foreground/60">Sort</span>
                        <input type="number" name="sort_order" defaultValue={0} className="w-16 rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-sm" />
                      </label>
                      <Button type="submit" size="sm" variant="secondary">Add</Button>
                    </form>
                  </details>

                  {/* ── Project Features ── */}
                  <details className="rounded-lg border border-white/10 p-3">
                    <summary className="cursor-pointer text-xs font-medium text-foreground/70">
                      Features ({project.project_features.length})
                    </summary>
                    <div className="mt-2 space-y-1">
                      {project.project_features.map((f) => (
                        <form key={f.id} action={deleteProjectFeatureAction} className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-xs">
                          <input type="hidden" name="id" value={f.id} />
                          <span className="flex-1">{f.feature}</span>
                          <button type="submit" className="ml-2 text-red-400 hover:text-red-300" title="Remove">&times;</button>
                        </form>
                      ))}
                    </div>
                    <form action={createProjectFeatureAction} className="mt-2 flex items-end gap-2">
                      <input type="hidden" name="project_id" value={project.id} />
                      <label className="block flex-1 space-y-1 text-xs">
                        <span className="text-foreground/60">Feature</span>
                        <input name="feature" placeholder="New feature" required className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm text-foreground" />
                      </label>
                      <label className="block space-y-1 text-xs">
                        <span className="text-foreground/60">Sort</span>
                        <input type="number" name="sort_order" defaultValue={0} className="w-16 rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-sm" />
                      </label>
                      <Button type="submit" size="sm" variant="secondary">Add</Button>
                    </form>
                  </details>

                  {/* ── Project Challenges ── */}
                  <details className="rounded-lg border border-white/10 p-3">
                    <summary className="cursor-pointer text-xs font-medium text-foreground/70">
                      Challenges ({project.project_challenges.length})
                    </summary>
                    <div className="mt-2 space-y-1">
                      {project.project_challenges.map((c) => (
                        <form key={c.id} action={deleteProjectChallengeAction} className="flex items-start justify-between rounded-lg border border-white/10 px-3 py-2 text-xs">
                          <input type="hidden" name="id" value={c.id} />
                          <div className="flex-1">
                            <p className="font-medium">{c.title}</p>
                            <p className="text-foreground/60">{c.solution}</p>
                          </div>
                          <button type="submit" className="ml-2 text-red-400 hover:text-red-300" title="Remove">&times;</button>
                        </form>
                      ))}
                    </div>
                    <form action={createProjectChallengeAction} className="mt-2 space-y-2">
                      <input type="hidden" name="project_id" value={project.id} />
                      <label className="block space-y-1 text-xs">
                        <span className="text-foreground/60">Challenge Title</span>
                        <input name="title" placeholder="Challenge title" required className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm text-foreground" />
                      </label>
                      <label className="block space-y-1 text-xs">
                        <span className="text-foreground/60">Solution</span>
                        <input name="solution" placeholder="Solution" required className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm text-foreground" />
                      </label>
                      <div className="flex items-end gap-2">
                        <label className="block space-y-1 text-xs">
                          <span className="text-foreground/60">Sort</span>
                          <input type="number" name="sort_order" defaultValue={0} className="w-16 rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-sm" />
                        </label>
                        <Button type="submit" size="sm" variant="secondary">Add Challenge</Button>
                      </div>
                    </form>
                  </details>

                  {/* ── Delete Project ── */}
                  <form action={deleteProjectAction} className="flex justify-end">
                    <input type="hidden" name="id" value={project.id} />
                    <button type="submit" className="text-xs text-red-400/70 hover:text-red-300">Delete project</button>
                  </form>
                </div>
              ))}
            </div>
          </section>
              ),
            },
            {
              id: "services",
              label: "Services",
              count: services.length,
              content: (
                <section className={cardClass}>
                  <h2 className="text-lg font-semibold text-foreground">Services</h2>

                  <details className="mt-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
                    <summary className="cursor-pointer list-none text-sm font-medium text-primary">
                      + Create New Service
                    </summary>
                    <form action={createServiceAction} className="mt-4 space-y-3">
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Title</span>
                        <input name="title" placeholder="Service title" required className={inputClass} />
                      </label>
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Description</span>
                        <textarea name="description" rows={3} placeholder="Description" required className={inputClass} />
                      </label>
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="block space-y-2 text-sm">
                          <span className="text-foreground/80">Icon</span>
                          <input name="icon" placeholder="Icon name" className={inputClass} />
                        </label>
                        <label className="block space-y-2 text-sm">
                          <span className="text-foreground/80">Sort Order</span>
                          <input type="number" name="sort_order" defaultValue={0} className={inputClass} />
                        </label>
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" size="sm">Create Service</Button>
                      </div>
                    </form>
                  </details>

            <div className="mt-4 grid gap-4">
              {services.map((service) => (
                <div key={service.id} className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
                  <form action={updateServiceAction} className="space-y-3">
                    <input type="hidden" name="id" value={service.id} />
                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Title</span>
                        <input name="title" defaultValue={service.title} className={inputClass} />
                      </label>
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Sort</span>
                        <input type="number" name="sort_order" defaultValue={service.sort_order} className="w-24 rounded-lg border border-white/15 bg-black/20 px-3 py-2" />
                      </label>
                    </div>
                    <label className="block space-y-2 text-sm">
                      <span className="text-foreground/80">Description</span>
                      <textarea name="description" rows={3} defaultValue={service.description} className={inputClass} />
                    </label>
                    <label className="block space-y-2 text-sm">
                      <span className="text-foreground/80">Icon</span>
                      <input name="icon" defaultValue={service.icon ?? ""} placeholder="Icon name" className={inputClass} />
                    </label>
                    <div className="flex justify-end">
                      <Button type="submit" size="sm">Save Service</Button>
                    </div>
                  </form>
                  <form action={deleteServiceAction} className="flex justify-end">
                    <input type="hidden" name="id" value={service.id} />
                    <button type="submit" className="text-xs text-red-400/70 hover:text-red-300">Delete service</button>
                  </form>
                </div>
              ))}
            </div>
          </section>
              ),
            },
            {
              id: "experience",
              label: "Experience",
              count: experiences.length,
              content: (
                <section className={cardClass}>
                  <h2 className="text-lg font-semibold text-foreground">Experience</h2>

                  <details className="mt-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
                    <summary className="cursor-pointer list-none text-sm font-medium text-primary">
                      + Create New Experience
                    </summary>
                    <form action={createExperienceAction} className="mt-4 space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="block space-y-2 text-sm">
                          <span className="text-foreground/80">Company</span>
                          <input name="company" placeholder="Company" required className={inputClass} />
                        </label>
                        <label className="block space-y-2 text-sm">
                          <span className="text-foreground/80">Job Title</span>
                          <input name="job_title" placeholder="Job title" required className={inputClass} />
                        </label>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <label className="block space-y-2 text-sm">
                          <span className="text-foreground/80">Employment Type</span>
                          <input name="employment_type" placeholder="e.g. Full-time, Contract" className={inputClass} />
                        </label>
                        <label className="block space-y-2 text-sm">
                          <span className="text-foreground/80">Start Date</span>
                          <input name="start_date" type="date" required className={inputClass} />
                        </label>
                        <label className="block space-y-2 text-sm">
                          <span className="text-foreground/80">End Date</span>
                          <input name="end_date" type="date" className={inputClass} />
                        </label>
                      </div>
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Location</span>
                        <input name="location" placeholder="Location" className={inputClass} />
                      </label>
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Description</span>
                        <textarea name="description" rows={3} placeholder="Description" className={inputClass} />
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="block space-y-1 text-sm">
                          <span className="text-foreground/80">Sort</span>
                          <input type="number" name="sort_order" defaultValue={0} className="w-24 rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm" />
                        </label>
                        <Button type="submit" size="sm">Create Experience</Button>
                      </div>
                    </form>
                  </details>

            <div className="mt-4 grid gap-4">
              {experiences.map((experience) => (
                <div key={experience.id} className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
                  <form action={updateExperienceAction} className="space-y-3">
                    <input type="hidden" name="id" value={experience.id} />
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Company</span>
                        <input name="company" defaultValue={experience.company} className={inputClass} />
                      </label>
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Job Title</span>
                        <input name="job_title" defaultValue={experience.job_title} className={inputClass} />
                      </label>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Employment Type</span>
                        <input name="employment_type" defaultValue={experience.employment_type ?? ""} placeholder="e.g. Full-time, Contract" className={inputClass} />
                      </label>
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Start Date</span>
                        <input name="start_date" type="date" defaultValue={experience.start_date} className={inputClass} />
                      </label>
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">End Date</span>
                        <input name="end_date" type="date" defaultValue={experience.end_date ?? ""} className={inputClass} />
                      </label>
                    </div>
                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Location</span>
                        <input name="location" defaultValue={experience.location ?? ""} placeholder="Location" className={inputClass} />
                      </label>
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Sort</span>
                        <input type="number" name="sort_order" defaultValue={experience.sort_order} className="w-24 rounded-lg border border-white/15 bg-black/20 px-3 py-2" />
                      </label>
                    </div>
                    <label className="block space-y-2 text-sm">
                      <span className="text-foreground/80">Description</span>
                      <textarea name="description" rows={3} defaultValue={experience.description ?? ""} className={inputClass} />
                    </label>
                    <div className="flex justify-end">
                      <Button type="submit" size="sm">Save Experience</Button>
                    </div>
                  </form>
                  <form action={deleteExperienceAction} className="flex justify-end">
                    <input type="hidden" name="id" value={experience.id} />
                    <button type="submit" className="text-xs text-red-400/70 hover:text-red-300">Delete experience</button>
                  </form>
                </div>
              ))}
            </div>
          </section>
              ),
            },
            {
              id: "skills",
              label: "Skills",
              count: skills.length,
              content: (
                <section className={cardClass}>
                  <h2 className="text-lg font-semibold text-foreground">Skill Categories</h2>

                  <details className="mt-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
                    <summary className="cursor-pointer list-none text-sm font-medium text-primary">
                      + Create New Skill Category
                    </summary>
                    <form action={createSkillCategoryAction} className="mt-4 space-y-3">
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Category Name</span>
                        <input name="category" placeholder="Category name" required className={inputClass} />
                      </label>
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Skills (comma-separated)</span>
                        <textarea name="skills" rows={3} placeholder="React, Vue, Angular..." required className={inputClass} />
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="block space-y-1 text-sm">
                          <span className="text-foreground/80">Sort</span>
                          <input type="number" name="sort_order" defaultValue={0} className="w-24 rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm" />
                        </label>
                        <Button type="submit" size="sm">Create Category</Button>
                      </div>
                    </form>
                  </details>

            <div className="mt-4 grid gap-4">
              {skills.map((skill) => (
                <div key={skill.id} className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
                  <form action={updateSkillCategoryAction} className="space-y-3">
                    <input type="hidden" name="id" value={skill.id} />
                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Category</span>
                        <input name="category" defaultValue={skill.category} className={inputClass} />
                      </label>
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Sort</span>
                        <input type="number" name="sort_order" defaultValue={skill.sort_order} className="w-24 rounded-lg border border-white/15 bg-black/20 px-3 py-2" />
                      </label>
                    </div>
                    <label className="block space-y-2 text-sm">
                      <span className="text-foreground/80">Skills</span>
                      <textarea name="skills" rows={3} defaultValue={skill.skills} className={inputClass} />
                    </label>
                    <div className="flex justify-end">
                      <Button type="submit" size="sm">Save Skills</Button>
                    </div>
                  </form>
                  <form action={deleteSkillCategoryAction} className="flex justify-end">
                    <input type="hidden" name="id" value={skill.id} />
                    <button type="submit" className="text-xs text-red-400/70 hover:text-red-300">Delete category</button>
                  </form>
                </div>
              ))}
            </div>
          </section>
              ),
            },
            {
              id: "socials",
              label: "Socials",
              count: socials.length,
              content: (
                <section className={cardClass}>
                  <h2 className="text-lg font-semibold text-foreground">Social Links</h2>

                  <details className="mt-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
                    <summary className="cursor-pointer list-none text-sm font-medium text-primary">
                      + Create New Social
                    </summary>
                    <form action={createSocialAction} className="mt-4 space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="block space-y-2 text-sm">
                          <span className="text-foreground/80">Name</span>
                          <input name="name" placeholder="e.g. GitHub" required className={inputClass} />
                        </label>
                        <label className="block space-y-2 text-sm">
                          <span className="text-foreground/80">Icon</span>
                          <input name="icon" placeholder="Icon component name" required className={inputClass} />
                        </label>
                      </div>
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">URL</span>
                        <input name="href" placeholder="https://..." required className={inputClass} />
                      </label>
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="block space-y-2 text-sm">
                          <span className="text-foreground/80">Color</span>
                          <input name="color" placeholder="Hex color (optional)" className={inputClass} />
                        </label>
                        <label className="block space-y-2 text-sm">
                          <span className="text-foreground/80">Sort Order</span>
                          <input type="number" name="sort_order" defaultValue={0} className={inputClass} />
                        </label>
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" size="sm">Create Social</Button>
                      </div>
                    </form>
                  </details>

            <div className="mt-4 grid gap-4">
              {socials.map((social) => (
                <div key={social.id} className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
                  <form action={updateSocialAction} className="space-y-3">
                    <input type="hidden" name="id" value={social.id} />
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Name</span>
                        <input name="name" defaultValue={social.name} className={inputClass} />
                      </label>
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Icon</span>
                        <input name="icon" defaultValue={social.icon} className={inputClass} />
                      </label>
                    </div>
                    <label className="block space-y-2 text-sm">
                      <span className="text-foreground/80">URL</span>
                      <input name="href" defaultValue={social.href} className={inputClass} />
                    </label>
                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Color</span>
                        <input name="color" defaultValue={social.color ?? ""} placeholder="Hex color" className={inputClass} />
                      </label>
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Sort</span>
                        <input type="number" name="sort_order" defaultValue={social.sort_order} className="w-24 rounded-lg border border-white/15 bg-black/20 px-3 py-2" />
                      </label>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" size="sm">Save Social</Button>
                    </div>
                  </form>
                  <form action={deleteSocialAction} className="flex justify-end">
                    <input type="hidden" name="id" value={social.id} />
                    <button type="submit" className="text-xs text-red-400/70 hover:text-red-300">Delete social</button>
                  </form>
                </div>
              ))}
            </div>
          </section>
              ),
            },
            {
              id: "blog",
              label: "Blog",
              count: (blogPosts ?? []).length,
              content: (
                <section className={cardClass}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Blog Posts</h2>
                  </div>

                  <details className="mt-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
                    <summary className="cursor-pointer list-none text-sm font-medium text-primary">
                      + Create New Post
                    </summary>
                    <form action={createBlogPostAction} className="mt-4 space-y-3">
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Title</span>
                        <input name="title" placeholder="Post title" required className={inputClass} />
                      </label>
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Slug</span>
                        <input name="slug" placeholder="Auto-generated if empty" className={inputClass} />
                      </label>
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Excerpt</span>
                        <textarea name="excerpt" rows={2} placeholder="Short excerpt" className={inputClass} />
                      </label>
                      <label className="block space-y-2 text-sm">
                        <span className="text-foreground/80">Content (HTML supported)</span>
                        <textarea name="content" rows={8} placeholder="Post content..." className={inputClass} />
                      </label>
                      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
                        <label className="block space-y-2 text-sm">
                          <span className="text-foreground/80">Cover Image URL</span>
                          <input name="cover_image" placeholder="https://..." className={inputClass} />
                        </label>
                        <label className="block space-y-2 text-sm">
                          <span className="text-foreground/80">Read Time</span>
                          <input name="reading_time_minutes" type="number" min={1} defaultValue={5} className="w-24 rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm" />
                        </label>
                        <label className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm">
                          <input type="checkbox" name="published" />
                          Publish now
                        </label>
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" size="sm">Create Post</Button>
                      </div>
                    </form>
                  </details>

                  <div className="mt-4 grid gap-4">
                    {(blogPosts ?? []).map((post: Record<string, unknown>) => {
                      const postTags = (post.blog_post_tags as { blog_tags: { id: string; name: string; slug: string } }[] | undefined) ?? [];
                      return (
                      <div key={post.id as string} className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
                        <form action={updateBlogPostAction} className="space-y-3">
                          <input type="hidden" name="id" value={post.id as string} />
                          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                            <label className="block space-y-2 text-sm">
                              <span className="text-foreground/80">Title</span>
                              <input name="title" defaultValue={post.title as string} className={inputClass} />
                            </label>
                            <label className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm">
                              <input type="checkbox" name="published" defaultChecked={post.published as boolean} />
                              Published
                            </label>
                          </div>
                          <label className="block space-y-2 text-sm">
                            <span className="text-foreground/80">Slug</span>
                            <input name="slug" defaultValue={post.slug as string} className={inputClass} />
                          </label>
                          <label className="block space-y-2 text-sm">
                            <span className="text-foreground/80">Excerpt</span>
                            <textarea name="excerpt" rows={2} placeholder="Excerpt" defaultValue={(post.excerpt as string) ?? ""} className={inputClass} />
                          </label>
                          <label className="block space-y-2 text-sm">
                            <span className="text-foreground/80">Content (HTML supported)</span>
                            <textarea name="content" rows={10} placeholder="Post content..." defaultValue={(post.content as string) ?? ""} className={inputClass} />
                          </label>
                          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                            <label className="block space-y-2 text-sm">
                              <span className="text-foreground/80">Cover Image URL</span>
                              <input name="cover_image" defaultValue={(post.cover_image as string) ?? ""} placeholder="https://..." className={inputClass} />
                            </label>
                            <label className="block space-y-2 text-sm">
                              <span className="text-foreground/80">Read Time</span>
                              <input name="reading_time_minutes" type="number" min={1} defaultValue={(post.reading_time_minutes as number) ?? 5} className="w-28 rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm" />
                            </label>
                          </div>
                          <div className="flex justify-end">
                            <Button type="submit" size="sm">Save Post</Button>
                          </div>
                        </form>

                        {/* ── Post Tags ── */}
                        <details className="rounded-lg border border-white/10 p-3">
                          <summary className="cursor-pointer text-xs font-medium text-foreground/70">
                            Tags ({postTags.length})
                          </summary>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {postTags.map((pt) => (
                              <form key={pt.blog_tags.id} action={removeBlogPostTagAction} className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs">
                                <input type="hidden" name="post_id" value={post.id as string} />
                                <input type="hidden" name="tag_id" value={pt.blog_tags.id} />
                                <span>{pt.blog_tags.name}</span>
                                <button type="submit" className="ml-1 text-red-400 hover:text-red-300">&times;</button>
                              </form>
                            ))}
                          </div>
                          <form action={addBlogPostTagAction} className="mt-2 flex items-end gap-2">
                            <input type="hidden" name="post_id" value={post.id as string} />
                            <label className="block flex-1 space-y-1 text-xs">
                              <span className="text-foreground/60">Tag</span>
                              <select name="tag_id" className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm text-foreground">
                                {(blogTags ?? [])
                                  .filter((t) => !postTags.some((pt) => pt.blog_tags.id === t.id))
                                  .map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                  ))}
                              </select>
                            </label>
                            <Button type="submit" size="sm" variant="secondary">Add Tag</Button>
                          </form>
                        </details>

                        <form action={deleteBlogPostAction} className="flex justify-end">
                          <input type="hidden" name="id" value={post.id as string} />
                          <button type="submit" className="text-xs text-red-400/70 hover:text-red-300">Delete post</button>
                        </form>
                      </div>
                      );
                    })}
                  </div>

                  <h3 className="mt-8 text-base font-semibold text-foreground">Blog Tags</h3>

                  <details className="mt-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
                    <summary className="cursor-pointer list-none text-sm font-medium text-primary">
                      + Create New Tag
                    </summary>
                    <form action={createBlogTagAction} className="mt-4 space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="block space-y-2 text-sm">
                          <span className="text-foreground/80">Tag Name</span>
                          <input name="name" placeholder="Tag name" required className={inputClass} />
                        </label>
                        <label className="block space-y-2 text-sm">
                          <span className="text-foreground/80">Slug</span>
                          <input name="slug" placeholder="Auto-generated if empty" className={inputClass} />
                        </label>
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" size="sm">Create Tag</Button>
                      </div>
                    </form>
                  </details>

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {(blogTags ?? []).map((tag) => (
                      <div key={tag.id} className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
                        <form action={updateBlogTagAction} className="space-y-3">
                          <input type="hidden" name="id" value={tag.id} />
                          <label className="block space-y-2 text-sm">
                            <span className="text-foreground/80">Name</span>
                            <input name="name" defaultValue={tag.name} className={inputClass} />
                          </label>
                          <label className="block space-y-2 text-sm">
                            <span className="text-foreground/80">Slug</span>
                            <input name="slug" defaultValue={tag.slug} className={inputClass} />
                          </label>
                          <div className="flex justify-end">
                            <Button type="submit" size="sm">Save Tag</Button>
                          </div>
                        </form>
                        <form action={deleteBlogTagAction} className="flex justify-end">
                          <input type="hidden" name="id" value={tag.id} />
                          <button type="submit" className="text-xs text-red-400/70 hover:text-red-300">Delete tag</button>
                        </form>
                      </div>
                    ))}
                  </div>
                </section>
              ),
            },
            {
              id: "tools",
              label: "Tools",
              count: tools.length,
              content: (
                <section className={cardClass}>
                  <h2 className="text-lg font-semibold text-foreground">Tools</h2>

                  <details className="mt-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
                    <summary className="cursor-pointer list-none text-sm font-medium text-primary">
                      + Create New Tool
                    </summary>
                    <form action={createToolAction} className="mt-4 space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="block space-y-2 text-sm">
                          <span className="text-foreground/80">Name</span>
                          <input name="name" placeholder="e.g. React" required className={inputClass} />
                        </label>
                        <label className="block space-y-2 text-sm">
                          <span className="text-foreground/80">Slug ID</span>
                          <input name="id" placeholder="Auto from name if empty" className={inputClass} />
                        </label>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="block space-y-2 text-sm">
                          <span className="text-foreground/80">Icon Component</span>
                          <input name="icon" placeholder="e.g. SiReact" required className={inputClass} />
                        </label>
                        <label className="block space-y-2 text-sm">
                          <span className="text-foreground/80">Color</span>
                          <input name="color" placeholder="e.g. #61DAFB" className={inputClass} />
                        </label>
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" size="sm">Create Tool</Button>
                      </div>
                    </form>
                  </details>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {tools.map((tool) => (
                      <div key={tool.id} className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
                        <form action={updateToolAction} className="space-y-3">
                          <input type="hidden" name="id" value={tool.id} />
                          <label className="block space-y-2 text-sm">
                            <span className="text-foreground/80">Name</span>
                            <input name="name" defaultValue={tool.name} className={inputClass} />
                          </label>
                          <div className="grid gap-3 grid-cols-2">
                            <label className="block space-y-2 text-sm">
                              <span className="text-foreground/80">Icon</span>
                              <input name="icon" defaultValue={tool.icon} placeholder="Icon component" className={inputClass} />
                            </label>
                            <label className="block space-y-2 text-sm">
                              <span className="text-foreground/80">Color</span>
                              <div className="flex items-center gap-2">
                                <input name="color" defaultValue={tool.color ?? ""} placeholder="Hex color" className={inputClass} />
                                {tool.color && (
                                  <span className="inline-block h-8 w-8 shrink-0 rounded-lg border border-white/15" style={{ backgroundColor: tool.color }} />
                                )}
                              </div>
                            </label>
                          </div>
                          <div className="flex justify-end">
                            <Button type="submit" size="sm">Save Tool</Button>
                          </div>
                        </form>
                        <form action={deleteToolAction} className="flex justify-end">
                          <input type="hidden" name="id" value={tool.id} />
                          <button type="submit" className="text-xs text-red-400/70 hover:text-red-300">Delete tool</button>
                        </form>
                      </div>
                    ))}
                  </div>
                </section>
              ),
            },
            {
              id: "contacts",
              label: "Contacts",
              count: contactSubmissions.length,
              content: (
                <section className={cardClass}>
                  <h2 className="text-lg font-semibold text-foreground">
                    Contact Submissions
                    {unreadCount > 0 && (
                      <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-200">
                        {unreadCount} unread
                      </span>
                    )}
                  </h2>

                  {contactSubmissions.length === 0 ? (
                    <p className="mt-4 text-sm text-foreground/50">No submissions yet.</p>
                  ) : (
                    <div className="mt-4 grid gap-3">
                      {contactSubmissions.map((sub) => (
                        <div
                          key={sub.id}
                          className={`rounded-xl border p-4 ${
                            sub.read
                              ? "border-white/10 bg-black/20"
                              : "border-amber-400/20 bg-amber-500/5"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-foreground">{sub.name}</p>
                                {!sub.read && (
                                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-200">
                                    New
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-foreground/60">{sub.email}</p>
                              <p className="mt-2 text-sm text-foreground/80 whitespace-pre-wrap">{sub.message}</p>
                              <p className="mt-2 text-[10px] text-foreground/40">
                                {new Date(sub.created_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex shrink-0 gap-2">
                              {!sub.read && (
                                <form action={markContactReadAction}>
                                  <input type="hidden" name="id" value={sub.id} />
                                  <button type="submit" className="rounded-lg border border-white/15 px-2 py-1 text-xs text-foreground/70 hover:text-foreground">
                                    Mark read
                                  </button>
                                </form>
                              )}
                              <form action={deleteContactSubmissionAction}>
                                <input type="hidden" name="id" value={sub.id} />
                                <button type="submit" className="text-xs text-red-400/70 hover:text-red-300">Delete</button>
                              </form>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ),
            },
          ]}
        />
      </section>
    </main>
  );
}
