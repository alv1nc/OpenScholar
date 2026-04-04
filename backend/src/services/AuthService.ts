import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { env } from '../config/env';

export class AuthService {
  static async registerUser(email: string, passwordHash: string, name: string, role: any, department?: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw { statusCode: 400, message: 'Email already in use' };
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        department
      }
    });

    return user;
  }

  static async loginUser(email: string, passwordPlain: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    const isMatch = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isMatch) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    return user;
  }

  static generateTokens(user: any) {
    const payload = {
      id: user.id,
      role: user.role,
      email: user.email
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  static async verifyRefresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as any;
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) throw new Error();
      return user;
    } catch (e) {
      throw { statusCode: 401, message: 'Invalid refresh token' };
    }
  }
}
