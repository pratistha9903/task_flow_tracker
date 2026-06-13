import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/auth';
import { analyticsService } from './analytics.service';

export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const data = await analyticsService.getDashboard();
  res.status(200).json({ success: true, data });
});

export const getUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await analyticsService.getUsers();
  res.status(200).json({ success: true, data: users });
});
