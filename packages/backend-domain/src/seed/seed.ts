import { PrismaClient } from '@prisma/client';
import { PrismaSausageRepositories } from '../repositories/PrismaSausageRepositories';
import { DEMO_COMPANY_ID, seedDemoSausageData } from './demoSeed';

const prisma = new PrismaClient();

async function main() {
  const companyId = process.env.SAUSAGE_DEMO_COMPANY_ID || DEMO_COMPANY_ID;
  const repos = new PrismaSausageRepositories(prisma);

  console.log(`Seeding sausage-production demo data for company ${companyId}...`);
  await seedDemoSausageData(repos, companyId);
  console.log('Done.');
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
