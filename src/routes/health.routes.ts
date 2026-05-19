import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

// Health check is queried by load balancers and orchestration tools (K8s liveness probe).
// It reports DB status so infra knows if the service is truly healthy.
router.get('/', (_req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : 'disconnected';

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
  });
});

export default router;
