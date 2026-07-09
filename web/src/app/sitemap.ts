import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ttvnol.vn';
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  try {
    // 1. Fetch cities (Markets)
    const citiesRes = await fetch(`${API_URL}/cities`, { cache: 'no-store' });
    if (citiesRes.ok) {
      const citiesResult = await citiesRes.json();
      const cities = citiesResult.data || [];
      
      cities.forEach((city: any) => {
        routes.push({
          url: `${baseUrl}/${city.slug}`,
          lastModified: new Date(),
          changeFrequency: 'hourly',
          priority: 0.9,
        });
      });
    }

    // 2. Fetch recent posts for each city (to keep sitemap size reasonable, we can just fetch all active posts or latest 1000)
    // Here we'll do a basic fetch to get recent posts to add to sitemap. 
    // In a huge forum, this should be paginated or indexed via sitemap index files.
    const postsRes = await fetch(`${API_URL}/posts?limit=500`, { cache: 'no-store' });
    if (postsRes.ok) {
      const postsResult = await postsRes.json();
      const posts = postsResult.data || [];
      
      posts.forEach((post: any) => {
        if (post.status !== 'archived') {
          routes.push({
            url: `${baseUrl}/${post.city.slug}/post/${post.id}`,
            lastModified: new Date(post.updatedAt || post.createdAt),
            changeFrequency: 'daily',
            priority: 0.7,
          });
        }
      });
    }

  } catch (error) {
    console.error("Lỗi tạo sitemap:", error);
  }

  return routes;
}
