'use client';

import dynamic from 'next/dynamic';
import WelcomeIntro from '@/components/WelcomeIntro';

const ScrollRoomPortfolio = dynamic(() => import('@/components/ScrollRoomPortfolio'), { ssr: false });

export default function Home() {
  return (
    <div className="box-tour-shell">
      <WelcomeIntro />
      <ScrollRoomPortfolio />
    </div>
  );
}
