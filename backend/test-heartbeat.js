const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const pseudoPostId = -2;
    const userId = "test";
    const nickname = "test";
    const avatarUrl = null;

    await prisma.postVisitor.upsert({
      where: {
        postId_userId: {
          postId: pseudoPostId,
          userId: String(userId),
        }
      },
      update: {
        nickname: nickname || "Khách",
        avatarUrl: avatarUrl || null,
        lastSeenAt: new Date(),
      },
      create: {
        postId: pseudoPostId,
        userId: String(userId),
        nickname: nickname || "Khách",
        avatarUrl: avatarUrl || null,
      }
    });

    const onlineUsers = await prisma.postVisitor.findMany({
      where: { postId: pseudoPostId },
      orderBy: { lastSeenAt: 'desc' },
      take: 100
    });

    console.log("Success:", onlineUsers);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
check();
