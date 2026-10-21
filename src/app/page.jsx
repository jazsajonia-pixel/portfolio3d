'use client';

import dynamic from 'next/dynamic';

const RoomPortfolio = dynamic(() => import('@/components/RoomPortfolio'), { ssr: false });

export default function Home() {
  return <RoomPortfolio />;
}
