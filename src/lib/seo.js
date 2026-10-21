export const defaultSEO = {
  titleTemplate: '%s | Jazz Sajonia Portfolio',
  description:
    'Portfolio of Jazzther Bert Shanne Sajonia, featuring personal software projects, university work, and clear notes on his contributions.',
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
      'Personal web development projects and university work by Jazzther Bert Shanne Sajonia, with live demos where available.',
  },
  projects: {
    title: 'Projects',
    description:
      'Personal and academic software projects with technologies, live demos where available, and a clear account of each contribution.',
  },
  services: {
    title: 'Areas of Practice',
    description:
      'Web development, API, AI, and workflow automation areas developed through practical projects and focused learning.',
  },
  about: {
    title: 'About',
    description:
      'Jazzther Bert Shanne Sajonia’s background, project experience, current tools, and approach to AI-assisted software development.',
  },
  contact: {
    title: 'Contact',
    description:
      'Contact Jazzther Bert Shanne Sajonia by email about a project or collaboration.',
  },
};

export const generateMetadata = (page) => {
  const pageData = pageSEO[page] || {};
  return {
    title: pageData.title,
    description: pageData.description,
    keywords: ['Web Developer', 'React', 'Next.js', 'Portfolio', 'AI-assisted development'],
    openGraph: {
      ...defaultSEO.openGraph,
      title: `${pageData.title} | Jazz Sajonia`,
      description: pageData.description,
    },
  };
};
