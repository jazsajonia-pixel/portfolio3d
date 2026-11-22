'use client';

import { motion } from 'framer-motion';
import AnimatedProjectPreview from '@/components/AnimatedProjectPreview';
import { mainPortfolioProject, projects, projectGroups } from '@/data/projects';
import { ArrowRight, ArrowSquareOut, GithubLogo, GraduationCap, LockSimple } from 'phosphor-react';

// Each accent is a muted, room-matched tone: a soft tinted panel behind the preview plus a dot colour.
const accentStyles = {
  mint: { panel: '#dfe9e2', dot: '#3fbf9b', ink: '#1f4d40' },
  stone: { panel: '#e8e0d4', dot: '#a5764a', ink: '#4a3a2c' },
  indigo: { panel: '#e1e2ef', dot: '#6c71c4', ink: '#2e3164' },
  teal: { panel: '#dce8e5', dot: '#2f9e92', ink: '#1d4a45' },
  rose: { panel: '#f0e0dc', dot: '#c46a6a', ink: '#5b2c2c' },
  sky: { panel: '#dee7ee', dot: '#4f8fbf', ink: '#21425c' },
  slate: { panel: '#e3e1dd', dot: '#6f6a64', ink: '#3b3733' },
  amber: { panel: '#f1e5cf', dot: '#c98b2f', ink: '#5a3f12' },
  violet: { panel: '#e8e0ec', dot: '#9a6fb0', ink: '#43284f' },
  blue: { panel: '#dfe4ee', dot: '#4f6fb0', ink: '#22355a' },
  orange: { panel: '#f1e1d5', dot: '#c4572e', ink: '#5a2814' },
};

const accentFor = (project) => accentStyles[project.accent] || accentStyles.slate;
const isPrivate = (project) => project.type.toLowerCase().includes('private repository');

function Preview({ project, tall = false }) {
  const accent = accentFor(project);
  const minHeight = 'min-h-[210px]';
  if (tall && project.image) {
    return <img src={project.image} alt={`${project.title} interface`} width={1200} height={750} decoding="async" className="aspect-[8/5] w-full rounded-[14px] object-cover object-left-top shadow-[0_18px_40px_rgba(40,32,26,.18)]" />;
  }
  if (project.animation) {
    return <AnimatedProjectPreview src={project.animation} alt={`${project.title} animated preview`} className={`${minHeight} rounded-[14px] shadow-[0_18px_40px_rgba(40,32,26,.18)]`} />;
  }
  if (project.image) {
    return <img src={project.image} alt={`${project.title} interface`} width={1200} height={750} loading="lazy" decoding="async" className={`h-full ${minHeight} w-full rounded-[14px] object-cover object-left-top shadow-[0_18px_40px_rgba(40,32,26,.18)]`} />;
  }
  if (project.flow) {
    return (
      <div className={`flex h-full ${minHeight} flex-col justify-between gap-4 rounded-[14px] border border-black/5 bg-[#fbf8f3]/80 p-5`} style={{ color: accent.ink }}>
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] opacity-70">How it works</div>
        <ol className="flex flex-wrap items-center gap-2">
          {project.flow.map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              <span className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-semibold shadow-sm">{step}</span>
              {i < project.flow.length - 1 && <ArrowRight size={13} aria-hidden="true" className="opacity-50" />}
            </li>
          ))}
        </ol>
        <div className="text-xl font-bold tracking-tight">{project.title}</div>
      </div>
    );
  }
  return (
    <div className={`flex h-full ${minHeight} flex-col justify-between rounded-[14px] border border-black/5 bg-[#fbf8f3]/80 p-5`} style={{ color: accent.ink }}>
      <GraduationCap size={30} weight="duotone" />
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] opacity-70">University project</div>
        <div className="mt-2 text-2xl font-bold tracking-tight">{project.title}</div>
      </div>
    </div>
  );
}

function Links({ project }) {
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <a href={mainPortfolioProject(project.slug)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#c4572e]/40 bg-[#c4572e]/[.06] px-5 text-sm font-semibold text-[#a8461f] transition hover:border-[#c4572e] hover:bg-[#c4572e] hover:text-[#fbf8f3]">
        More info <ArrowSquareOut size={15} />
      </a>
      {project.liveDemo && (
        <a href={project.liveDemo} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#23201d] px-5 text-sm font-semibold text-[#fbf8f3] transition hover:bg-[#c4572e]">
          {project.liveLabel || 'Live demo'} <ArrowSquareOut size={15} />
        </a>
      )}
      {project.github && (
        <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#23201d]/20 px-5 text-sm font-semibold text-[#23201d] transition hover:border-[#c4572e] hover:text-[#c4572e]">
          GitHub <GithubLogo size={15} />
        </a>
      )}
      {!project.github && isPrivate(project) && (
        <span className="inline-flex min-h-12 items-center gap-2 rounded-full border border-dashed border-[#23201d]/25 px-5 text-sm font-medium text-[#6b6058]">
          <LockSimple size={15} weight="fill" /> Private repository · demo on request
        </span>
      )}
    </div>
  );
}

function Notes({ project }) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {[['My contribution', project.contribution], ['What I learned', project.learned]].map(([label, text]) => (
        <div key={label} className="rounded-2xl border border-[#23201d]/[.06] bg-[#f4eee5] p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8f847a]">{label}</div>
          <p className="mt-2 text-[13px] leading-6 text-[#4a423b]">{text}</p>
        </div>
      ))}
    </div>
  );
}

function Tags({ project }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2" aria-label="Built with">
      {project.tags.map((tag) => (
        <li key={tag} className="rounded-full bg-[#efe7dc] px-3 py-1 font-mono text-[11px] text-[#4a423b]">{tag}</li>
      ))}
    </ul>
  );
}

function Eyebrow({ project }) {
  const accent = accentFor(project);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[#6b6058]">
        <span className="h-2 w-2 rounded-full" style={{ background: accent.dot }} aria-hidden="true" />
        {project.category}
      </span>
      <span className="rounded-full border border-[#23201d]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#6b6058]">{project.type}</span>
    </div>
  );
}

function FeaturedProject({ project }) {
  const accent = accentFor(project);
  return (
    <motion.article id={project.slug} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="scroll-mt-28 overflow-hidden rounded-[24px] border border-[#23201d]/[.08] bg-[#fbf8f3] shadow-[0_1px_2px_rgba(31,26,23,.05),0_30px_70px_rgba(40,32,26,.12)]">
      <div className="grid lg:grid-cols-[1fr_1fr]">
        <div className="p-6 sm:p-9">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#23201d] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#fbf8f3]">Featured · currently building</div>
          <Eyebrow project={project} />
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#23201d] sm:text-5xl">{project.title}</h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#4a423b]">{project.description}</p>
          <Tags project={project} />
          <Notes project={project} />
          <Links project={project} />
        </div>
        <div className="flex items-center p-4 sm:p-6" style={{ background: `linear-gradient(160deg, ${accent.panel}, #f4eee5)` }}>
          <Preview project={project} tall />
        </div>
      </div>
    </motion.article>
  );
}

function ProjectCard({ project, index }) {
  const accent = accentFor(project);
  return (
    <motion.article id={project.slug} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index, 4) * 0.04 }} className="scroll-mt-28 overflow-hidden rounded-[22px] border border-[#23201d]/[.08] bg-[#fbf8f3] shadow-[0_1px_2px_rgba(31,26,23,.05),0_18px_44px_rgba(40,32,26,.08)]">
      <div className="grid lg:grid-cols-[.85fr_1.15fr]">
        <div className="p-3 sm:p-4" style={{ background: accent.panel }}>
          <Preview project={project} />
        </div>
        <div className="p-5 sm:p-7">
          <Eyebrow project={project} />
          <h3 className="mt-3 text-2xl font-bold tracking-tight text-[#23201d]">{project.title}</h3>
          <p className="mt-3 text-sm leading-6 text-[#4a423b]">{project.description}</p>
          <Tags project={project} />
          <Notes project={project} />
          <Links project={project} />
        </div>
      </div>
    </motion.article>
  );
}

export default function ProjectsPage() {
  const featured = projects.find((project) => project.featured);
  const rest = projects.filter((project) => project !== featured);
  return (
    <div className="space-y-12">
      <header className="max-w-3xl">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#c4572e]">Project archive · {projects.length} builds</div>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#23201d] sm:text-6xl">Projects and contributions</h1>
        <p className="mt-5 text-base leading-7 text-[#5e544c]">
          AI products, automations, web apps, and Android apps I built, plus university projects where I was the primary developer. Each entry notes my role and what I learned. Deployed web apps link to a live demo; Android projects use previews or a short flow, and private repositories can be shown on request.
        </p>
      </header>

      <nav aria-label="Project groups" className="sticky top-[72px] z-10 -mx-2 flex gap-2 overflow-x-auto px-2 py-2 [scrollbar-width:none]">
        {projectGroups.map((group) => (
          <a key={group.id} href={`#group-${group.id}`} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-[#23201d]/10 bg-[#fbf8f3]/90 px-4 text-[13px] font-semibold text-[#23201d] shadow-sm backdrop-blur transition hover:border-[#c4572e] hover:text-[#c4572e]">
            {group.title}
            <span className="rounded-full bg-[#efe7dc] px-2 py-0.5 font-mono text-[10px] text-[#6b6058]">{projects.filter((project) => project.group === group.id).length}</span>
          </a>
        ))}
      </nav>

      {featured && <FeaturedProject project={featured} />}

      {projectGroups.map((group) => {
        const items = rest.filter((project) => project.group === group.id);
        if (!items.length) return null;
        return (
          <section key={group.id} id={`group-${group.id}`} className="scroll-mt-28 space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#23201d]/10 pb-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#23201d] sm:text-3xl">{group.title}</h2>
                <p className="mt-1 text-sm text-[#6b6058]">{group.note}</p>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#8f847a]">{String(items.length).padStart(2, '0')} projects</span>
            </div>
            <div className="grid gap-5">
              {items.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}
            </div>
          </section>
        );
      })}

      <aside className="rounded-[22px] border border-[#23201d]/[.08] bg-[#2a2420] p-6 text-[#efe7dc] sm:p-8">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#e9b48f]">Automation toolkit</div>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#d9cfc3]">
          In Make.com I build multi-scenario workflows with routers, filters, iterators, aggregators, and error handlers; custom webhooks and HTTP/API modules; JSON parsing; and integrations with Airtable, Google Sheets, and Gmail. For AI steps I use the OpenAI, Gemini, and Claude APIs with structured outputs, and I keep a human approval step before anything important is sent.
        </p>
      </aside>
    </div>
  );
}
