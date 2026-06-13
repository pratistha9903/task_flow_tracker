import { Role } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/auth';

export const analyticsService = {
  async getDashboard() {
    const [tasks, users] = await Promise.all([
      prisma.task.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, createdAt: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    const todo = tasks.filter((t) => t.status === 'TODO').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const done = tasks.filter((t) => t.status === 'DONE').length;
    const totalTasks = tasks.length;

    const tasksByUser = users.map((user) => {
      const userTasks = tasks.filter((t) => t.userId === user.id);
      const userTodo = userTasks.filter((t) => t.status === 'TODO').length;
      const userProgress = userTasks.filter((t) => t.status === 'IN_PROGRESS').length;
      const userDone = userTasks.filter((t) => t.status === 'DONE').length;
      const total = userTasks.length;
      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        todo: userTodo,
        inProgress: userProgress,
        done: userDone,
        total,
        completionRate: total > 0 ? Math.round((userDone / total) * 100) : 0,
      };
    });

    return {
      overview: {
        totalUsers: users.length,
        totalTasks,
        todo,
        inProgress,
        done,
        completionRate: totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0,
      },
      statusBreakdown: [
        { status: 'TODO', count: todo, percentage: totalTasks ? Math.round((todo / totalTasks) * 100) : 0 },
        { status: 'IN_PROGRESS', count: inProgress, percentage: totalTasks ? Math.round((inProgress / totalTasks) * 100) : 0 },
        { status: 'DONE', count: done, percentage: totalTasks ? Math.round((done / totalTasks) * 100) : 0 },
      ],
      tasksByUser,
      recentTasks: tasks.slice(0, 8).map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        updatedAt: t.updatedAt,
        owner: t.user.name,
        ownerEmail: t.user.email,
      })),
    };
  },

  async getUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};
