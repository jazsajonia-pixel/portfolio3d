'use client';

import { motion } from 'framer-motion';
import { CheckCircle, GraduationCap, Wrench } from 'phosphor-react';

const skillGroups = [
  { title: 'Used in personal and university projects', tone: 'orange', items: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'PHP', 'MySQL', 'PostgreSQL', 'Git', 'GitHub'] },
  { title: 'Currently developing', tone: 'teal', items: ['Node.js', 'Express', 'Laravel', 'API design', 'AI integrations'] },
];

export default function AboutPage() {
  return <section className="space-y-8">
    <header>
      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-700">About me</div>
      <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">Learning by building and reviewing.</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700 dark:text-slate-300">I’m Jazzther Bert Shanne Sajonia. I started programming seriously in early 2024 and have been learning through university coursework, independent study, and projects I build myself.</p>
    </header>
    <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-3 text-orange-600 dark:text-orange-400"><GraduationCap size={21} weight="fill" /><h2 className="text-xl font-bold text-slate-900 dark:text-white">My path so far</h2></div>
          <p className="mt-4 leading-7 text-slate-700 dark:text-slate-300">Most of my practical experience comes from coursework and personal builds. Those projects have helped me connect interfaces with APIs and databases, and understand more of the process from a first idea to a deployed app.</p>
          <p className="mt-4 leading-7 text-slate-700 dark:text-slate-300">Web development is my main focus. I’m also experimenting with AI-powered features and workflow automation, and still have a lot to learn in both areas.</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <div className="flex items-center gap-3 text-cyan-300"><Wrench size={21} weight="fill" /><h2 className="text-xl font-bold">How I use AI while coding</h2></div>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2">{['Plan the feature', 'Explain the requirements', 'Review the suggested code', 'Modify and debug', 'Test the behavior', 'Integrate the change'].map((item, index) => <li key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200"><span className="font-mono text-orange-300">0{index + 1}</span>{item}</li>)}</ol>
          <p className="mt-5 text-sm leading-6 text-slate-300">AI can speed up exploration, but I’m responsible for understanding, reviewing, testing, and integrating the code I use.</p>
        </div>
      </motion.div>
      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-5 flex items-center justify-between gap-4"><div><div className="text-[11px] font-bold uppercase tracking-[0.15em] text-orange-700 dark:text-orange-400">Tools and experience</div><h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Where I’m at</h2></div><CheckCircle size={27} className="text-emerald-600 dark:text-emerald-400" weight="fill" /></div>
        <div className="space-y-6">{skillGroups.map((group) => <div key={group.title}><h3 className="mb-3 font-semibold text-slate-900 dark:text-white">{group.title}</h3><div className="flex flex-wrap gap-2">{group.items.map((item) => <span key={item} className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200">{item}</span>)}</div></div>)}</div>
        <p className="mt-6 border-t border-slate-300 pt-5 text-sm leading-6 text-slate-700 dark:border-slate-600 dark:text-slate-300">My experience with AI APIs, prompt design, tool calling, and Make.com comes from experiments and project work. I’m continuing to build depth through implementation and testing.</p>
      </div>
    </div>
  </section>;
}
