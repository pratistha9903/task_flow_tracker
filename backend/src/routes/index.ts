import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import taskRoutes from '../modules/tasks/task.routes';
import analyticsRoutes from '../modules/analytics/analytics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
