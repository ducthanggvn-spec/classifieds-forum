const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const user = await prisma.user.findFirst();
    const city = await prisma.city.findUnique({ where: { slug: 'hai-phong' } });
    
    const newMessage = await prisma.marketMessage.create({
      data: {
        cityId: city.id,
        userId: user.id,
        content: "Đây là tin nhắn thử nghiệm hệ thống. Gửi thành công vào Hải Phòng!",
        imageUrl: null
      }
    });
    console.log("Inserted:", newMessage);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
check();
