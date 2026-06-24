import { createApp } from './app';
import { InMemoryRepositories } from './repositories/InMemoryRepositories';
import { PrismaSausageRepositories } from './repositories/PrismaSausageRepositories';
import { SausageRepositories } from './repositories/SausageRepositories';
import { SausageAuthPort, SausageUser } from './ports/SausageAuthPort';
import { DEMO_COMPANY_ID, seedDemoSausageData } from './seed/demoSeed';
import { PrismaClient } from '@prisma/client';

const PORT = process.env.SAUSAGE_API_PORT ? parseInt(process.env.SAUSAGE_API_PORT, 10) : 4014;

async function bootstrap() {
  const companyId = process.env.SAUSAGE_DEMO_COMPANY_ID || DEMO_COMPANY_ID;
  
  let repos: SausageRepositories;
  if (process.env.SAUSAGE_STORAGE_MODE === 'postgres') {
    const prisma = new PrismaClient();
    repos = new PrismaSausageRepositories(prisma);
    if (process.env.SAUSAGE_SEED_DEMO !== 'false') {
      await seedDemoSausageData(repos, companyId);
    }
    console.log('Using PostgreSQL + Prisma for Sausage Production persistence');
  } else {
    const inMemory = new InMemoryRepositories();
    await seedDemoSausageData(inMemory, companyId);
    repos = inMemory;
    console.log('Using InMemory storage for Sausage Production persistence');
  }

  const authPort: SausageAuthPort = {
    getCurrentUser(): SausageUser {
      return { id: 'dev-user', companyId, role: 'admin', name: 'Dev Admin' };
    },
    requireRole(role: string) {},
    getCompanyScope() { return companyId; }
  };

  const app = createApp(repos, authPort);

  app.listen(PORT, () => {
    console.log(`Backend Dev Server for Sausage Production is running on http://127.0.0.1:${PORT}`);
  });
}

bootstrap().catch(console.error);
