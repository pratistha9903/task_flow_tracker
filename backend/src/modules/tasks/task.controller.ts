import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/auth';
import { taskService } from './task.service';

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const tasks = await taskService.getAll(req.user!.userId, req.user!.role);
  res.status(200).json({ success: true, data: tasks });
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.getById(
    req.params.id as string,
    req.user!.userId,
    req.user!.role
  );
  res.status(200).json({ success: true, data: task });
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.create(req.user!.userId, req.body);
  res.status(201).json({ success: true, data: task });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.update(
    req.params.id as string,
    req.user!.userId,
    req.user!.role,
    req.body
  );
  res.status(200).json({ success: true, data: task });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  await taskService.delete(req.params.id as string, req.user!.userId, req.user!.role);
  res.status(200).json({ success: true, message: 'Task deleted successfully' });
});
