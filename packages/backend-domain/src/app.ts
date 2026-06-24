import express from 'express';
import { createSausageProductionRouter } from './routes/sausageProductionRouter';
import { SausageStockService } from './services/SausageStockService';
import { SausageProductionService } from './services/SausageProductionService';
import { SausageRepositories } from './repositories/SausageRepositories';
import { SausageAuthPort } from './ports/SausageAuthPort';
import { SausageApiError, SAUSAGE_ERROR_CODES } from 'sausage-shared-types';
import cors from 'cors';

export function createApp(
  repos: SausageRepositories,
  authPort: SausageAuthPort
) {
  const app = express();
  app.use(cors({ origin: /^http:\/\/(127\.0\.0\.1|localhost):\d+$/ }));
  app.use(express.json());

  const stockService = new SausageStockService(repos, authPort);
  const productionService = new SausageProductionService(repos, authPort);

  app.use('/api/sausage-production', createSausageProductionRouter(stockService, productionService));

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err.error && err.error.code) {
      const e = err as SausageApiError;
      res.status(getSausageErrorStatus(e.error.code)).json(e);
      return;
    }
    console.error(err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  });

  return app;
}

function getSausageErrorStatus(code: string): number {
  if (code === SAUSAGE_ERROR_CODES.NOT_FOUND) {
    return 404;
  }

  if (
    code === SAUSAGE_ERROR_CODES.FORBIDDEN_TRANSITION ||
    code === SAUSAGE_ERROR_CODES.INSUFFICIENT_STOCK ||
    code === SAUSAGE_ERROR_CODES.NEGATIVE_STOCK_FORBIDDEN
  ) {
    return 409;
  }

  return 400;
}
