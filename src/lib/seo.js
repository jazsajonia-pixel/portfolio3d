export const defaultSEO = {
  titleTemplate: '%s | Jazz Sajonia Portfolio',
  description:
    'Portfolio of Jazzther Bert Shanne Sajonia, full-stack developer and AI automation specialist: Make.com automations, AI agents, web apps, and Android apps.',
  canonical: 'https://jazz-portfolio1.vercel.app',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://jazz-portfolio1.vercel.app',
    siteName: 'Jazz Sajonia Portfolio',
    images: [],
  },
  twitter: {
    cardType: 'summary_large_image',
  },
};

export const pageSEO = {
  home: {
    title: 'Home',
    description:
      'AI automations, full-stack web apps, and Android apps by Jazzther Bert Shanne Sajonia, with live demos where available.',
  },
  projects: {
    title: 'Projects',
    description:
      'AI automation, AI agent, web, Android, and academic projects with technologies, live demos where available, and a clear account of each contribution.',
  },
  services: {
    title: 'Services',
    description:
      'Make.com workflow automation, AI integrations and agents, CRM and business-tool integrations, full-stack web apps, and Android apps.',
  },
  about: {
    title: 'About',
    description:
      'Jazzther Bert Shanne Sajonia: IT graduate, full-stack developer and AI automation specialist. Skills, work experience, and education.',
  },
  contact: {
    title: 'Contact',
    description:
      'Contact Jazzther Bert Shanne Sajonia by email or phone about a role, project, or automation.',
  },
};

export const generateMetadata = (page) => {
  const pageData = pageSEO[page] || {};
  return {
    title: pageData.title,
    description: pageData.description,
    keywords: ['Full-stack developer', 'AI automation specialist', 'Make.com', 'React', 'Next.js', 'Portfolio'],
    openGraph: {
      ...defaultSEO.openGraph,
      title: `${pageData.title} | Jazz Sajonia`,
      description: pageData.description,
    },
  };
};
