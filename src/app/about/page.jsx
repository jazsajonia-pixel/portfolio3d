'use client';

import { motion } from 'framer-motion';
import { Briefcase, CheckCircle, GraduationCap, Lightning, Wrench } from 'phosphor-react';

const skillGroups = [
  { title: 'Web development', items: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vite', 'Tailwind CSS', 'Node.js', 'Express', 'Hono', 'PHP', 'REST APIs'] },
  { title: 'Databases and mobile', items: ['PostgreSQL', 'MySQL', 'Neon', 'Prisma', 'Drizzle ORM', 'Flutter (Dart)', 'Kotlin', 'Jetpack Compose', 'React Native (Expo)'] },
  { title: 'AI and automation', items: ['Make.com', 'Webhooks', 'HTTP / API modules', 'JSON', 'Airtable', 'Google Sheets', 'Gmail', 'OpenAI API', 'Gemini API', 'Claude API', 'Prompt engineering', 'Structured AI outputs', 'AI agents', 'Human-in-the-loop approvals'] },
  { title: 'DevOps and version control', items: ['Git', 'GitHub', 'Pull requests and merging', 'Conflict resolution', 'GitHub Actions CI/CD', 'Vercel', 'Automated testing'] },
  { title: 'Admin and operations', items: ['Microsoft Excel', 'Word', 'PowerPoint', 'Google Sheets', 'Data encoding', 'Record keeping', 'Technical documentation', 'Inventory and logistics documentation'] },
];

const experience = [
  { role: 'Encoder', place: 'HPG Apopong, General Santos City', period: 'Sep 2026 – present', detail: 'Encode and maintain official records and prepare and transmit daily documents, including DPAR and PICE. Prepare and review memoranda and official communications, and keep confidential files organized.' },
  { role: 'Farm Accounting Staff', place: 'Abdeo Farm, General Santos City', period: 'Jul – Aug 2026', detail: 'Managed daily financial transactions, check postings, and worker payroll; handled delivery receipts and logistics records; audited inventory of agricultural inputs.' },
  { role: 'HR Office Intern', place: 'South East Asian Institute of Technology, Tupi', period: 'Jul – Nov 2025', detail: 'Encoded and organized employee and student records, processed documents and correspondence, and assisted students, faculty, and visitors.' },
];

export default function AboutPage() {
  return <section className="space-y-8">
    <header>
      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-700">About me</div>
      <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">Full-stack developer and AI automation specialist.</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700 dark:text-slate-300">I’m Jazzther Bert Shanne Sajonia, an IT graduate (BS Information Technology, SEAIT, 2022–2026) from General Santos City. I build web apps, Android apps, and AI-powered automations that connect forms, email, CRMs, and AI models into workflows people can trust.</p>
    </header>
    <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-3 text-orange-600 dark:text-orange-400"><GraduationCap size={21} weight="fill" /><h2 className="text-xl font-bold text-slate-900 dark:text-white">What I do</h2></div>
          <p className="mt-4 leading-7 text-slate-700 dark:text-slate-300">On the web side I build full-stack apps with React, TypeScript, Node.js, and PostgreSQL, from the first screen to a deployed app with CI. On the mobile side I build native Kotlin and Flutter apps for Android, including on-device AI.</p>
          <p className="mt-4 leading-7 text-slate-700 dark:text-slate-300">As an automation specialist I design Make.com scenarios with webhooks, routers, filters, and error handlers, and add AI steps that return structured JSON. I keep a human approval step before anything important is sent, and log every run so problems are easy to trace.</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <div className="flex items-center gap-3 text-cyan-300"><Wrench size={21} weight="fill" /><h2 className="text-xl font-bold">How I use AI while coding</h2></div>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2">{['Plan the feature', 'Explain the requirements', 'Review the suggested code', 'Modify and debug', 'Test the behavior', 'Integrate the change'].map((item, index) => <li key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200"><span className="font-mono text-orange-300">0{index + 1}</span>{item}</li>)}</ol>
          <p className="mt-5 text-sm leading-6 text-slate-300">AI can speed up exploration, but I’m responsible for understanding, reviewing, testing, and integrating the code I use.</p>
        </div>
      </motion.div>
      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-5 flex items-center justify-between gap-4"><div><div className="text-[11px] font-bold uppercase tracking-[0.15em] text-orange-700 dark:text-orange-400">Tools and experience</div><h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Skills</h2></div><CheckCircle size={27} className="text-emerald-600 dark:text-emerald-400" weight="fill" /></div>
        <div className="space-y-6">{skillGroups.map((group) => <div key={group.title}><h3 className="mb-3 font-semibold text-slate-900 dark:text-white">{group.title}</h3><div className="flex flex-wrap gap-2">{group.items.map((item) => <span key={item} className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200">{item}</span>)}</div></div>)}</div>
        <p className="mt-6 border-t border-slate-300 pt-5 text-sm leading-6 text-slate-700 dark:border-slate-600 dark:text-slate-300">Strengths: problem solving, research, debugging, organization, attention to detail, and independent learning.</p>
      </div>
    </div>
    <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3 text-orange-600 dark:text-orange-400"><Briefcase size={21} weight="fill" /><h2 className="text-xl font-bold text-slate-900 dark:text-white">Work experience</h2></div>
        <ol className="mt-5 space-y-4">{experience.map((job) => <li key={job.role} className="border-l-2 border-orange-500 pl-4"><div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="font-semibold text-slate-900 dark:text-white">{job.role} · <span className="font-normal text-slate-700 dark:text-slate-300">{job.place}</span></h3><span className="font-mono text-xs text-slate-600 dark:text-slate-400">{job.period}</span></div><p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">{job.detail}</p></li>)}</ol>
      </div>
      <div className="space-y-5">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-3 text-orange-600 dark:text-orange-400"><GraduationCap size={21} weight="fill" /><h2 className="text-xl font-bold text-slate-900 dark:text-white">Education</h2></div>
          <p className="mt-4 font-semibold text-slate-900 dark:text-white">BS Information Technology</p>
          <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">South East Asian Institute of Technology, Tupi, South Cotabato · 2022–2026</p>
        </div>
        <div className="rounded-[24px] border border-orange-300 bg-orange-50 p-6 dark:border-orange-700/60 dark:bg-orange-950/30">
          <div className="flex items-center gap-3 text-orange-700 dark:text-orange-300"><Lightning size={21} weight="fill" /><h2 className="text-xl font-bold text-slate-900 dark:text-white">Open to work</h2></div>
          <p className="mt-3 text-sm leading-6 text-slate-800 dark:text-slate-200">I’m looking for full-stack developer and AI automation roles. The contact page has my email and phone number.</p>
        </div>
      </div>
    </div>
  </section>;
}
