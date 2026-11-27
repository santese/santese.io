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
  // Brand kit assets, served from public/.
  brand: {
    logoLight: '/brand/horizontal-light.svg',
    logoDark: '/brand/horizontal-dark.svg',
    ogImage: '/og-image.png',
    ogImageAlt: 'The santese.io logo: a geometric S beside the word santese.io.',
    themeColorLight: '#f2efe8',
    themeColorDark: '#141414',
  },
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
