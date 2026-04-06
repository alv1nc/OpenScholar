import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { ConversationsService } from '../services/ConversationsService';

export class ConversationsController {
  
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const convs = await ConversationsService.getConversationsForUser(req.user!.id);
      res.status(200).json({ conversations: convs });
    } catch (error) {
      next(error);
    }
  }

  static async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const count = await ConversationsService.getGlobalUnreadCount(req.user.id);
      res.status(200).json({ unreadCount: count });
    } catch (error) {
      next(error);
    }
  }

  static async startChat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ message: 'userId required' });

      const conv = await ConversationsService.startOrGetConversation(req.user!.id, userId);
      res.status(200).json({ conversation: conv });
    } catch (error) {
      next(error);
    }
  }

  static async getMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const id = req.params.id as string;
      const messages = await ConversationsService.getMessages(id, req.user.id);
      
      const mapped = messages.map((m: any) => ({
        id: m.id,
        senderId: m.senderId,
        text: m.text,
        createdAt: m.createdAt
      }));

      res.status(200).json({ messages: mapped });
    } catch (error) {
      next(error);
    }
  }

  static async send(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { text } = req.body;
      
      if (!text) return res.status(400).json({ message: 'text is required' });

      const message = await ConversationsService.sendMessage(id, req.user!.id, text);
      
      res.status(201).json({
        message: {
          id: message.id,
          senderId: message.senderId,
          text: message.text,
          createdAt: message.createdAt
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
