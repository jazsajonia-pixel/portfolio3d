'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import profileImage from '../../assets/profile.jpeg';
import { Briefcase, CheckCircle, EnvelopeSimple, GithubLogo, LinkedinLogo, Globe, Lightning, Moon, Sparkle, Sun } from 'phosphor-react';

const PortfolioThemeContext = createContext(null);

export function usePortfolioTheme() {
  const context = useContext(PortfolioThemeContext);
  if (!context) throw new Error('usePortfolioTheme requires PortfolioShell');
  return context;
}

export default function PortfolioShell({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [themeReady, setThemeReady] = useState(false);
  const [transition, setTransition] = useState(null);
  const toggleRef = useRef(null);
  const transitionTimer = useRef(null);

  useEffect(() => {
    try {
      setIsDark(window.localStorage.getItem('portfolio-theme') === 'dark');
    } catch {
      // Keep the default theme when browser storage is unavailable.
    }
    setThemeReady(true);

    return () => window.clearTimeout(transitionTimer.current);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    if (!themeReady) return;
    try {
      window.localStorage.setItem('portfolio-theme', isDark ? 'dark' : 'light');
    } catch {
      // Theme switching still works without persistent storage.
    }
  }, [isDark, themeReady]);

  const toggleTheme = () => {
    if (transition) return;

    const nextDark = !isDark;
    const rect = toggleRef.current?.getBoundingClientRect();

    if (!rect) {
      setIsDark(nextDark);
      return;
    }

    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    ) * 1.08;

    setTransition({
      x,
      y,
      radius,
      color: nextDark ? '#0b0d10' : '#f7f3ef',
      nextDark,
    });

    transitionTimer.current = window.setTimeout(() => {
      setIsDark(nextDark);
      transitionTimer.current = window.setTimeout(() => setTransition(null), 70);
    }, 650);
  };

  const theme = isDark
    ? {
        page: '#080a0d',
        window: '#101318',
        sidebar: '#13171c',
        panel: '#171b21',
        panelSoft: '#1b2027',
        border: '#2b323d',
        text: '#f5f7fa',
        muted: '#a0a9b7',
        subtle: '#7d8796',
        white: '#20252d',
        chip: '#242a33',
        bluePanel: '#18232e',
        darkBox: '#080a0d',
        darkBox2: '#111720',
        button: '#f5f7fa',
        buttonText: '#101318',
      }
    : {
        page: '#020202',
        window: '#f5f1ee',
        sidebar: '#f8f5f1',
        panel: '#f7f3ef',
        panelSoft: '#fcf9f6',
        border: '#e4ded7',
        text: '#111827',
        muted: '#6b7280',
        subtle: '#4b5563',
        white: '#ffffff',
        chip: '#f2f5f9',
        bluePanel: '#dfeaf7',
        darkBox: '#161a20',
        darkBox2: '#101827',
        button: '#111827',
        buttonText: '#ffffff',
      };

  return (
    <PortfolioThemeContext.Provider value={{ theme, isDark }}>
      <div
        className="min-h-screen transition-[background-color] duration-700 ease-out"
        style={{
          backgroundColor: theme.page,
          color: theme.text,
          '--portfolio-card': theme.white,
          '--portfolio-text': theme.text,
          '--portfolio-muted': theme.muted,
          '--portfolio-subtle': theme.subtle,
          '--portfolio-border': theme.border,
          '--portfolio-chip': theme.chip,
        }}
      >
        <div
          className="mx-auto flex min-h-screen w-full flex-col overflow-hidden transition-[background-color] duration-700 ease-out"
          style={{ backgroundColor: theme.window }}
        >
          <TopBar theme={theme} isDark={isDark}>
            <button
              ref={toggleRef}
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                backgroundColor: theme.white,
                borderColor: theme.border,
                color: theme.text,
              }}
            >
              <motion.span
                className="flex items-center justify-center"
                animate={{ rotate: isDark ? 180 : 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                {isDark ? <Sun size={20} weight="fill" /> : <Moon size={20} weight="fill" />}
              </motion.span>
            </button>
          </TopBar>

          <div className="flex min-h-0 flex-1 flex-col md:flex-row">
            <Sidebar theme={theme} />

            <main
              id="main-content"
              className="relative min-w-0 flex-1 overflow-y-auto transition-[background-color] duration-700 ease-out"
              style={{ backgroundColor: theme.panel }}
            >
              <div className="mx-auto max-w-[1500px] p-3 sm:p-5 lg:p-8">
                <div
                  className="rounded-[28px] p-4 shadow-sm transition-[background-color,border-color] duration-700 sm:p-6 lg:p-8"
                  style={{ backgroundColor: theme.panelSoft, border: `1px solid ${theme.border}` }}
                >
                  {children}
                </div>
              </div>

            </main>
          </div>
        </div>

        <AnimatePresence>
          {transition && (
            <motion.div
              key={`${transition.x}-${transition.y}`}
              initial={{
                clipPath: `circle(0px at ${transition.x}px ${transition.y}px)`,
                opacity: 0.96,
              }}
              animate={{
                clipPath: `circle(${transition.radius}px at ${transition.x}px ${transition.y}px)`,
                opacity: 1,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
              style={{ backgroundColor: transition.color }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_35%)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PortfolioThemeContext.Provider>
  );
}

function TopBar({ theme, isDark, children }) {
  return (
    <div
      className="flex h-12 shrink-0 items-center justify-between border-b px-4 transition-colors duration-700"
      style={{ backgroundColor: isDark ? '#12151a' : '#f1efe9', borderColor: theme.border }}
    >
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#fdbb2d]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
      </div>
      <div className="flex items-center gap-3">
        <span
          className="rounded-full border px-3 py-1 text-[11px] transition-colors duration-700"
          style={{ borderColor: theme.border, backgroundColor: theme.white, color: theme.muted }}
        >
          Jazz Sajonia Portfolio
        </span>
        {children}
      </div>
    </div>
  );
}

function Sidebar({ theme }) {
  const pathname = usePathname();
  const items = [
    ['Home', Sparkle, '/'],
    ['Projects', Briefcase, '/projects'],
    ['Services', Lightning, '/services'],
    ['About', CheckCircle, '/about'],
    ['Contact', EnvelopeSimple, '/contact'],
  ];

  const socialLinks = [
    { name: 'GitHub', icon: GithubLogo, href: 'https://github.com/jazsajonia-pixel' },
    { name: 'LinkedIn', icon: LinkedinLogo, href: 'https://www.linkedin.com/in/jazzther-bert-shanne-sajonia-a67502439' },
    { name: 'Email', icon: EnvelopeSimple, href: 'mailto:jaz.sajonia@gmail.com' },
  ];

  return (
    <aside
      className="flex w-full shrink-0 flex-col border-b p-4 transition-colors duration-700 md:w-[260px] md:border-b-0 md:border-r md:p-5"
      style={{ backgroundColor: theme.sidebar, borderColor: theme.border }}
    >
      <motion.div
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3"
      >
        <motion.img
          whileHover={{ scale: 1.08, rotate: 2 }}
          src={profileImage.src}
          alt="Jazzther Bert Shanne O. Sajonia"
          className="h-12 w-12 rounded-full object-cover object-center shadow-sm"
        />
        <div className="min-w-0">
          <div className="truncate text-[15px] font-semibold" style={{ color: theme.text }}>
            Jazzther Bert Shanne O. Sajonia
          </div>
          <div className="truncate text-[11px]" style={{ color: theme.muted }}>
            jaz.sajonia@gmail.com
          </div>
        </div>
      </motion.div>

      <div className="mt-4 flex items-center gap-2">
        {socialLinks.map(({ name, icon: Icon, href }, index) => (
          <motion.a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={name}
            whileHover={{ y: -4, rotate: index % 2 ? -4 : 4 }}
            whileTap={{ scale: 0.9 }}
            className="flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition-colors duration-700"
            style={{ borderColor: theme.border, backgroundColor: theme.white, color: theme.text }}
          >
            <Icon size={16} weight="fill" />
          </motion.a>
        ))}
      </div>

      <nav aria-label="Main navigation" className="mt-5 flex flex-wrap gap-1 md:mt-8 md:block md:space-y-2">
        {items.map(([name, Icon, href], index) => (
          <Link key={name} href={href} aria-current={pathname === href ? "page" : undefined} className="block shrink-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.07 }}
              whileHover={{ x: 5 }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors duration-500 hover:bg-black/5"
              style={{ color: pathname === href ? theme.text : theme.subtle, backgroundColor: pathname === href ? theme.chip : undefined }}
            >
              <Icon size={18} />
              <span>{name}</span>
            </motion.div>
          </Link>
        ))}
      </nav>

      <div className="mt-4 hidden pt-4 md:mt-auto md:block" style={{ borderTop: `1px solid ${theme.border}` }}>
        <div className="text-[11px]" style={{ color: theme.muted }}>
          <span style={{ color: theme.text }}>© 2026</span> • Jazzther Bert Shanne O. Sajonia
          <p className="mt-2">All rights reserved.</p>
        </div>
      </div>
    </aside>
  );
}
