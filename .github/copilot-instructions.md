# Jazz Sajonia Portfolio - Development Instructions

## Project Overview
A modern, responsive portfolio website for Jazz Sajonia (Web Developer & AI Automation Specialist) built with Next.js, Tailwind CSS, and Framer Motion.

## Tech Stack
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Phosphor Icons
- **Font**: Poppins (Google Fonts)
- **SEO**: Next.js built-in SEO, next-seo package

## Project Structure
```
src/
├── app/
│   ├── layout.jsx (root layout with sidebar)
│   ├── page.jsx (home)
│   ├── projects/page.jsx
│   ├── services/page.jsx
│   ├── about/page.jsx
│   ├── contact/page.jsx
│   └── globals.css
├── components/
│   ├── Sidebar.jsx (left navigation)
│   ├── Marquee.jsx (tools animation)
│   └── SocialLinks.jsx
└── lib/
    └── seo.js (SEO configuration)
```

## Setup Checklist
- [x] Create project structure
- [x] Install dependencies
- [ ] Configure Tailwind CSS
- [ ] Add Google Fonts (Poppins)
- [ ] Create components (Sidebar, Marquee)
- [ ] Implement pages (Home, Projects, Services, About, Contact)
- [ ] Add animations and styling
- [ ] Configure SEO metadata
- [ ] Test responsive design
- [ ] Deploy

## Running the Project
```bash
npm run dev
```
Visit http://localhost:3000

## Build for Production
```bash
npm run build
npm start
```
