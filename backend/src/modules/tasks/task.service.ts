import { Role, TaskStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/auth';

interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

export const taskService = {
  async getAll(userId: string, role: Role) {
    const where = role === Role.ADMIN ? {} : { userId };
    return prisma.task.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: string, userId: string, role: Role) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    if (role !== Role.ADMIN && task.userId !== userId) {
      throw new AppError(403, 'Access denied');
    }

    return task;
  },

  async create(userId: string, data: CreateTaskInput) {
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || TaskStatus.TODO,
        userId,
      },
    });
  },

  async update(id: string, userId: string, role: Role, data: UpdateTaskInput) {
    await this.getById(id, userId, role);

    return prisma.task.update({
      where: { id },
      data,
    });
  },

  async delete(id: string, userId: string, role: Role) {
    await this.getById(id, userId, role);
    await prisma.task.delete({ where: { id } });
  },
};
