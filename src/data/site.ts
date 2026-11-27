export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export const site = {
  name: 'Santese',
  domain: 'santese.io',
  url: 'https://santese.io',
  title: 'Santese',
  description:
    'Santese works across software engineering, IT infrastructure, and security. Notes and a homelab journal.',
  locale: 'en',
  featuredProject: {
    name: 'Superendpoint',
    href: 'https://superendpoint.com/',
  },
  // Only list routes that exist.
  nav: [
    { label: 'Notes', href: '/notes/' },
    { label: 'Homelab', href: '/homelab/' },
  ] as NavItem[],
  feed: '/rss.xml',
  social: [
    { label: 'GitHub', href: 'https://github.com/santese' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/santesesmith/' },
  ] as SocialLink[],
} as const;
