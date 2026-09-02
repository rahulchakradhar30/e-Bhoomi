import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/login'],
      disallow: ['/admin/', '/officer/', '/api/', '/internal/', '/auth/', '/mro/', '/rdo/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
