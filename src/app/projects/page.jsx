'use client';

import { motion } from 'framer-motion';
import AnimatedProjectPreview from '@/components/AnimatedProjectPreview';
import { ArrowRight, ArrowSquareOut, GithubLogo, GraduationCap, LockSimple } from 'phosphor-react';

const projects = [
  {
    slug: 'ai-lead-intake',
    group: 'automation',
    title: 'AI Lead Intake & Support Triage Automation',
    category: 'AI automation / Make.com',
    type: 'Automation build · no public demo',
    description: 'I designed and built a multi-scenario Make.com automation that captures leads and support requests from a web form and email through custom webhooks, then uses the OpenAI API to classify intent, urgency, and sentiment into structured JSON.',
    tags: ['Make.com', 'OpenAI API', 'Airtable', 'Gmail', 'Google Sheets', 'Webhooks', 'JSON'],
    contribution: 'I built the routers and filters that send each record to an Airtable CRM (contacts, tickets, status), a duplicate check by email lookup, Gmail alerts for high-priority cases, AI-drafted replies held for human approval, plus error-handler routes, retries, input validation, and a Google Sheets run log.',
    learned: 'I learned to make AI output dependable inside a workflow: force structured JSON, validate it, route on it, and keep a person in the loop before anything is sent.',
    flow: ['Web form / email', 'Custom webhook', 'OpenAI → JSON', 'Router + filters', 'Airtable CRM', 'Gmail alert', 'Human approval', 'Sheets run log'],
    accent: 'amber',
  },
  {
    slug: 'ai-job-hunting-agent',
    group: 'automation',
    title: 'AI Job Hunting Agent',
    category: 'AI automation / Make.com',
    type: 'Personal automation · tested with sample data',
    description: 'I built a set of Make.com scenarios that read job-alert emails, score each job against my verified profile with Gemini, log it to a Google Sheets job CRM, and draft a tailored resume and cover letter for my review. It never submits applications on its own.',
    tags: ['Make.com', 'Gemini API', 'Google Sheets', 'Gmail', 'Structured AI output'],
    contribution: 'I planned and built five scenarios (job intake and scoring, resume drafts, recruiter-email monitor, call-outcome processing, follow-up reminders) and an error-log scenario, with approval gates and rules that stop the AI from inventing experience.',
    learned: 'I learned to split one big automation into small scenarios that share a data store, and to write prompts with hard truthfulness rules. It has been tested with synthetic data; real job alerts are next.',
    flow: ['Job-alert email', 'Gmail watch', 'Gemini scoring', 'Sheets CRM', 'Resume draft', 'My approval', 'Follow-up reminder'],
    accent: 'teal',
  },
  {
    slug: 'flowpilot',
    group: 'automation',
    title: 'FlowPilot AI',
    category: 'AI / workflow automation platform',
    type: 'Personal web app · live demo',
    description: 'I built an n8n/Zapier-style visual automation builder: connect webhook or scheduled triggers, AI steps (Gemini or your own provider), conditions, and actions, then run them on a server-side execution engine with run history and step details.',
    tags: ['React', 'TypeScript', 'PostgreSQL (Neon)', 'Drizzle', 'Vercel', 'GitHub Actions'],
    contribution: 'I implemented the workflow editor, node library and inspector, graph validation, the execution engine with execution history, retries, and per-step timeouts, authentication and protected APIs, and type checks, tests, and builds on every pull request with GitHub Actions.',
    learned: 'I learned how automation platforms work underneath: validating a graph, running steps safely on the server, and making each run inspectable.',
    liveDemo: 'https://flowpilot-sage-delta.vercel.app/',
    github: 'https://github.com/jazsajonia-pixel/flowpilot',
    animation: '/projects/flowpilot-demo.gif',
    accent: 'indigo',
  },
  {
    slug: 'chrauto-ai',
    group: 'ai',
    title: 'Chrauto AI',
    category: 'AI agent / Android',
    type: 'Personal Android app · animated preview',
    description: 'I built a native Android AI assistant that reads the screen through Android accessibility services and asks an AI model (Gemini, OpenAI, Claude and others) for structured next actions. Actions are validated locally, consequential steps pause for approval, and a hands-free voice mode streams replies.',
    tags: ['Kotlin', 'Jetpack Compose', 'Android Accessibility', 'Gemini', 'OpenAI', 'Claude'],
    contribution: 'I implemented the Compose control screen, multi-provider setup, structured action parsing and local validation, the accessibility service, approval and cancellation flows, and the voice assistant.',
    learned: 'I learned to design AI agents with explicit action limits and human approval, so the model suggests and the app decides what is allowed.',
    github: 'https://github.com/jazsajonia-pixel/Chrauto-AI',
    animation: '/projects/chrauto-ai-demo.gif',
    accent: 'violet',
  },
  {
    slug: 'cortex',
    group: 'ai',
    title: 'Cortex',
    category: 'On-device AI agent / Android',
    type: 'Personal Android app · private repository',
    description: 'I built an on-phone AI coding agent that runs open models (Qwen2.5 Coder, Llama 3.2) locally with llama.cpp. It has a ChatGPT-style chat, file tools that ask before writing, memory and skills, LoRA add-ons, a 3D knowledge graph, and optional web search or cloud AI when you turn them on.',
    tags: ['Kotlin', 'Jetpack Compose', 'llama.cpp', 'GGUF', 'LoRA', 'Android'],
    contribution: 'I integrated the native llama.cpp engine, the in-app model downloader with checksum checks, the agent loop and tools with approve-before-write diffs, the chat UI, and the knowledge graph. v0.2.0 is released as an APK.',
    learned: 'I learned what it takes to run a language model on a phone: model size, memory limits, and keeping a small model on task with tight tool rules.',
    flow: ['Your prompt', 'Local model', 'Tool call', 'Diff preview', 'Your approval', 'File saved'],
    accent: 'sky',
  },
  {
    slug: 'chrono',
    group: 'web',
    title: 'Chrono',
    category: 'AI-assisted developer tooling',
    type: 'Personal build · live demo',
    description: 'I built a mobile-first AI coding workspace: pull a GitHub repository, edit code with an AI assistant, preview the app on a virtual server and database, then push and merge the changes. An Expo companion app brings it to Android.',
    tags: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Expo', 'GitHub API'],
    contribution: 'I worked on the interface, feature design, AI prompts, code, testing, and deployment.',
    learned: 'I learned to make a coding workflow usable on a small screen while keeping AI-assisted changes reviewable.',
    liveDemo: 'https://chrono-tau.vercel.app/',
    github: 'https://github.com/jazsajonia-pixel/mobdevai',
    animation: '/projects/mobdevai-demo.gif',
    accent: 'orange',
  },
  {
    slug: 'markethub',
    group: 'web',
    title: 'MarketHub',
    category: 'Full-stack web development',
    type: 'Personal build · live demo',
    description: 'I built a full-stack marketplace with buyer, seller, and admin flows: listings, orders, messaging, moderation, and analytics. Checkout is simulated; it does not process real payments.',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'Hono', 'PostgreSQL', 'Prisma', 'Zod'],
    contribution: 'I worked on the frontend, the Hono API, database schema, role-based product flows, testing, debugging, and deployment.',
    learned: 'I learned to keep products, inventory, orders, and role-based workflows clear across a larger app.',
    liveDemo: 'https://markethub-pi.vercel.app/',
    github: 'https://github.com/jazsajonia-pixel/markethub',
    image: '/projects/markethub-showcase.jpg',
    animation: '/projects/markethub-demo.gif',
    accent: 'teal',
  },
  {
    slug: 'speedsight',
    group: 'web',
    title: 'SpeedSight',
    category: 'Computer vision / traffic analytics',
    type: 'Personal web app · live demo',
    description: 'I built a browser-based traffic monitoring app for vehicle detection, tracking, estimated speeds, session metrics, and analytics. Speed readings are estimates for analysis, not certified enforcement measurements.',
    tags: ['React', 'TypeScript', 'Vite', 'TensorFlow.js', 'COCO-SSD'],
    contribution: 'I implemented the monitoring pipeline, dashboard, detection and session views, analytics, calibration tools, and demo data.',
    learned: 'I learned to present computer-vision outputs and estimated measurements with context and clear limitations.',
    liveDemo: 'https://project-2-speed-sight2.vercel.app/',
    github: 'https://github.com/jazsajonia-pixel/Project-2-SpeedSight2',
    animation: '/projects/speedsight-demo.gif',
    accent: 'blue',
  },
  {
    slug: 'sapphire',
    group: 'mobile',
    title: 'Sapphire',
    category: 'Android / knowledge tools',
    type: 'Personal Android app · APK release',
    description: 'I built a local-first Android app for a vault of plain Markdown notes: browse, edit, search, follow links and backlinks, and explore a 3D knowledge graph. It signs in with GitHub and syncs both ways automatically, and the files stay compatible with Obsidian.',
    tags: ['Flutter', 'Dart', 'Android', 'GitHub sync', 'Markdown'],
    contribution: 'I built the vault storage, editor, links and search, the graph view, GitHub sign-in and two-way sync, optional bring-your-own-key AI, and the release pipeline.',
    learned: 'I learned to sync files safely in both directions and to keep plain files as the source of truth.',
    github: 'https://github.com/jazsajonia-pixel/sapphire',
    flow: ['Markdown vault', 'Edit + links', 'Knowledge graph', 'GitHub sync'],
    accent: 'blue',
  },
  {
    slug: 'retext',
    group: 'mobile',
    title: 'Retext',
    category: 'Android / image editing',
    type: 'Personal Android app · animated preview',
    description: 'I built a local-first Android app for replacing text in images while preserving every untouched pixel. It combines on-device OCR, editable text styling, background repair, undo/redo, and full-resolution export; optional AI actions require confirmation.',
    tags: ['Flutter', 'Dart', 'Android', 'OCR', 'Image processing'],
    contribution: 'I implemented the non-destructive project model, OCR and selection flow, pixel-safe compositor, editing controls, export, and optional AI-provider adapters.',
    learned: 'I learned to treat visual edits as small, auditable patches instead of destructive rewrites of an image.',
    animation: '/projects/retext-demo.gif',
    accent: 'orange',
  },
  {
    slug: 'igit',
    group: 'mobile',
    title: 'igit',
    category: 'Android / developer tooling',
    type: 'Personal Android app · animated preview',
    description: 'I built a local-first Git client for Android, covering repository browsing, branch and commit workflows, sync, conflict resolution, and related GitHub tools.',
    tags: ['Kotlin', 'Jetpack Compose', 'Git', 'Android'],
    contribution: 'I implemented native screens for repositories, sync, files, chat, settings, and GitHub-related workflows.',
    learned: 'I learned to adapt developer workflows to mobile while keeping credentials private and destructive actions explicit.',
    github: 'https://github.com/jazsajonia-pixel/igit',
    animation: '/projects/igit-demo.gif',
    accent: 'sky',
  },
  {
    slug: 'chron-launcher',
    group: 'mobile',
    title: 'Chron Launcher',
    category: 'Android / device kiosk',
    type: 'Personal Android app · private repository',
    description: 'I built a home-screen launcher that turns an old Android 5.1 phone into a dedicated, locked-down device, with its own app drawer, notification panel, quick settings, a settings PIN, and Device Owner kiosk mode.',
    tags: ['Kotlin', 'Jetpack Compose', 'Device Owner', 'Android 5.1+', 'GitHub Actions'],
    contribution: 'I built the launcher screens, notification listener, quick settings, PIN lock with lockout, and Device Owner restrictions, with CI that runs emulator tests on Android 5.1 and 6.0.',
    learned: 'I learned how Android device-management APIs work and how to test old Android versions automatically.',
    flow: ['Home screen', 'App drawer', 'Notifications', 'PIN + kiosk'],
    accent: 'slate',
  },
  {
    slug: 'heartline',
    group: 'mobile',
    title: 'Heartline',
    category: 'Android / Flutter + Firebase',
    type: 'Personal Android app · private repository',
    description: 'I built a private app for couples: live location on a map, a home-screen widget that sends a heart to your partner, milestones and anniversaries, shared plans and memories, and small games for two.',
    tags: ['Flutter', 'Dart', 'Firebase', 'Firestore rules', 'Home-screen widget'],
    contribution: 'I built pairing by code, the live map, the widget, milestones, plans, memories and games, with 50 unit and widget tests and 21 Firestore security-rules tests.',
    learned: 'I learned to protect shared personal data with security rules and to test them before release.',
    flow: ['Pair by code', 'Live map', 'Heart widget', 'Milestones'],
    accent: 'rose',
  },
  {
    slug: 'petalbound',
    group: 'mobile',
    title: 'Petalbound',
    category: 'Game development / pixel art',
    type: 'Personal game · animated preview',
    description: 'I built an offline, landscape pixel-art action adventure in Godot 4, with explorable regions, quests, guardian fights, gear, crafting, and a touch-friendly HUD for Android.',
    tags: ['Godot 4', 'GDScript', 'Android', 'Pixel art', 'Game systems'],
    contribution: 'I implemented the world, combat, encounters, progression, equipment, quests, inventory, crafting, save flow, and mobile controls.',
    learned: 'I learned to connect exploration, combat, and progression systems while keeping a dense mobile HUD readable.',
    animation: '/projects/petalbound-demo.gif',
    accent: 'teal',
  },
  {
    slug: 'qr-library',
    group: 'academic',
    title: 'QR-Code Library Management System',
    category: 'Full-stack web development',
    type: 'University group project · primary developer',
    description: 'As the primary developer in a group academic project, I built a working QR-code library system for borrowing, returning, inventory, and user management.',
    tags: ['PHP', 'JavaScript', 'HTML', 'CSS', 'Bootstrap', 'MySQL', 'XAMPP'],
    contribution: 'I handled most of the coding and the documentation while collaborating with the group.',
    learned: 'I practiced building a CRUD-style system with PHP, MySQL, and browser-based QR workflows.',
    accent: 'slate',
  },
  {
    slug: 'meat-fleet-management',
    group: 'academic',
    title: 'Meat Delivery Fleet Management System',
    category: 'Full-stack web development',
    type: 'University group project · primary developer',
    description: 'As the primary developer in a group academic project, I built a fleet management system with real-time GPS tracking, reporting, inventory, content management, and supplier management.',
    tags: ['PHP', 'JavaScript', 'HTML', 'CSS', 'Bootstrap', 'MySQL', 'Google Maps API'],
    contribution: 'I handled most of the implementation work, including the GPS tracking module, while collaborating with the rest of the group.',
    learned: 'I practiced turning operational requirements into modules and integrating Google Maps-based location features.',
    accent: 'slate',
  },
  {
    slug: 'unified-business-system',
    group: 'academic',
    title: 'Unified Business Information System',
    category: 'Full-stack web development',
    type: 'University team project · documentation contribution',
    description: 'I contributed to a team project for dry-goods retailers, planned around inventory, sales, customer, reporting, account, and other business modules.',
    tags: ['TypeScript', 'React', 'MongoDB'],
    contribution: 'I mainly handled documentation; this was a team effort, not an application I coded alone.',
    learned: 'I practiced documenting business modules and explaining how a multi-area system fits together.',
    accent: 'slate',
  },
];

const groups = [
  { id: 'automation', title: 'AI automation', note: 'Make.com scenarios and automation platforms that connect AI to real tools.' },
  { id: 'ai', title: 'AI agents', note: 'Apps where an AI model suggests actions and the app keeps it within safe limits.' },
  { id: 'web', title: 'Web apps', note: 'Full-stack and frontend web projects with live demos.' },
  { id: 'mobile', title: 'Android apps and games', note: 'Native and Flutter apps, plus a Godot game.' },
  { id: 'academic', title: 'University projects', note: 'Group and team work from my BS IT program.' },
];

const accentStyles = {
  orange: 'from-orange-500 via-fuchsia-500 to-violet-700',
  teal: 'from-emerald-400 via-teal-600 to-slate-900',
  violet: 'from-violet-500 via-violet-700 to-slate-950',
  blue: 'from-blue-500 via-blue-800 to-slate-950',
  sky: 'from-sky-400 via-slate-800 to-slate-950',
  indigo: 'from-indigo-500 via-indigo-800 to-slate-950',
  slate: 'from-slate-700 via-slate-800 to-slate-950',
  amber: 'from-amber-400 via-orange-600 to-slate-950',
  rose: 'from-rose-400 via-pink-700 to-slate-950',
};

export default function ProjectsPage() {
  return (
    <section className="space-y-8">
      <header>
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-700">Project archive</div>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">Projects and contributions</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700 dark:text-slate-300">
          AI automations, AI agents, web apps, and Android apps I built, plus university projects where I was the primary developer. Each card notes my role and what I learned. Live links are included for deployed web apps; Android projects use animated previews or a short flow, and private repositories can be shown on request.
        </p>
      </header>

      <nav aria-label="Project groups" className="flex flex-wrap gap-2">{groups.map((group) => <a key={group.id} href={`#group-${group.id}`} className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:border-orange-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200">{group.title} · {projects.filter((project) => project.group === group.id).length}</a>)}</nav>

      {groups.map((group) => <section key={group.id} id={`group-${group.id}`} className="scroll-mt-6 space-y-4">
        <div><h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{group.title}</h2><p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{group.note}</p></div>
        <div className="grid gap-5">
        {projects.filter((project) => project.group === group.id).map((project, index) => <motion.article id={project.slug} key={project.slug} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .04 }} className="scroll-mt-6 overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="grid lg:grid-cols-[.9fr_1.1fr]">
            <div className={`min-h-[230px] bg-gradient-to-br ${accentStyles[project.accent]} p-4`}>
              {project.animation
                ? <AnimatedProjectPreview src={project.animation} alt={`${project.title} animated preview`} className="min-h-[198px] rounded-[18px] shadow-2xl" />
                : project.image
                  ? <img src={project.image} alt={`${project.title} interface`} className="h-full min-h-[198px] w-full rounded-[18px] object-cover shadow-2xl" />
                  : project.flow
                    ? <div className="flex h-full min-h-[198px] flex-col justify-between gap-4 rounded-[18px] border border-white/15 bg-black/25 p-5 text-white"><div className="font-mono text-xs uppercase tracking-[0.15em] text-white/80">How it works</div><ol className="flex flex-wrap items-center gap-2">{project.flow.map((step, i) => <li key={step} className="flex items-center gap-2"><span className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold">{step}</span>{i < project.flow.length - 1 && <ArrowRight size={14} aria-hidden="true" className="text-white/70" />}</li>)}</ol><div className="text-xl font-bold">{project.title}</div></div>
                    : <div className="flex h-full min-h-[198px] flex-col justify-between rounded-[18px] border border-white/15 bg-black/20 p-5 text-white"><GraduationCap size={32} weight="fill" /><div><div className="font-mono text-xs uppercase tracking-[0.15em] text-white/75">University project</div><div className="mt-2 text-2xl font-bold">{project.title}</div></div></div>}
            </div>
            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700 dark:text-orange-400">{project.category}</div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700 dark:bg-slate-800 dark:text-slate-200">{project.type}</div>
              </div>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{project.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">{project.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">{project.tags.map((tag) => <span key={tag} className="rounded-full border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:border-slate-600 dark:text-slate-200">{tag}</span>)}</div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800"><div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">My contribution</div><p className="mt-2 text-xs leading-5 text-slate-700 dark:text-slate-200">{project.contribution}</p></div>
                <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800"><div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">What I learned</div><p className="mt-2 text-xs leading-5 text-slate-700 dark:text-slate-200">{project.learned}</p></div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                {project.liveDemo && <a href={project.liveDemo} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-orange-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700">Live demo <ArrowSquareOut size={15} /></a>}
                {project.github && <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-orange-500 dark:border-slate-600 dark:text-slate-100">GitHub <GithubLogo size={15} /></a>}
                {!project.github && !project.liveDemo && project.type.includes('private repository') && <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-300"><LockSimple size={16} weight="fill" /> Private repository · demo on request</span>}
              </div>
            </div>
          </div>
        </motion.article>)}
        </div>
      </section>)}

      <aside className="rounded-[22px] border border-orange-300 bg-orange-50 p-5 dark:border-orange-700/60 dark:bg-orange-950/30">
        <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-orange-800 dark:text-orange-300">Automation toolkit</div>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-800 dark:text-slate-200">
          In Make.com I build multi-scenario workflows with routers, filters, iterators, aggregators, and error handlers; custom webhooks and HTTP/API modules; JSON parsing; and integrations with Airtable, Google Sheets, and Gmail. For AI steps I use the OpenAI, Gemini, and Claude APIs with structured outputs, and I keep a human approval step before anything important is sent.
        </p>
      </aside>
    </section>
  );
}
