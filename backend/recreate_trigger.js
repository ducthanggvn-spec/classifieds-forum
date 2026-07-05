const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger AS $$
    BEGIN
      INSERT INTO public."User" ("supabaseUid", email, "fullName", "nickname", "birthYear")
      VALUES (
        new.id, 
        new.email, 
        COALESCE(new.raw_user_meta_data->>'full_name', ''),
        COALESCE(new.raw_user_meta_data->>'nickname', new.email),
        CAST(NULLIF(new.raw_user_meta_data->>'birthYear', '') AS INTEGER)
      );
      RETURN new;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);

  // Xóa trigger cũ nếu có
  await prisma.$executeRawUnsafe(`
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  `);

  // Tạo lại trigger
  await prisma.$executeRawUnsafe(`
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  `);

  console.log('Trigger re-created successfully');
}

main().catch(console.error).finally(() => process.exit(0));
