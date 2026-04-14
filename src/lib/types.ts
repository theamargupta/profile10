export interface Profile {
  id: string;
  name: string;
  title: string;
  headline: string | null;
  subtitle: string | null;
  summary: string | null;
  bio_short: string | null;
  bio_long: string | null;
  how_i_work: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  avatar_url: string | null;
  resume_url: string | null;
  available_for: string | null;
  rate_range: string | null;
}

export interface Tool {
  id: string;
  name: string;
  icon: string;
  color: string | null;
}

export interface ProjectChallenge {
  id: string;
  project_id: string;
  title: string;
  solution: string;
  sort_order: number;
}

export interface ProjectFeature {
  id: string;
  project_id: string;
  feature: string;
  sort_order: number;
}

export interface ProjectTool {
  tool_id: string;
  sort_order: number;
  tools: Tool;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  demo_img: string | null;
  live_url: string | null;
  repo_url: string | null;
  featured: boolean;
  sort_order: number;
  architecture: string | null;
  project_tools: ProjectTool[];
  project_challenges: ProjectChallenge[];
  project_features: ProjectFeature[];
}

export interface Experience {
  id: string;
  company: string;
  job_title: string;
  employment_type: string | null;
  location: string | null;
  description: string | null;
  start_date: string;
  end_date: string | null;
  sort_order: number;
}

export interface SkillCategory {
  id: string;
  category: string;
  skills: string;
  sort_order: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  sort_order: number;
}

export interface Social {
  id: string;
  name: string;
  href: string;
  icon: string;
  color: string | null;
  sort_order: number;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  published: boolean;
  published_at: string | null;
  reading_time_minutes: number | null;
  created_at: string;
  blog_post_tags: { blog_tags: BlogTag }[];
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}
