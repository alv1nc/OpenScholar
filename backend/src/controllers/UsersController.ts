import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

export class UsersController {
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
}
