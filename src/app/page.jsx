'use client';

import dynamic from 'next/dynamic';

const ScrollRoomPortfolio = dynamic(() => import('@/components/ScrollRoomPortfolio'), { ssr: false });

export default function Home() {
  return <ScrollRoomPortfolio />;
}
