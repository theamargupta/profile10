-- ============================================
-- FULL MIGRATION: Tables + Seed + RLS
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- 1. PROFILES
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text not null,
  headline text,
  subtitle text,
  summary text,
  bio_short text,
  bio_long text,
  how_i_work text,
  email text,
  phone text,
  location text,
  website text,
  avatar_url text,
  resume_url text,
  available_for text,
  rate_range text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. TOOLS
create table if not exists tools (
  id text primary key,
  name text not null,
  icon text not null,
  color text,
  created_at timestamptz default now()
);

-- 3. PROJECTS + JUNCTION TABLES
create table if not exists projects (
  id text primary key,
  title text not null,
  description text,
  demo_img text,
  live_url text,
  repo_url text,
  featured boolean default false,
  sort_order int default 0,
  architecture text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists project_tools (
  project_id text not null references projects(id) on delete cascade,
  tool_id text not null references tools(id) on delete cascade,
  sort_order int default 0,
  primary key (project_id, tool_id)
);

create table if not exists project_challenges (
  id uuid primary key default gen_random_uuid(),
  project_id text not null references projects(id) on delete cascade,
  title text not null,
  solution text not null,
  sort_order int default 0
);

create table if not exists project_features (
  id uuid primary key default gen_random_uuid(),
  project_id text not null references projects(id) on delete cascade,
  feature text not null,
  sort_order int default 0
);

-- 4. EXPERIENCES
create table if not exists experiences (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  company text not null,
  job_title text not null,
  employment_type text,
  location text,
  description text,
  start_date date not null,
  end_date date,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 5. SKILL CATEGORIES
create table if not exists skill_categories (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  category text not null,
  skills text not null,
  sort_order int default 0
);

-- 6. SERVICES
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text not null,
  icon text,
  sort_order int default 0
);

-- 7. SOCIALS
create table if not exists socials (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  name text not null,
  href text not null,
  icon text not null,
  color text,
  sort_order int default 0
);

-- 8. BLOG
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content text,
  cover_image text,
  published boolean default false,
  published_at timestamptz,
  reading_time_minutes int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists blog_tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null
);

create table if not exists blog_post_tags (
  post_id uuid not null references blog_posts(id) on delete cascade,
  tag_id uuid not null references blog_tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- 9. CONTACT SUBMISSIONS
create table if not exists contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- SEED DATA
-- ============================================

-- Profile
insert into profiles (id, name, title, headline, subtitle, summary, bio_short, bio_long, how_i_work, email, phone, location, website, avatar_url, resume_url, available_for, rate_range)
values (
  '00000000-0000-0000-0000-000000000001',
  'Amar Gupta',
  'AI-Powered Full Stack Developer & Technical Consultant',
  'I build AI-powered web applications.',
  'MCP Servers · LLM Integration · Workflow Automation · System Design',
  'AI-Powered Full Stack Developer and Technical Consultant with 7+ years of experience building performant, scalable web applications and AI-integrated solutions. Specialize in MCP (Model Context Protocol) server development, LLM chatbot integration, workflow automation, and system design. Proven track record delivering production-ready PWAs, SaaS platforms, and eCommerce solutions using React, Next.js, Vue 3, Node.js, and Supabase. Available for contract, project-based, and consulting engagements worldwide.',
  'I build AI-powered web applications and help businesses integrate AI into their products. With 7+ years in full-stack development and deep hands-on experience with AI tooling, I specialize in MCP Server Development, LLM Chatbot Integration, and Workflow Automation.',
  E'I build AI-powered web applications and help businesses integrate AI into their products. With 7+ years in full-stack development and deep hands-on experience with AI tooling, I specialize in MCP Server Development, LLM Chatbot Integration, and Workflow Automation.\n\nI work on a contract/project basis with startups, agencies, and product teams worldwide. Whether you need an MCP server built, an AI chatbot integrated, or a full SaaS platform — I deliver production-ready solutions fast.',
  'I focus on system design, scalability, and clean architecture. I use Cursor AI and Codex for rapid MVP delivery, and I bring AI-first thinking to every project — not as an add-on, but as a core part of the solution.',
  'theamargupta.tech@gmail.com',
  '+91-9540508292',
  'Delhi, India',
  'amargupta.tech',
  'https://i.ibb.co/cXpccm8Z/www-linkedin-com-in-theamargupta-1.png',
  '/AmarResume.pdf',
  'contract, project-based, consulting',
  '$40-80/hr'
);

-- Tools
insert into tools (id, name, icon, color) values
  ('HTML5', 'HTML5', 'SiHtml5', '#e34f26'),
  ('CSS3', 'CSS3', 'SiCss3', '#1572b6'),
  ('JavaScript', 'JavaScript', 'SiJavascript', '#f7df1e'),
  ('Typescript', 'TypeScript', 'SiTypescript', '#3178c6'),
  ('React', 'React', 'SiReact', '#61dafb'),
  ('Github', 'GitHub', 'SiGithub', null),
  ('Next', 'Next.js', 'SiNextdotjs', null),
  ('Firebase', 'Firebase', 'SiFirebase', '#f7df1e'),
  ('Graphql', 'GraphQL', 'SiGraphql', '#de33a6'),
  ('Heroku', 'Heroku', 'SiHeroku', '#430098'),
  ('Nuxt', 'Nuxt.js', 'SiNuxtdotjs', '#00bd85'),
  ('Vue', 'Vue.js', 'SiVuedotjs', '#3fb27f'),
  ('Redux', 'Redux', 'SiRedux', '#764bbc'),
  ('Material', 'Material UI', 'SiMui', '#007dc5'),
  ('Netlify', 'Netlify', 'SiNetlify', '#008ab5'),
  ('Styled', 'Styled Components', 'SiStyledcomponents', '#dd877a'),
  ('Auth0', 'Auth0', 'SiAuth0', '#e45123'),
  ('Tailwind', 'Tailwind CSS', 'SiTailwindcss', '#007dc5'),
  ('Vercel', 'Vercel', 'SiVercel', '#000000'),
  ('Bootstrap', 'Bootstrap', 'SiBootstrap', '#563d7c'),
  ('Supabase', 'Supabase', 'SiSupabase', '#34B27B'),
  ('Google', 'Google', 'SiGoogle', '#FF0000');

-- Projects

-- 1. Devfrend MCP Server
insert into projects (id, title, description, demo_img, live_url, repo_url, featured, sort_order, architecture)
values (
  'devfrend-mcp',
  'Devfrend MCP Server',
  E'A production MCP server that exposes task management, loan tracking, and company data to AI assistants like Claude. Built with TypeScript and deployed on Vercel. Enables AI agents to create tasks, track loan payments, and manage project data through natural language commands.\n\nTech: TypeScript, MCP Protocol, Supabase, Next.js API Routes, Claude AI Integration',
  null,
  'https://devfrend.com',
  null,
  true, 1,
  'MCP server built in TypeScript, exposing tools to Claude AI. Data layer uses Supabase. API routes deployed on Vercel.'
);
insert into project_features (project_id, feature, sort_order) values
  ('devfrend-mcp', 'Natural language task and loan management via AI', 1),
  ('devfrend-mcp', 'Claude AI integration via MCP Protocol', 2),
  ('devfrend-mcp', 'Supabase backend for persistent data', 3),
  ('devfrend-mcp', 'Deployed on Vercel with Next.js API Routes', 4),
  ('devfrend-mcp', 'TypeScript throughout', 5);

-- 2. OpenClaw
insert into projects (id, title, description, demo_img, live_url, repo_url, featured, sort_order, architecture)
values (
  'openclaw',
  'OpenClaw — AI Context Management',
  E'A file-based AI context management system that helps developers maintain structured context for AI-assisted coding workflows. Enables efficient prompt engineering and project-level AI memory.\n\nTech: Node.js, File System APIs, Markdown, AI Prompt Architecture',
  null,
  'https://devfrend.com',
  null,
  true, 2,
  'Node.js CLI tool using File System APIs for reading/writing structured Markdown context files. No external dependencies.'
);
insert into project_features (project_id, feature, sort_order) values
  ('openclaw', 'File-based context storage for AI workflows', 1),
  ('openclaw', 'Project-level AI memory management', 2),
  ('openclaw', 'Prompt engineering utilities', 3),
  ('openclaw', 'Markdown-based structured context', 4),
  ('openclaw', 'Node.js CLI tooling', 5);

-- 3. Devfrend Startup
insert into projects (id, title, description, demo_img, live_url, repo_url, featured, sort_order, architecture)
values (
  'devfrend-startup',
  'Devfrend Startup',
  'Devfrend Web Solutions is a high-velocity web development startup offering premium websites for just $99. Built using Next.js, Redux, and Styled Components, the platform delivers fast, SEO-optimized, mobile-friendly websites in just 1-2 days. With a focus on entrepreneurs, small businesses, and global startups, Devfrend streamlines development using efficient templates and modern tech to maintain quality while keeping costs low. Integrated with Auth0 for secure authentication and deployed via Vercel for blazing performance, Devfrend has served 500+ clients across the USA, UK, Australia, and Canada.',
  'https://i.ibb.co/B5FpV0gL/Screenshot-2025-07-31-at-3-20-33-PM.png',
  'http://devfrend.com/',
  null,
  true, 3,
  'Built with Next.js for server-side rendering and optimal performance, integrated with Supabase for backend services and authentication, deployed on Vercel for global accessibility and speed.'
);
insert into project_tools (project_id, tool_id, sort_order) values
  ('devfrend-startup', 'Next', 1), ('devfrend-startup', 'Bootstrap', 2),
  ('devfrend-startup', 'React', 3), ('devfrend-startup', 'JavaScript', 4),
  ('devfrend-startup', 'Supabase', 5), ('devfrend-startup', 'Vercel', 6);
insert into project_challenges (project_id, title, solution, sort_order) values
  ('devfrend-startup', 'Rapid Development Pipeline', 'Implemented a streamlined template system with reusable components and automated deployment processes to deliver websites in 1-2 days.', 1),
  ('devfrend-startup', 'Cost-Effective Solutions', 'Optimized development workflow using efficient tech stack and templates to maintain $99 pricing while ensuring high quality.', 2),
  ('devfrend-startup', 'Global Scalability', E'Leveraged Vercel''s global CDN and Supabase for international client support across USA, UK, Australia, and Canada.', 3);
insert into project_features (project_id, feature, sort_order) values
  ('devfrend-startup', 'Lightning-fast website delivery (1-2 days)', 1),
  ('devfrend-startup', 'Premium quality at $99 price point', 2),
  ('devfrend-startup', 'SEO-optimized and mobile-responsive', 3),
  ('devfrend-startup', 'Secure authentication system', 4),
  ('devfrend-startup', 'Global CDN deployment', 5),
  ('devfrend-startup', 'Template-based rapid development', 6),
  ('devfrend-startup', 'Multi-region client support', 7);

-- 4. InvenSync360
insert into projects (id, title, description, demo_img, live_url, repo_url, featured, sort_order, architecture)
values (
  'invensync360',
  'InvenSync360',
  E'InvenSync360 is a modern, real-time inventory and billing automation tool designed for small and medium-sized businesses. Built with Next.js, React, and TailwindCSS, it offers seamless inventory tracking, customer/vendor management, PDF billing, and Google Sheets integration. Featuring a sleek analytics dashboard and secure login system via NextAuth, it''s optimized for speed, usability, and instant deployment.',
  'https://i.ibb.co/Dg7PJD41/Screenshot-2025-07-31-at-3-27-03-PM.png',
  'https://inven-sync360.vercel.app/',
  null,
  true, 4,
  'Built using the Next.js App Router with React and TailwindCSS, integrated with Google Sheets API for sync. Authentication is handled via NextAuth. Export capabilities implemented using jsPDF and AutoTable. Deployed on Vercel for instant global accessibility.'
);
insert into project_tools (project_id, tool_id, sort_order) values
  ('invensync360', 'Next', 1), ('invensync360', 'React', 2),
  ('invensync360', 'Tailwind', 3), ('invensync360', 'JavaScript', 4),
  ('invensync360', 'Google', 5), ('invensync360', 'Vercel', 6);
insert into project_challenges (project_id, title, solution, sort_order) values
  ('invensync360', 'Real-Time Data Sync', 'Integrated Google Sheets API for two-way real-time synchronization with external spreadsheets, eliminating manual data exports.', 1),
  ('invensync360', 'Professional Billing & Reporting', 'Used jsPDF and AutoTable to create downloadable PDFs for invoices and purchase orders with clean formatting.', 2),
  ('invensync360', 'Dynamic Analytics Dashboard', 'Built reusable hooks and state logic to compute real-time metrics like revenue, profit, inventory cost, and pending payments.', 3);
insert into project_features (project_id, feature, sort_order) values
  ('invensync360', 'Real-time inventory and billing dashboard', 1),
  ('invensync360', 'Two-way Google Sheets sync', 2),
  ('invensync360', 'Customer and vendor management', 3),
  ('invensync360', 'Sales and purchase invoicing with PDF export', 4),
  ('invensync360', 'Analytics: revenue, profit, expenses, and stock value', 5),
  ('invensync360', 'NextAuth-powered secure login system', 6),
  ('invensync360', 'Responsive UI with TailwindCSS', 7);

-- 5. Ecommerce Seller Admin Panel
insert into projects (id, title, description, demo_img, live_url, repo_url, featured, sort_order, architecture)
values (
  'ecom-admin',
  'Ecommerce Seller Admin Panel',
  'The Ecommerce Seller Admin Panel is a feature-rich dashboard built for multichannel sellers managing products across Flipkart, Amazon, Meesho, and more. Designed with React, Material UI, and Redux, it allows sellers to manage inventory, process returns, generate bills, and export data. Integrated with Auth0 for secure login, and GraphQL for efficient data flow, this system helps ecommerce sellers operate at scale with precision.',
  'https://i.ibb.co/bgTmMw8B/Screenshot-2025-07-31-at-5-15-58-PM.png',
  'https://ecomadmin.vercel.app',
  null,
  true, 5,
  'Built with React 17 and Redux Toolkit for state management. Auth0 handles authentication, while Material UI provides a consistent responsive interface. GraphQL is used for structured querying, and data exports are handled using PapaParse and jsPDF. Deployed on Vercel for instant scalability.'
);
insert into project_tools (project_id, tool_id, sort_order) values
  ('ecom-admin', 'React', 1), ('ecom-admin', 'Redux', 2),
  ('ecom-admin', 'Auth0', 3), ('ecom-admin', 'Graphql', 4),
  ('ecom-admin', 'Material', 5), ('ecom-admin', 'JavaScript', 6),
  ('ecom-admin', 'Vercel', 7);
insert into project_challenges (project_id, title, solution, sort_order) values
  ('ecom-admin', 'Multi-Marketplace Complexity', 'Implemented separate views and filters for Flipkart, Amazon, Meesho, and other channels to allow sellers to isolate and analyze data independently.', 1),
  ('ecom-admin', 'Large-Scale Inventory Handling', 'Utilized React Virtualized and MUI Data Grid to enable smooth performance while rendering thousands of rows with advanced filters and CSV export.', 2),
  ('ecom-admin', 'Export & Data Interoperability', 'Built CSV, Excel, and PDF export features using PapaParse, jsPDF, and FileSaver.js for end-to-end reconciliation and reporting.', 3);
insert into project_features (project_id, feature, sort_order) values
  ('ecom-admin', 'Multi-channel sales tracking (Flipkart, Amazon, Meesho)', 1),
  ('ecom-admin', 'Sales, returns, and payments view with date filters', 2),
  ('ecom-admin', 'Inventory listing with SKU, order ID, invoice amount', 3),
  ('ecom-admin', 'Data export in CSV, Excel, PDF', 4),
  ('ecom-admin', 'Responsive sidebar navigation with icons', 5),
  ('ecom-admin', 'Secure login via Auth0', 6),
  ('ecom-admin', 'Advanced filtering and virtualized grid for large datasets', 7);

-- 6-11. Secondary Projects
insert into projects (id, title, description, live_url, repo_url, featured, sort_order) values
  ('vue-dashboard', 'Vue Dashboard', E'Crafted a sleek Vue.js dashboard using Vue 3, enhanced with custom CSS for unique visual appeal. Seamlessly integrated data visualization and user interaction, delivering an intuitive user experience.', 'https://vue-dash-one.vercel.app/', 'https://github.com/theamargupta/vue-dash', false, 6),
  ('interview-dashboard', 'Interview Assignment Dashboard', 'Designed an interview assignment dashboard with Redux, React Router 6, and React, optimized as a Progressive Web App (PWA) for offline access. Deployed on Vercel, styled with Tailwind CSS, and enhanced with TypeScript.', 'https://interview-assignment-dashbaord.vercel.app/', 'https://github.com/theamargupta/interviewAssignmentDashbaord', false, 7),
  ('portfolio-7', 'Portfolio 7', 'A portfolio website built using React, Node Sass, and styled-components. It showcases the skills, projects, and experiences of the developer with modern and responsive design, smooth animations and transitions.', 'https://profile7.vercel.app/', 'https://github.com/theamargupta/profile7', false, 8),
  ('google-app-script', 'Google App Script', 'Google Apps Script integration with React for automating spreadsheet workflows and custom business logic.', null, 'https://github.com/theamargupta/google-react-app-script', false, 9),
  ('smallcase-clone', 'SmallCase Clone', 'A clone of the SmallCase investment platform, showcasing frontend engineering skills with real-time data visualization and portfolio management UI.', 'https://smallcase-clone-ten.vercel.app/', 'https://github.com/theamargupta/smallcaseClone', false, 10),
  ('toys-ecommerce', 'Toys and Stationary E-commerce', 'An online platform designed for selling toys and stationary items in an eco-friendly manner. Built using Next.js, React, providing a seamless and engaging shopping experience.', 'https://trendyandhandy.vercel.app/', 'https://github.com/theamargupta/trendyandhandy', false, 11);

-- Experiences
insert into experiences (profile_id, company, job_title, employment_type, location, description, start_date, end_date, sort_order) values
  ('00000000-0000-0000-0000-000000000001', 'Freelance Consulting', 'AI-Powered Full Stack Developer & Consultant', 'Freelance / Contract', 'Delhi, India',
   'Designed and built MCP (Model Context Protocol) servers enabling AI agents to interact with external tools, databases, and APIs. Integrated LLM-powered chatbots into production web applications. Architected full-stack SaaS platforms using React, Next.js, Vue 3, Node.js, and Supabase. Built workflow automation systems reducing manual processes by 60%+. Created AI-assisted development workflows using Cursor and Codex.',
   '2025-02-01', null, 1),
  ('00000000-0000-0000-0000-000000000001', 'Agusta Software Pvt. Ltd', 'Full Stack Developer', 'Full-time', 'Pune, India',
   'Specialised in developing and deploying dynamic web applications using Vue 3. Built reusable Node.js services for backend logic and data processing. Developed PWA loan application.',
   '2023-02-01', '2025-02-01', 2),
  ('00000000-0000-0000-0000-000000000001', 'Spark Eighteen Lifestyle Pvt. Ltd.', 'Full Stack Developer', 'Full-time WFH', 'Delhi, India',
   'Worked on a cloud-based project management platform enabling task allocation, team collaboration, and project monitoring. Integrated Express-based APIs with frontend Vue and React apps.',
   '2021-12-01', '2022-08-01', 3),
  ('00000000-0000-0000-0000-000000000001', 'LoudCloud Systems Private Limited', 'React & Vue Frontend Engineer', 'Full-time WFH', 'Mumbai, India',
   'Contributed to a service-based e-commerce platform for a fashion and lifestyle brand, focusing on personalized recommendations and seamless shopping experiences.',
   '2020-12-01', '2021-10-01', 4),
  ('00000000-0000-0000-0000-000000000001', 'Les Transformations Learning Pvt. Ltd.', 'React & Vue Frontend Engineer', 'Full-time WFH', 'Gurgaon, India',
   'Developed an online LMS for a leading EdTech company to provide interactive educational experiences. Built PWA version of LMS features.',
   '2020-09-01', '2020-11-30', 5);

-- Skill Categories
insert into skill_categories (profile_id, category, skills, sort_order) values
  ('00000000-0000-0000-0000-000000000001', 'AI & LLM', 'MCP Server Development, LLM Integration (Claude, GPT), AI Chatbot Building, Prompt Engineering, RAG Pipelines, LangChain, AI Workflow Automation', 1),
  ('00000000-0000-0000-0000-000000000001', 'System Design', 'Microservices Architecture, API Design, Database Schema Design, Scalability Patterns, Event-Driven Systems', 2),
  ('00000000-0000-0000-0000-000000000001', 'Frontend', 'React 19, Next.js 16, Vue 3, Nuxt.js, Remix, TypeScript, Tailwind v4, Radix UI, ShadCN', 3),
  ('00000000-0000-0000-0000-000000000001', 'Backend & API', 'Node.js, Express.js, Supabase, MongoDB, REST APIs, GraphQL, JWT Auth', 4),
  ('00000000-0000-0000-0000-000000000001', 'State Mgmt', 'Redux, Vuex, Pinia, Redux-Saga, Thunk, Zustand', 5),
  ('00000000-0000-0000-0000-000000000001', 'DevOps & Tools', 'GitHub, Vercel, Netlify, Heroku, Docker, ESLint, Cursor AI, Codex', 6),
  ('00000000-0000-0000-0000-000000000001', 'Other', 'Shopify Customization, Google Apps Script, PWA, Pine Script, Python (Backtesting)', 7);

-- Services
insert into services (profile_id, title, description, icon, sort_order) values
  ('00000000-0000-0000-0000-000000000001', 'MCP Server Development', 'Custom MCP servers that connect AI assistants to your databases, APIs, and tools', 'server', 1),
  ('00000000-0000-0000-0000-000000000001', 'LLM Chatbot Integration', 'Embed intelligent AI chatbots into your web app for support, sales, or internal use', 'bot', 2),
  ('00000000-0000-0000-0000-000000000001', 'Workflow Automation', 'Connect AI pipelines with your business logic to eliminate manual processes', 'workflow', 3),
  ('00000000-0000-0000-0000-000000000001', 'System Design & Architecture', 'Scalable system design from database schema to microservices', 'architecture', 4),
  ('00000000-0000-0000-0000-000000000001', 'Full Stack Web Development', 'React, Next.js, Vue, Node.js, Supabase — from MVP to production', 'code', 5),
  ('00000000-0000-0000-0000-000000000001', 'Technical Consulting', 'AI integration strategy, code review, architecture audits', 'consulting', 6);

-- Socials
insert into socials (profile_id, name, href, icon, color, sort_order) values
  ('00000000-0000-0000-0000-000000000001', 'Github', 'https://github.com/theamargupta', 'SiGithub', null, 1),
  ('00000000-0000-0000-0000-000000000001', 'LinkedIn', 'https://www.linkedin.com/in/amar-gupta-2684a1157/', 'SiLinkedin', '#0A66C2', 2),
  ('00000000-0000-0000-0000-000000000001', 'Facebook', 'https://www.facebook.com/amarlalaji', 'SiFacebook', '#1DA1F2', 3),
  ('00000000-0000-0000-0000-000000000001', 'Instagram', 'https://www.instagram.com/amarguptta/', 'SiInstagram', '#9146FF', 4),
  ('00000000-0000-0000-0000-000000000001', 'Email', 'mailto:theamargupta.tech@gmail.com', 'SiGoogle', '#FF0000', 5);

-- Blog Tags (no posts yet)
insert into blog_tags (name, slug) values
  ('AI', 'ai'),
  ('MCP', 'mcp'),
  ('React', 'react'),
  ('Next.js', 'nextjs'),
  ('Vue', 'vue'),
  ('System Design', 'system-design'),
  ('TypeScript', 'typescript'),
  ('Supabase', 'supabase'),
  ('Web Development', 'web-development');

-- ============================================
-- RLS POLICIES
-- ============================================

alter table profiles enable row level security;
alter table tools enable row level security;
alter table projects enable row level security;
alter table project_tools enable row level security;
alter table project_challenges enable row level security;
alter table project_features enable row level security;
alter table experiences enable row level security;
alter table skill_categories enable row level security;
alter table services enable row level security;
alter table socials enable row level security;
alter table blog_posts enable row level security;
alter table blog_tags enable row level security;
alter table blog_post_tags enable row level security;
alter table contact_submissions enable row level security;

create policy "Public read profiles" on profiles for select using (true);
create policy "Public read tools" on tools for select using (true);
create policy "Public read projects" on projects for select using (true);
create policy "Public read project_tools" on project_tools for select using (true);
create policy "Public read project_challenges" on project_challenges for select using (true);
create policy "Public read project_features" on project_features for select using (true);
create policy "Public read experiences" on experiences for select using (true);
create policy "Public read skill_categories" on skill_categories for select using (true);
create policy "Public read services" on services for select using (true);
create policy "Public read socials" on socials for select using (true);
create policy "Public read blog_tags" on blog_tags for select using (true);
create policy "Public read blog_post_tags" on blog_post_tags for select using (true);

create policy "Public read published blog_posts" on blog_posts for select using (published = true);

create policy "Public insert contact" on contact_submissions for insert with check (true);
create policy "Auth read contact" on contact_submissions for select using (auth.role() = 'authenticated');
create policy "Auth update contact" on contact_submissions for update using (auth.role() = 'authenticated');
create policy "Auth delete contact" on contact_submissions for delete using (auth.role() = 'authenticated');
