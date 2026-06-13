import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/auth';
import { generateToken, omitPassword } from '../../utils/helpers';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role?: Role;
}

interface LoginInput {
  email: string;
  password: string;
}

export const authService = {
  async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError(409, 'Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const role = data.role === Role.ADMIN ? Role.ADMIN : Role.USER;
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user: omitPassword(user), token };
  },

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      throw new AppError(401, 'Invalid email or password');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user: omitPassword(user), token };
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    return omitPassword(user);
  },
};
