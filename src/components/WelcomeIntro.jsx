'use client';

import { useEffect, useState } from 'react';

// Rendered in the static HTML so the greeting is the first thing visitors see.
// The 3D box pops in after it once the scene has loaded.
const words = 'Hi, nice to meet you! I’m Jazz.'.split(' ');
const WELCOME_END = 0.035; // matches TIMELINE.welcomeEnd in ScrollRoomPortfolio

export default function WelcomeIntro() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setHidden(max > 0 && window.scrollY / max >= WELCOME_END);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const openBox = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: Math.round(max * 0.35), behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <header className={`box-tour-welcome${hidden ? ' is-hidden' : ''}`} aria-hidden={hidden}>
      <h1>
        {words.map((word, index) => (
          <span key={`${word}-${index}`} style={{ animationDelay: `${0.1 + index * 0.08}s` }}>{word} </span>
        ))}
      </h1>
      <p style={{ animationDelay: '0.75s' }}>Full-stack web developer, learning by building. Come inside.</p>
      <button type="button" className="box-tour-scroll-hint" onClick={openBox} tabIndex={hidden ? -1 : 0} style={{ animationDelay: '1s' }}>
        <span>Scroll to open the box</span>
        <svg width="20" height="20" viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" d="M213.66 101.66l-80 80a8 8 0 0 1-11.32 0l-80-80a8 8 0 0 1 11.32-11.32L128 164.69l74.34-74.35a8 8 0 0 1 11.32 11.32Z" /></svg>
      </button>
    </header>
  );
}
