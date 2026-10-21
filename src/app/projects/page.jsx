'use client';

import { motion } from 'framer-motion';
import AnimatedProjectPreview from '@/components/AnimatedProjectPreview';
import { ArrowSquareOut, GithubLogo, GraduationCap } from 'phosphor-react';

const projects = [
  {
    slug: 'chrono',
    title: 'Chrono',
    category: 'AI-assisted developer tooling',
    type: 'Personal build · live demo',
    description: 'I built a mobile-first development workspace for connecting GitHub, working with an AI coding assistant, reviewing changes, and previewing an app.',
    tags: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'GitHub'],
    contribution: 'I worked on the interface, feature design, AI prompts, code, testing, and deployment.',
    learned: 'I learned to make a coding workflow usable on a small screen while keeping AI-assisted changes reviewable.',
    liveDemo: 'https://chrono-tau.vercel.app/',
    github: 'https://github.com/jazsajonia-pixel/mobdevai',
    animation: '/projects/mobdevai-demo.gif',
    accent: 'orange',
  },
  {
    slug: 'markethub',
    title: 'MarketHub',
    category: 'Full-stack web development',
    type: 'Personal build · live demo',
    description: 'I built a marketplace prototype with seeded data and buyer, seller, and admin flows. Checkout is simulated; it does not process real payments.',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Prisma', 'Hono', 'Zod'],
    contribution: 'I worked on the frontend, API integration, product flows, testing, debugging, and deployment.',
    learned: 'I learned to keep product, inventory, orders, and role-based workflows clear across a larger app.',
    liveDemo: 'https://markethub-pi.vercel.app/',
    github: 'https://github.com/jazsajonia-pixel/markethub',
    image: '/projects/markethub-showcase.jpg',
    animation: '/projects/markethub-demo.gif',
    accent: 'teal',
  },
  {
    slug: 'retext',
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
    slug: 'petalbound',
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
    title: 'QR-Code Library Management System',
    category: 'Full-stack web development',
    type: 'University group project · no public demo',
    description: 'I contributed to a university group project that uses QR-code workflows to manage library records and day-to-day operations.',
    tags: ['PHP', 'JavaScript', 'HTML', 'CSS', 'Bootstrap', 'MySQL', 'XAMPP'],
    contribution: 'I handled coding and documentation as part of the group. I used AI and search as references when needed, not as an AI coding IDE.',
    learned: 'I practiced building a CRUD-style system with PHP, MySQL, and browser-based QR workflows.',
    accent: 'slate',
  },
  {
    slug: 'chrauto-ai',
    title: 'Chrauto AI',
    category: 'AI / Android development',
    type: 'Personal Android app · animated preview',
    description: 'I built a native Android assistant prototype that uses accessibility to observe the screen and perform bounded actions from natural-language requests. Consequential actions pause for approval; it does not run arbitrary code or shell commands.',
    tags: ['Kotlin', 'Jetpack Compose', 'Android Accessibility', 'Gemini'],
    contribution: 'I implemented the Compose control screen, provider setup, action validation, accessibility service, and approval and cancellation flows.',
    learned: 'I learned to design mobile automation with explicit action limits and human approval for consequential steps.',
    github: 'https://github.com/jazsajonia-pixel/Chrauto-AI',
    animation: '/projects/chrauto-ai-demo.gif',
    accent: 'violet',
  },
  {
    slug: 'speedsight',
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
    slug: 'igit',
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
    slug: 'flowpilot',
    title: 'FlowPilot AI',
    category: 'AI / workflow automation',
    type: 'Personal web app · live demo',
    description: 'I built a visual automation builder for connecting triggers, AI steps, conditions, and actions, with run history and execution details.',
    tags: ['React', 'TypeScript', 'Workflow graphs', 'AI providers'],
    contribution: 'I implemented the workflow editor, node library and inspector, graph validation, execution logic, trigger support, and workflow management screens.',
    learned: 'I learned to make multi-step workflows easier to configure, validate, and inspect through a visual graph.',
    liveDemo: 'https://flowpilot-sage-delta.vercel.app/',
    github: 'https://github.com/jazsajonia-pixel/flowpilot',
    animation: '/projects/flowpilot-demo.gif',
    accent: 'indigo',
  },
  {
    slug: 'meat-fleet-management',
    title: 'Meat Delivery Fleet Management System',
    category: 'Full-stack web development',
    type: 'University group project · no public demo',
    description: 'I contributed to a university group project for business operations including reporting, GPS tracking, inventory, content, and supplier management.',
    tags: ['PHP', 'JavaScript', 'HTML', 'CSS', 'Bootstrap', 'MySQL', 'Google API'],
    contribution: 'I handled most of the implementation work while collaborating with the rest of the group.',
    learned: 'I practiced turning operational requirements into modules and integrating Google Maps-based location features.',
    accent: 'slate',
  },
  {
    slug: 'unified-business-system',
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

const accentStyles = {
  orange: 'from-orange-500 via-fuchsia-500 to-violet-700',
  teal: 'from-emerald-400 via-teal-600 to-slate-900',
  violet: 'from-violet-500 via-violet-700 to-slate-950',
  blue: 'from-blue-500 via-blue-800 to-slate-950',
  sky: 'from-sky-400 via-slate-800 to-slate-950',
  indigo: 'from-indigo-500 via-indigo-800 to-slate-950',
  slate: 'from-slate-700 via-slate-800 to-slate-950',
};

export default function ProjectsPage() {
  return (
    <section className="space-y-8">
      <header>
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-700">Project archive</div>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">Projects and contributions</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700 dark:text-slate-300">
          These are projects I built and team or coursework projects I contributed to. I note my role and what I learned so the scope of my work is clear. Live links are included for deployed web apps; Android and game projects use animated previews where available.
        </p>
      </header>

      <div className="grid gap-5">
        {projects.map((project, index) => <motion.article id={project.slug} key={project.slug} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .04 }} className="scroll-mt-6 overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="grid lg:grid-cols-[.9fr_1.1fr]">
            <div className={`min-h-[230px] bg-gradient-to-br ${accentStyles[project.accent]} p-4`}>
              {project.animation
                ? <AnimatedProjectPreview src={project.animation} alt={`${project.title} animated preview`} className="min-h-[198px] rounded-[18px] shadow-2xl" />
                : project.image
                  ? <img src={project.image} alt={`${project.title} interface`} className="h-full min-h-[198px] w-full rounded-[18px] object-cover shadow-2xl" />
                  : <div className="flex h-full min-h-[198px] flex-col justify-between rounded-[18px] border border-white/15 bg-black/20 p-5 text-white"><GraduationCap size={32} weight="fill" /><div><div className="font-mono text-xs uppercase tracking-[0.15em] text-white/75">University project</div><div className="mt-2 text-2xl font-bold">{project.title}</div></div></div>}
            </div>
            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700 dark:text-orange-400">{project.category}</div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700 dark:bg-slate-800 dark:text-slate-200">{project.type}</div>
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{project.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">{project.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">{project.tags.map((tag) => <span key={tag} className="rounded-full border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:border-slate-600 dark:text-slate-200">{tag}</span>)}</div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800"><div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">My contribution</div><p className="mt-2 text-xs leading-5 text-slate-700 dark:text-slate-200">{project.contribution}</p></div>
                <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800"><div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">What I learned</div><p className="mt-2 text-xs leading-5 text-slate-700 dark:text-slate-200">{project.learned}</p></div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                {project.liveDemo && <a href={project.liveDemo} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-orange-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700">Live demo <ArrowSquareOut size={15} /></a>}
                {project.github && <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-orange-500 dark:border-slate-600 dark:text-slate-100">GitHub <GithubLogo size={15} /></a>}
              </div>
            </div>
          </div>
        </motion.article>)}
      </div>

      <aside className="rounded-[22px] border border-orange-300 bg-orange-50 p-5 dark:border-orange-700/60 dark:bg-orange-950/30">
        <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-orange-800 dark:text-orange-300">Automation practice</div>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-800 dark:text-slate-200">
          I’ve practiced Make.com flows using triggers, filters, routers, webhooks, scheduling, and integrations with tools such as Google Sheets, Gmail, and Airtable. This reflects hands-on learning, not a claim of extensive client work.
        </p>
      </aside>
    </section>
  );
}
