'use client';

import { motion } from 'framer-motion';
import { BracketsCurly, Database, Globe, Lightning, Robot } from 'phosphor-react';

const capabilityAreas = [
  { title: 'AI workflow automation', icon: Lightning, description: 'I build multi-scenario Make.com automations: custom webhooks in, routers and filters to route each record, iterators and aggregators for batches, and error handlers with retries so failed runs are caught and logged.', items: ['Make.com scenarios', 'Webhooks and HTTP/API modules', 'Error handling and run logs'] },
  { title: 'AI integrations and agents', icon: Robot, description: 'I add AI steps that classify, summarize, and draft using the OpenAI, Gemini, and Claude APIs with structured JSON outputs, and I build agents that propose actions while a person approves the important ones.', items: ['OpenAI / Gemini / Claude APIs', 'Structured AI outputs', 'Human-in-the-loop approvals'] },
  { title: 'CRM and business tools', icon: Database, description: 'I connect forms and inboxes to Airtable, Google Sheets, and Gmail: lead and ticket records, duplicate checks, priority alerts, and simple dashboards that the team can read.', items: ['Airtable CRM', 'Google Sheets', 'Gmail alerts'] },
  { title: 'Full-stack web apps', icon: BracketsCurly, description: 'I build React, Next.js, and TypeScript apps with Node.js, Express, or Hono APIs and PostgreSQL or MySQL databases, deployed on Vercel with CI on GitHub Actions.', items: ['React / Next.js / TypeScript', 'Node.js / Hono / REST APIs', 'PostgreSQL / Prisma / Drizzle'] },
  { title: 'Android apps', icon: Globe, description: 'I build native Kotlin and Jetpack Compose apps and Flutter apps for Android, including accessibility automation and AI models that run on the phone.', items: ['Kotlin / Jetpack Compose', 'Flutter / Dart', 'React Native (Expo)'] },
];

export default function ServicesPage() {
  return <section className="space-y-8">
    <header>
      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#c4572e]">What I can help with</div>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#23201d] sm:text-5xl">Automation, AI, and full-stack development.</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[#5e544c]">Each area below is backed by a project you can look at on the Projects page. I’m happy to talk through a clearly scoped workflow, app, or integration.</p>
    </header>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{capabilityAreas.map((area, index) => { const Icon = area.icon; return <motion.article key={area.title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .05 }} whileHover={{ y: -4 }} className="rounded-[24px] border border-[#23201d]/[.08] bg-[#fbf8f3] p-5 shadow-sm transition"><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#c4572e]/10 text-[#c4572e] "><Icon size={23} weight="fill" /></div><h2 className="text-xl font-bold text-[#23201d]">{area.title}</h2><p className="mt-3 text-sm leading-6 text-[#5e544c]">{area.description}</p><div className="mt-5 space-y-2">{area.items.map((item) => <div key={item} className="flex items-center gap-2 text-sm text-[#2f2a26]"><span className="h-1.5 w-1.5 rounded-full bg-[#c4572e]" />{item}</div>)}</div></motion.article>; })}</div>
  </section>;
}
