import prisma from '../lib/prisma';

export class ConversationsService {
  static async getConversationsForUser(userId: string) {
    const convs = await prisma.conversation.findMany({
      where: {
        OR: [{ participantA: userId }, { participantB: userId }]
      },
      include: {
        userA: { select: { id: true, name: true } },
        userB: { select: { id: true, name: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return Promise.all(convs.map(async (c: any) => {
      const lastMessage = c.messages.length > 0 ? c.messages[0] : null;
      
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: c.id,
          recipientId: userId,
          isRead: false
        }
      });

      return {
        id: c.id,
        participants: [c.userA, c.userB],
        lastMessage: lastMessage ? lastMessage.text : '',
        updatedAt: c.updatedAt,
        unreadCount: unreadCount
      };
    }));
  }

  static async getGlobalUnreadCount(userId: string) {
    return prisma.message.count({
      where: {
        recipientId: userId,
        isRead: false
      }
    });
  }

  static async startOrGetConversation(userId1: string, userId2: string) {
    // Determine strict ordering to match DB unique constraints if any
    // Our DB allows A and B to be any, but Unique handles combinations if we order them consistently
    let [a, b] = [userId1, userId2].sort();

    let conv = await prisma.conversation.findUnique({
      where: {
        participantA_participantB: { participantA: a, participantB: b }
      },
      include: {
        userA: { select: { id: true, name: true } },
        userB: { select: { id: true, name: true } }
      }
    });

    if (!conv) {
      conv = await prisma.conversation.create({
        data: { participantA: a, participantB: b },
        include: {
          userA: { select: { id: true, name: true } },
          userB: { select: { id: true, name: true } }
        }
      });
    }

    return {
      id: conv.id,
      participants: [conv.userA, conv.userB]
    };
  }

  static async getMessages(conversationId: string, userId: string) {
    // When a user successfully polls messages for an active conversation, all Unread messages bound natively to them are considered Read.
    await prisma.message.updateMany({
      where: {
        conversationId,
        recipientId: userId,
        isRead: false
      },
      data: { isRead: true }
    });

    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    });
  }

  static async sendMessage(conversationId: string, senderId: string, text: string) {
    const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv) throw { statusCode: 404, message: 'Conversation not found' };

    const recipientId = conv.participantA === senderId ? conv.participantB : conv.participantA;

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        recipientId,
        text
      }
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return message;
  }
}
