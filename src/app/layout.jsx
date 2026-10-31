import './globals.css';

export const metadata = {
  title: 'Jazz Sajonia | Full-Stack Developer & AI Automation Specialist',
  description: 'Jazz Sajonia, full-stack developer and AI automation specialist. Explore Make.com automations, AI agents, web apps, and Android apps in an interactive 3D room.',
  keywords: ['Jazz Sajonia', 'portfolio', 'Three.js', 'React Three Fiber', 'full-stack developer', 'AI automation specialist', 'Make.com'],
  authors: [{ name: 'Jazzther Bert Shanne Sajonia' }],
  creator: 'Jazzther Bert Shanne Sajonia',
  openGraph: {
    type: 'website',
    title: 'Jazz Sajonia | Full-Stack Developer & AI Automation Specialist',
    description: 'Full-stack developer and AI automation specialist. Walk through an interactive room of projects.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
