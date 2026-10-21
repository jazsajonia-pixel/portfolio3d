import './globals.css';

export const metadata = {
  title: 'Jazz Sajonia | Portfolio3D',
  description: 'An interactive 3D room for exploring Jazz Sajonia\'s software projects.',
  keywords: ['Jazz Sajonia', 'portfolio', 'Three.js', 'React Three Fiber', 'web developer'],
  authors: [{ name: 'Jazzther Bert Shanne Sajonia' }],
  creator: 'Jazzther Bert Shanne Sajonia',
  openGraph: {
    type: 'website',
    title: 'Jazz Sajonia | Portfolio3D',
    description: 'Walk through an interactive room of software projects.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
