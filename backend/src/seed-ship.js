const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.category.upsert({
    where: { id: 3 },
    update: { name: 'Nhận Ship / Tuyển Ship', slug: 'ship' },
    create: { id: 3, name: 'Nhận Ship / Tuyển Ship', slug: 'ship' }
  });
  console.log('Category 3 Ship added.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
