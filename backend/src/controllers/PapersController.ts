import { Request, Response, NextFunction } from 'express';
import { PapersService } from '../services/PapersService';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../lib/prisma';
import path from 'path';
import fs from 'fs';

export class PapersController {
  
  static async getRecent(req: Request, res: Response, next: NextFunction) {
    try {
      const papers = await PapersService.getRecent();
      res.status(200).json({ papers });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      const searchBy = req.query.searchBy as string;
      if (query) {
        const papers = await PapersService.search(query, searchBy);
        return res.status(200).json({ papers });
      } else {
        const papers = await PapersService.getRecent();
        return res.status(200).json({ papers });
      }
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await PapersService.getById(id);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async getPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await PapersService.getById(id);
      
      if (!data.paper || !data.paper.pdfUrl) {
        return res.status(404).json({ message: 'PDF not found attached to this paper' });
      }

      // Extract filename from stored "/uploads/123.pdf" string
      const filename = data.paper.pdfUrl.split('/').pop();
      const filePath = path.join(process.cwd(), 'uploads', filename as string);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Source file could not be located on the server filesystem' });
      }

      res.setHeader('Content-Type', 'application/pdf');
      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

      // Handle the comma separated strings from multipart/form-data
      const rawAuthors = req.body.authors || '';
      const rawKeywords = req.body.keywords || '';

      const authors = rawAuthors.split(',').map((s: string) => s.trim()).filter(Boolean);
      const keywords = rawKeywords.split(',').map((s: string) => s.trim()).filter(Boolean);

      const paperData = {
        uploadedBy: req.user.id,
        title: req.body.title,
        abstract: req.body.abstract,
        authors,
        keywords,
        year: parseInt(req.body.year) || new Date().getFullYear(),
        department: req.body.department,
        doi: req.body.doi,
        pdfUrl: req.file ? `/uploads/${req.file.filename}` : undefined
      };

      const paper = await PapersService.create(paperData);

      // System design dictates { success: true, paper } on this endpoint specifically
      res.status(201).json({ success: true, paper });
    } catch (error) {
      next(error);
    }
  }

  static async addCitation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const citedPaperId = req.params.id as string;
      const { citingPaperId } = req.body; // e.g. which paper is making the citation

      if (!citingPaperId) {
        return res.status(400).json({ message: 'citingPaperId is required' });
      }

      const paper = await PapersService.addCitation(citedPaperId, citingPaperId);
      res.status(200).json({ success: true, citationCount: paper.citationCount });
    } catch (error) {
      next(error);
    }
  }

  static async addComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const paperId = req.params.id as string;
      const { content, parentCommentId } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: 'Content is required to post a comment' });
      }

      const rawComment = await PapersService.addComment({
        paperId,
        userId: req.user.id,
        content: content.trim(),
        parentCommentId
      });

      // Securely grab name directly from DB to satisfy TS and guarantee accuracy
      const dbUser = await prisma.user.findUnique({ where: { id: req.user.id } });

      // The frontend expects authorName to instantly persist without forcing a page refresh
      const resolvedComment = {
        id: rawComment.id,
        paperId: rawComment.paperId,
        userId: rawComment.userId,
        authorName: dbUser?.name || "Unknown User", 
        content: rawComment.content,
        createdAt: rawComment.createdAt,
        replies: []
      };

      res.status(201).json({ success: true, comment: resolvedComment });
    } catch (error) {
      next(error);
    }
  }
}
