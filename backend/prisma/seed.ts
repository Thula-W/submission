import { PrismaClient, Gender, SubmissionStatus } from '@prisma/client';
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
  
const customerEmail = 'customer@example.com';
  let customer = await prisma.customer.findUnique({
    where: { email: customerEmail },
  });

  if (!customer) {
    const customerPasswordHash = await bcrypt.hash('customer123', 10);
    customer = await prisma.customer.create({
      data: {
        email: customerEmail,
        passwordHash: customerPasswordHash,
      },
    });
    console.log('Seeded customer: customer@example.com / customer123');
  }


  const sampleSubmissions = [
    {
      firstName: 'Kamal',
      lastName: 'Perera',
      email: 'kamal.perera@example.com',
      gender: Gender.MALE,
      status: SubmissionStatus.PENDING,
      mobileNumber: '+94771234567',
      address: '123 Galle Road, Colombo 03',
      feedback: 'Very quick response time.',
    },
    {
      firstName: 'Nimali',
      lastName: 'Fernando',
      email: 'nimali.fernando@example.com',
      gender: Gender.FEMALE,
      status: SubmissionStatus.REVIEWED,
      mobileNumber: '+94712345678',
      address: '45 Kandy Road, Kiribathgoda',
      feedback: 'User interface is very clean.',
    },
    {
      firstName: 'Alex',
      lastName: 'Silva',
      email: 'alex.silva@example.com',
      gender: Gender.OTHER,
      status: SubmissionStatus.APPROVED,
      mobileNumber: '+94763456789',
      address: '78 High Level Road, Nugegoda',
      feedback: null,
    },
    {
      firstName: 'Saman',
      lastName: 'Kumara',
      email: 'saman.kumara@example.com',
      gender: Gender.MALE,
      status: SubmissionStatus.PENDING,
      mobileNumber: '+94754567890',
      address: '12 Main Street, Negombo',
      feedback: 'Looking forward to the next update.',
    },
    {
      firstName: 'Dilani',
      lastName: 'Jayasinghe',
      email: 'dilani.j@example.com',
      gender: Gender.FEMALE,
      status: SubmissionStatus.ARCHIVED,
      mobileNumber: '+94725678901',
      address: '89 Beach Road, Mount Lavinia',
      feedback: 'Encountered no issues during submission.',
    },
  ];

  for (const item of sampleSubmissions) {
    const existingSubmission = await prisma.submission.findFirst({
      where: { email: item.email },
    });

    if (!existingSubmission) {
      await prisma.submission.create({
        data: {
          ...item,
          customerCreatedId: customer.id,
        },
      });
    }
  }

  console.log('Seeded 5 sample submissions successfully');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());