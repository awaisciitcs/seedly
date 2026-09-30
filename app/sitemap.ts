import { MetadataRoute } from 'next';
import { getProducts } from '../lib/services/products';
import { getKits } from '../lib/services/kits';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://seedly.pk';

  const staticRoutes = [
    '',
    '/shop',
    '/seeds',
    '/kits',
    '/teas',
    '/find-your-seed',
    '/about',
    '/contact',
    '/faq',
    '/shipping',
    '/returns',
    '/privacy',
    '/terms',
    '/product-disclaimer',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const [products, kits] = await Promise.all([
    getProducts(),
    getKits(),
  ]);

  const productRoutes = products.map((p) => ({
    url: `${baseUrl}/${p.product_type === 'tea' ? 'teas' : 'seeds'}/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const kitRoutes = kits.map((k) => ({
    url: `${baseUrl}/kits/${k.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...productRoutes, ...kitRoutes];
}
