import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: 'admin@example.com' },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('pass123', 10);
    await prisma.admin.create({
      data: {
        email: 'admin@example.com',
        passwordHash,
        isSuperAdmin: true,
      },
    });
    console.log('Seeded admin: admin@example.com / pass123');
  }
}
  
main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());