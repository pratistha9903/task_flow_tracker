import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate, authorize } from '../../middleware/auth';
import { getDashboard, getUsers } from './analytics.controller';

const router = Router();

router.use(authenticate, authorize(Role.ADMIN));

router.get('/', getDashboard);
router.get('/users', getUsers);

export default router;
