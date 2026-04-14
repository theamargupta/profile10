import { createClient } from "@/lib/supabase/server";
import {
  getExperiences,
  getProfile,
  getProjects,
  getServices,
  getSkillCategories,
  getSocials,
} from "@/lib/queries";
import {
  loginAction,
  signOutAction,
  updateExperienceAction,
  updateProfileAction,
  updateProjectAction,
  updateServiceAction,
  updateSkillCategoryAction,
  updateSocialAction,
} from "@/app/admin/actions";
import { AdminTabs } from "@/app/admin/admin-tabs";
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

  const [profile, projects, services, experiences, skills, socials] =
    await Promise.all([
      getProfile(),
      getProjects(),
      getServices(),
      getExperiences(),
      getSkillCategories(),
      getSocials(),
    ]);

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
            <form action={signOutAction}>
              <Button type="submit" variant="secondary" size="sm">
                Sign Out
              </Button>
            </form>
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
              {socials.length} socials
            </span>
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
                  <input
                    name="name"
                    required
                    defaultValue={profile.name}
                    className={inputClass}
                  />
                </label>

                <label className="block space-y-2 text-sm">
                  <span className="text-foreground/80">Title</span>
                  <input
                    name="title"
                    required
                    defaultValue={profile.title}
                    className={inputClass}
                  />
                </label>
              </div>

              <label className="block space-y-2 text-sm">
                <span className="text-foreground/80">Headline</span>
                <textarea
                  name="headline"
                  rows={2}
                  defaultValue={profile.headline ?? ""}
                  className={inputClass}
                />
              </label>

              <label className="block space-y-2 text-sm">
                <span className="text-foreground/80">Subtitle</span>
                <textarea
                  name="subtitle"
                  rows={2}
                  defaultValue={profile.subtitle ?? ""}
                  className={inputClass}
                />
              </label>

              <label className="block space-y-2 text-sm">
                <span className="text-foreground/80">Short Bio</span>
                <textarea
                  name="bio_short"
                  rows={4}
                  defaultValue={profile.bio_short ?? ""}
                  className={inputClass}
                />
              </label>

              <label className="block space-y-2 text-sm">
                <span className="text-foreground/80">How I Work</span>
                <textarea
                  name="how_i_work"
                  rows={4}
                  defaultValue={profile.how_i_work ?? ""}
                  className={inputClass}
                />
              </label>

              <label className="block space-y-2 text-sm">
                <span className="text-foreground/80">Public Contact Email</span>
                <input
                  name="email"
                  type="email"
                  defaultValue={profile.email ?? ""}
                  className={inputClass}
                />
              </label>

              <div className="flex items-center justify-end">
                <Button type="submit" size="sm">
                  Save Profile
                </Button>
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
            <div className="mt-4 grid gap-4">
              {projects.map((project) => (
                <form key={project.id} action={updateProjectAction} className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
                  <input type="hidden" name="id" value={project.id} />
                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <input name="title" defaultValue={project.title} className={inputClass} />
                    <div className="flex items-center gap-3 rounded-xl border border-white/10 px-3 py-2 text-sm">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" name="featured" defaultChecked={project.featured} />
                        Featured
                      </label>
                      <input type="number" name="sort_order" defaultValue={project.sort_order} className="w-20 rounded-lg border border-white/15 bg-black/20 px-2 py-1" />
                    </div>
                  </div>
                  <textarea name="description" rows={3} defaultValue={project.description ?? ""} className={inputClass} />
                  <div className="grid gap-3 md:grid-cols-[1fr_200px]">
                    <input
                      name="demo_img"
                      defaultValue={project.demo_img ?? ""}
                      placeholder="Project image URL"
                      className={inputClass}
                    />
                    <div className="h-24 overflow-hidden rounded-xl border border-white/10 bg-black/25">
                      {project.demo_img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={project.demo_img}
                          alt={project.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-foreground/45">
                          No image
                        </div>
                      )}
                    </div>
                  </div>
                  <label className="block space-y-2 text-sm">
                    <span className="text-foreground/75">
                      Upload new image (overrides URL on save)
                    </span>
                    <input
                      type="file"
                      name="demo_img_file"
                      accept="image/*"
                      className="w-full rounded-xl border border-dashed border-white/20 bg-black/20 px-4 py-3 text-sm text-foreground/80"
                    />
                  </label>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input name="live_url" defaultValue={project.live_url ?? ""} placeholder="Live URL" className={inputClass} />
                    <input name="repo_url" defaultValue={project.repo_url ?? ""} placeholder="Repo URL" className={inputClass} />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" size="sm">Save Project</Button>
                  </div>
                </form>
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
            <div className="mt-4 grid gap-4">
              {services.map((service) => (
                <form key={service.id} action={updateServiceAction} className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
                  <input type="hidden" name="id" value={service.id} />
                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <input name="title" defaultValue={service.title} className={inputClass} />
                    <input type="number" name="sort_order" defaultValue={service.sort_order} className="w-24 rounded-lg border border-white/15 bg-black/20 px-3 py-2" />
                  </div>
                  <textarea name="description" rows={3} defaultValue={service.description} className={inputClass} />
                  <input name="icon" defaultValue={service.icon ?? ""} placeholder="Icon" className={inputClass} />
                  <div className="flex justify-end">
                    <Button type="submit" size="sm">Save Service</Button>
                  </div>
                </form>
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
            <div className="mt-4 grid gap-4">
              {experiences.map((experience) => (
                <form key={experience.id} action={updateExperienceAction} className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
                  <input type="hidden" name="id" value={experience.id} />
                  <div className="grid gap-3 md:grid-cols-2">
                    <input name="company" defaultValue={experience.company} className={inputClass} />
                    <input name="job_title" defaultValue={experience.job_title} className={inputClass} />
                  </div>
                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <input name="location" defaultValue={experience.location ?? ""} placeholder="Location" className={inputClass} />
                    <input type="number" name="sort_order" defaultValue={experience.sort_order} className="w-24 rounded-lg border border-white/15 bg-black/20 px-3 py-2" />
                  </div>
                  <textarea name="description" rows={3} defaultValue={experience.description ?? ""} className={inputClass} />
                  <div className="flex justify-end">
                    <Button type="submit" size="sm">Save Experience</Button>
                  </div>
                </form>
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
            <div className="mt-4 grid gap-4">
              {skills.map((skill) => (
                <form key={skill.id} action={updateSkillCategoryAction} className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
                  <input type="hidden" name="id" value={skill.id} />
                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <input name="category" defaultValue={skill.category} className={inputClass} />
                    <input type="number" name="sort_order" defaultValue={skill.sort_order} className="w-24 rounded-lg border border-white/15 bg-black/20 px-3 py-2" />
                  </div>
                  <textarea name="skills" rows={3} defaultValue={skill.skills} className={inputClass} />
                  <div className="flex justify-end">
                    <Button type="submit" size="sm">Save Skills</Button>
                  </div>
                </form>
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
            <div className="mt-4 grid gap-4">
              {socials.map((social) => (
                <form key={social.id} action={updateSocialAction} className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
                  <input type="hidden" name="id" value={social.id} />
                  <div className="grid gap-3 md:grid-cols-2">
                    <input name="name" defaultValue={social.name} className={inputClass} />
                    <input name="icon" defaultValue={social.icon} className={inputClass} />
                  </div>
                  <input name="href" defaultValue={social.href} className={inputClass} />
                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <input name="color" defaultValue={social.color ?? ""} placeholder="Color" className={inputClass} />
                    <input type="number" name="sort_order" defaultValue={social.sort_order} className="w-24 rounded-lg border border-white/15 bg-black/20 px-3 py-2" />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" size="sm">Save Social</Button>
                  </div>
                </form>
              ))}
            </div>
          </section>
              ),
            },
          ]}
        />
      </section>
    </main>
  );
}
