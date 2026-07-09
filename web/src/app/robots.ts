import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ttvnol.vn';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/inbox/', '/admin/', '/login', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
