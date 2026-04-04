import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export class UsersController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
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
}
