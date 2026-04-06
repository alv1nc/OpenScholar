import prisma from '../lib/prisma';

export class PapersService {
  static async getRecent() {
    return prisma.paper.findMany({
      take: 20,
      orderBy: { year: 'desc' }
    });
  }

  static async search(query: string) {
    return prisma.paper.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { keywords: { has: query } } // basic GIN-friendly search
        ]
      },
      orderBy: { citationCount: 'desc' }
    });
  }

  static async getById(id: string) {
    const paper = await prisma.paper.findUnique({
      where: { id },
    });
    
    if (!paper) {
      throw { statusCode: 404, message: 'Paper not found' };
    }

    // Natively fetch top-level comments and nest their replies
    const commentsRaw = await prisma.comment.findMany({
      where: { paperId: id, isDeleted: false },
      include: {
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    const commentMap = new Map();
    const rootComments: any[] = [];

    commentsRaw.forEach((c: any) => {
      const formatted = {
        id: c.id,
        paperId: c.paperId,
        userId: c.userId,
        authorName: c.user.name,
        content: c.content,
        createdAt: c.createdAt,
        replies: []
      };
      commentMap.set(c.id, formatted);
    });

    commentsRaw.forEach((c: any) => {
      if (c.parentCommentId) {
        const parent = commentMap.get(c.parentCommentId);
        if (parent) {
          parent.replies.push(commentMap.get(c.id));
        }
      } else {
        rootComments.push(commentMap.get(c.id));
      }
    });

    return { paper, comments: rootComments };
  }

  static async create(data: {
    uploadedBy: string;
    title: string;
    abstract: string;
    authors: string[];
    keywords: string[];
    year: number;
    department?: string;
    pdfUrl?: string;
    doi?: string;
  }) {
    return prisma.paper.create({ data });
  }

  static async addCitation(citedPaperId: string, citingPaperId: string) {
    await prisma.citation.create({
      data: { citedPaperId, citingPaperId }
    });

    return prisma.paper.update({
      where: { id: citedPaperId },
      data: { citationCount: { increment: 1 } }
    });
  }

  static async addComment(data: {
    paperId: string;
    userId: string;
    content: string;
    parentCommentId?: string;
  }) {
    return prisma.comment.create({
      data: {
        paperId: data.paperId,
        userId: data.userId,
        content: data.content,
        parentCommentId: data.parentCommentId
      }
    });
  }
}
