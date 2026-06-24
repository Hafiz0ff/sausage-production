import { createApp } from './app';
import { InMemoryRepositories } from './repositories/InMemoryRepositories';
import { SausageAuthPort, SausageUser } from './ports/SausageAuthPort';
import { DEMO_COMPANY_ID, seedDemoSausageData } from './seed/demoSeed';

const PORT = 4014;

async function bootstrap() {
  const repos = new InMemoryRepositories();
  const companyId = DEMO_COMPANY_ID;
  seedDemoSausageData(repos, companyId);

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
