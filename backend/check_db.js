const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); async function main() { const posts = await prisma.post.findMany();
  console.log('Total posts:', posts.length);
  if (posts.length > 0) {
    console.log('Sample post:', posts[0]);
    
    // Check Hai Phong posts
    const hpPosts = await prisma.post.findMany({
      where: { city: { slug: 'hai-phong' } }
    });
    console.log('Hai Phong posts:', hpPosts.length);
  } console.log(posts); } main().catch(console.error).finally(() => prisma.$disconnect());
