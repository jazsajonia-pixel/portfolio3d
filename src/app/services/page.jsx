'use client';

import { motion } from 'framer-motion';
import { BracketsCurly, Database, Globe, Lightning, Robot } from 'phosphor-react';

const capabilityAreas = [
  { title: 'Web app features', icon: BracketsCurly, description: 'I’ve built React and Next.js interfaces for personal and university projects, including responsive pages and multi-step product flows.', items: ['React / Next.js', 'JavaScript / TypeScript', 'Responsive interfaces'] },
  { title: 'APIs and data', icon: Database, description: 'My projects have connected application interfaces to APIs and relational databases. I’m continuing to improve my backend and data-design skills.', items: ['REST / JSON', 'MySQL / PostgreSQL', 'Prisma and validation'] },
  { title: 'Interface implementation', icon: Globe, description: 'I work on page structure, reusable components, interaction states, and layouts that adapt to mobile and desktop screens.', items: ['Tailwind CSS', 'Accessible controls', 'Responsive layouts'] },
  { title: 'AI API experiments', icon: Robot, description: 'I’ve explored adding AI providers and prompt-driven features to applications. This is an area I’m actively learning, not a claim of specialist consulting experience.', items: ['OpenAI API', 'Gemini API', 'Claude API'] },
  { title: 'Workflow automation practice', icon: Lightning, description: 'I’ve practiced connecting triggers, conditions, webhooks, schedules, and business tools in Make.com scenarios.', items: ['Triggers and filters', 'Routers and webhooks', 'Scheduling and integrations'] },
];

export default function ServicesPage() {
  return <section className="space-y-8">
    <header>
      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-700">Areas of practice</div>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">Work I’ve practiced through projects.</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700 dark:text-slate-300">These are areas where I’ve gained hands-on experience and continue to build skill. I’m most comfortable discussing a clearly scoped task that matches the work shown in my projects.</p>
    </header>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{capabilityAreas.map((area, index) => { const Icon = area.icon; return <motion.article key={area.title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .05 }} whileHover={{ y: -4 }} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition dark:border-slate-700 dark:bg-slate-900"><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-700 dark:text-orange-400"><Icon size={23} weight="fill" /></div><h2 className="text-xl font-bold text-slate-900 dark:text-white">{area.title}</h2><p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">{area.description}</p><div className="mt-5 space-y-2">{area.items.map((item) => <div key={item} className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200"><span className="h-1.5 w-1.5 rounded-full bg-orange-600 dark:bg-orange-400" />{item}</div>)}</div></motion.article>; })}</div>
  </section>;
}
