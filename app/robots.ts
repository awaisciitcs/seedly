import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/*', '/account', '/account/*', '/cart', '/checkout', '/api/*'],
    },
    sitemap: 'https://seedly.pk/sitemap.xml',
  };
}
