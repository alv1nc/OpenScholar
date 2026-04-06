import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

export class UsersController {
  static async makeFirstAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      
      const adminCount = await prisma.user.count({ where: { role: 'admin' } });
      if (adminCount > 0) {
        return res.status(403).json({ message: 'An admin already exists. Bootstrapper permanently locked.' });
      }

      const admin = await prisma.user.update({
        where: { id: req.user.id },
        data: { role: 'admin' }
      });
      res.status(200).json({ message: 'Success. You are now the first Server Administrator.', user: admin });
    } catch (e) {
      next(e);
    }
  }

  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, name: true, email: true, role: true, department: true }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Only the authenticated user can update their own profile
      if (req.user?.id !== id) {
        return res.status(403).json({ message: 'Forbidden: You can only edit your own profile' });
      }

      const { name, department } = req.body as { name?: string; department?: string };

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...(name && { name: name.trim() }),
          ...(department && { department: department.trim() }),
        },
        select: { id: true, name: true, email: true, role: true, department: true },
      });

      res.status(200).json({ user: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  static async search(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      const department = req.query.department as string;

      const where: Record<string, unknown> = {};

      if (query && query.trim().length > 0) {
        where.name = { contains: query.trim(), mode: 'insensitive' };
      }

      if (department && department.trim().length > 0) {
        where.department = department.trim();
      }

      // Return empty if no filters specified
      if (Object.keys(where).length === 0) {
        return res.status(200).json({ users: [] });
      }

      const users = await prisma.user.findMany({
        where,
        select: { id: true, name: true, role: true, department: true },
        take: 20
      });

      res.status(200).json({ users });
    } catch (error) {
      next(error);
    }
  }
}
