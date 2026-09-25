import { SITE_HEADLINE, SITE_URL } from "./site";

// The hand-written half of /llms.txt: who Amar is. Frontend first, matching the
// site since a1ec730. The generated half (## Blog) is built in llms.ts.

export const LLMS_INTRO = `# Amar Gupta

> ${SITE_HEADLINE}. 7+ years building production web applications in React, Next.js and TypeScript, and the AI and MCP tooling behind them. Based in Delhi, India.`;

export const LLMS_PROFILE_SECTIONS = `## Profile

- [Site](${SITE_URL}): portfolio + blog
- [GitHub](https://github.com/theamargupta)
- [LinkedIn](https://www.linkedin.com/in/amar-gupta-2684a1157/)
- Email: theamargupta.tech@gmail.com

## What I build

- **Production frontends** — React 19, Next.js 16, TypeScript, Tailwind v4; performance, accessibility and design systems
- **AI & MCP in the product** — MCP servers, LLM integration and RAG pipelines, built into products where they earn their place
- **The backend a frontend needs** — Node.js, Supabase and PostgreSQL, row-level security as the tenant boundary

## Stack

- **Frontend:** React 19, Next.js 16, Vue 3, Nuxt.js, Remix, TypeScript, Tailwind v4, Radix UI, ShadCN
- **AI & LLM:** MCP Server Development, LLM Integration (Claude, GPT), Prompt Engineering, RAG Pipelines
- **Backend:** Node.js, Express.js, Supabase, PostgreSQL, MongoDB, REST APIs, GraphQL, JWT Auth
- **DevOps:** Vercel, Netlify, Docker, GitHub Actions

## Notable projects

- [Sathi](https://sathi.devfrend.com) — 70+ tool MCP server giving Claude persistent read/write access to personal data (finance, documents, memory).
- [Setu](https://setu.devfrend.com) — bridge between operator and Claude Code. Browser/mobile/WhatsApp chat lands on the desktop CC via Supabase Realtime + local MCP at \`127.0.0.1:9000\`.
- [Sandesh](https://sandesh.devfrend.com) — content publishing autopilot across LinkedIn, Threads, Instagram, YouTube. Text, carousel, HyperFrames video, or strategy outputs.
- [Swayam](https://swayam.devfrend.com) — automation routines + Auto-SEO + Auto-Blog. Cron-fired Claude Code routines. Pushes SEO fixes direct to main gated on type-check + build.
- [Sankalp](https://sankalp.devfrend.com) — job-application autopilot. Captures postings via Claude-in-Browser, drafts answers from profile + past-answer cache.
- [Project Memory](https://pm.devfrend.com) — multi-tenant memory/task/code knowledge platform with remote MCP via pgvector.`;

export const LLMS_CONTACT = `## Contact

theamargupta.tech@gmail.com`;
