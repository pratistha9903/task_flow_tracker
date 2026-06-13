import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JwtPayload } from '../middleware/auth';

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
};

export const omitPassword = <T extends { password?: string }>(
  user: T
): Omit<T, 'password'> => {
  const { password: _, ...rest } = user;
  return rest;
};
