const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const msgs = await prisma.marketMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    console.log("Total messages found:", msgs.length);
    console.log(msgs);
  } catch (e) {
    console.error("DB Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
check();
