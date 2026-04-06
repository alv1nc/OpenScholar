import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { AuthService } from '../services/AuthService';
import { env } from '../config/env';
import prisma from '../lib/prisma';

export class AuthController {
  
  static async setupStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const adminCount = await prisma.user.count({ where: { role: 'admin' } });
      res.status(200).json({ adminExists: adminCount > 0 });
    } catch (error) {
      next(error);
    }
  }

  private static setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { fullName, email, password, role, department } = req.body;
      
      if (!fullName || !email || !password || !role) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const hash = await bcrypt.hash(password, 12);
      
      // Remapping fullName -> name as per frontend-backend mismatch
      const user = await AuthService.registerUser(email, hash, fullName, role, department);
      
      const { accessToken, refreshToken } = AuthService.generateTokens(user);
      AuthController.setRefreshCookie(res, refreshToken);

      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      };

      res.status(201).json({ accessToken, user: userResponse });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
      }

      const user = await AuthService.loginUser(email, password);
      const { accessToken, refreshToken } = AuthService.generateTokens(user);
      
      AuthController.setRefreshCookie(res, refreshToken);

      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      };

      res.status(200).json({ accessToken, user: userResponse });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
      }

      const user = await AuthService.verifyRefresh(refreshToken);
      const tokens = AuthService.generateTokens(user);
      
      AuthController.setRefreshCookie(res, tokens.refreshToken);

      res.status(200).json({ accessToken: tokens.accessToken });
    } catch (error) {
      res.clearCookie('refreshToken');
      next(error);
    }
  }

  static async me(req: any, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

      const user = await AuthService.verifyRefresh(req.cookies.refreshToken);

      res.status(200).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('refreshToken');
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}
