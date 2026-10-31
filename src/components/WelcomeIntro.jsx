'use client';

import { useEffect, useState } from 'react';

// Rendered in the static HTML so the greeting is the first thing visitors see.
// The 3D box pops in after it once the scene has loaded. The tour announces stop changes with a
// `tour:step` event; the greeting hides as soon as the tour leaves the first stop.
const words = 'Hi, nice to meet you! I’m Jazz.'.split(' ');

export default function WelcomeIntro() {
  const [hidden, setHidden] = useState(false);
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const onStep = (event) => {
      const { index, arrived } = event.detail ?? {};
      if (index !== 0) setHidden(true);
      else if (arrived) setHidden(false);
    };
    const media = window.matchMedia('(pointer: coarse)');
    const updatePointer = () => setCoarse(media.matches);
    updatePointer();
    window.addEventListener('tour:step', onStep);
    media.addEventListener('change', updatePointer);
    return () => {
      window.removeEventListener('tour:step', onStep);
      media.removeEventListener('change', updatePointer);
    };
  }, []);

  const openBox = () => window.dispatchEvent(new CustomEvent('tour:go', { detail: { index: 1 } }));

  return (
    <header className={`box-tour-welcome${hidden ? ' is-hidden' : ''}`} aria-hidden={hidden}>
      <h1>
        {words.map((word, index) => (
          <span key={`${word}-${index}`} style={{ animationDelay: `${0.1 + index * 0.08}s` }}>{word} </span>
        ))}
      </h1>
      <p style={{ animationDelay: '0.75s' }}>Full-stack developer &amp; AI automation specialist. Come inside.</p>
      <button type="button" className="box-tour-scroll-hint" onClick={openBox} tabIndex={hidden ? -1 : 0} style={{ animationDelay: '1s' }}>
        <span>{coarse ? 'Swipe up or tap to open the box' : 'Scroll or click to open the box'}</span>
        <svg width="20" height="20" viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" d="M213.66 101.66l-80 80a8 8 0 0 1-11.32 0l-80-80a8 8 0 0 1 11.32-11.32L128 164.69l74.34-74.35a8 8 0 0 1 11.32 11.32Z" /></svg>
      </button>
    </header>
  );
}
