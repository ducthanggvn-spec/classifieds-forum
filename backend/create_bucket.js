const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('avatars', 'avatars', true) 
    ON CONFLICT (id) DO NOTHING;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE POLICY "Public Access" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'avatars');
  `).catch(() => {}); // Bỏ qua lỗi nếu policy đã tồn tại

  await prisma.$executeRawUnsafe(`
    CREATE POLICY "Public Upload" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'avatars');
  `).catch(() => {});
  
  await prisma.$executeRawUnsafe(`
    CREATE POLICY "Public Update" 
    ON storage.objects FOR UPDATE 
    WITH CHECK (bucket_id = 'avatars');
  `).catch(() => {});

  console.log('Bucket created and policies applied');
}

main().catch(console.error).finally(() => process.exit(0));
