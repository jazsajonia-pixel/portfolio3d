'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import { button, useControls } from 'leva';

// Developer panel, only loaded with `?debug` in the URL (lazy chunk, never shipped to normal visitors' main bundle).
export default function DebugPanel() {
  const { gl, setDpr } = useThree();
  const values = useControls('Room', {
    exposure: { value: gl.toneMappingExposure, min: 0.4, max: 2, step: 0.05 },
    dpr: { value: Math.min(window.devicePixelRatio, 1.25), min: 0.5, max: 2, step: 0.25 },
    shadows: true,
    physics: { value: false, label: 'physics colliders' },
    human: { value: 'auto', options: ['auto', 'type', 'mouse', 'drink', 'stretch', 'think', 'bed', 'window'] },
    stats: true,
    night: button(() => window.dispatchEvent(new CustomEvent('tour:theme', { detail: { theme: 'night' } }))),
    day: button(() => window.dispatchEvent(new CustomEvent('tour:theme', { detail: { theme: 'day' } }))),
  });

  useEffect(() => { gl.toneMappingExposure = values.exposure; }, [gl, values.exposure]);
  useEffect(() => { setDpr(values.dpr); }, [setDpr, values.dpr]);
  useEffect(() => {
    gl.shadowMap.enabled = values.shadows;
    gl.shadowMap.needsUpdate = true;
  }, [gl, values.shadows]);
  useEffect(() => { window.dispatchEvent(new CustomEvent('room:debug', { detail: { physics: values.physics } })); }, [values.physics]);
  useEffect(() => {
    window.__tourDebug = window.__tourDebug || {};
    window.__tourDebug.humanForce = values.human === 'auto' ? null : values.human;
  }, [values.human]);

  // The Leva panel mounts itself on the first useControls call.
  return values.stats ? <Stats /> : null;
}
