const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      cityId: true,
      categoryId: true,
      comments: { select: { id: true } }
    }
  });
  console.log("All posts:");
  console.dir(posts, { depth: null });
}

main().catch(console.error).finally(() => prisma.$disconnect());
