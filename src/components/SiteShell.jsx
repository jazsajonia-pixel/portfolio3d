'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, GithubLogo, LinkedinLogo } from 'phosphor-react';

const links = [
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact' },
];

// Shared frame for the 2D pages so they read as part of the same studio as the 3D room.
export default function SiteShell({ children }) {
  const pathname = usePathname();
  return (
    <div className="site-shell min-h-screen bg-[#efe7dc] text-[#23201d]">
      <header className="sticky top-0 z-30 border-b border-[#23201d]/[.07] bg-[#efe7dc]/85 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="group inline-flex min-h-12 items-center gap-3" aria-label="Back to the 3D room">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#23201d] text-[13px] font-bold text-[#fbf8f3] transition group-hover:bg-[#c4572e]">JS</span>
            <span className="hidden leading-tight sm:block">
              <span className="block text-[15px] font-bold tracking-tight">Jazz Sajonia</span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-[#8f847a]">Software builder</span>
            </span>
          </Link>
          <nav aria-label="Main" className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none]">
            {links.map((link) => {
              const active = pathname?.startsWith(link.href);
              return (
                <Link key={link.href} href={link.href} aria-current={active ? 'page' : undefined} className={`inline-flex min-h-12 shrink-0 items-center rounded-full px-3 text-[13px] font-semibold transition sm:px-4 ${active ? 'bg-[#23201d] text-[#fbf8f3]' : 'text-[#5e544c] hover:text-[#c4572e]'}`}>
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
        <Link href="/" className="mb-8 inline-flex min-h-12 items-center gap-2 rounded-full border border-[#23201d]/10 bg-[#fbf8f3] px-4 text-[13px] font-semibold text-[#23201d] shadow-sm transition hover:border-[#c4572e] hover:text-[#c4572e]">
          <ArrowLeft size={15} weight="bold" /> Back to the 3D room
        </Link>
        {children}
      </main>
      <footer className="border-t border-[#23201d]/[.07]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-[13px] text-[#6b6058] sm:px-6">
          <span>© {new Date().getFullYear()} Jazzther Bert Shanne O. Sajonia · General Santos City</span>
          <span className="flex items-center gap-2">
            <a href="mailto:jaz.sajonia@gmail.com" className="inline-flex min-h-12 items-center px-2 hover:text-[#c4572e]">jaz.sajonia@gmail.com</a>
            <a href="https://github.com/jazsajonia-pixel" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="grid h-12 w-12 place-items-center rounded-full hover:text-[#c4572e]"><GithubLogo size={20} /></a>
            <a href="https://www.linkedin.com/in/jazzther-bert-shanne-sajonia-a67502439" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="grid h-12 w-12 place-items-center rounded-full hover:text-[#c4572e]"><LinkedinLogo size={20} /></a>
          </span>
        </div>
      </footer>
    </div>
  );
}
