import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

export class AdminController {
  static async getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, department: true } });
      res.status(200).json({ users });
    } catch (e) { next(e); }
  }

  static async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      
      // Prevent deleting yourself to avoid lockout state
      if (req.user?.id === id) {
        return res.status(400).json({ message: "You cannot delete your own admin account." });
      }

      await prisma.user.delete({ where: { id } });
      res.status(200).json({ message: 'User permanently wiped via cascade.' });
    } catch (e) { next(e); }
  }

  static async elevateRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { role } = req.body;
      const user = await prisma.user.update({ where: { id }, data: { role } });
      res.status(200).json({ message: 'User privileges updated natively', user });
    } catch (e) { next(e); }
  }

  static async getAllPapers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const papers = await prisma.paper.findMany({ include: { user: { select: { name: true, email: true } } } });
      res.status(200).json({ papers });
    } catch (e) { next(e); }
  }

  static async deletePaper(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await prisma.paper.delete({ where: { id } });
      res.status(200).json({ message: 'Paper permanently wiped via cascade.' });
    } catch (e) { next(e); }
  }
}
