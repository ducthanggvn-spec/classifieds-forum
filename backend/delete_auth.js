const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`DELETE FROM auth.users`);
  console.log('All auth users deleted successfully');
}

main().catch(console.error).finally(() => process.exit(0));
