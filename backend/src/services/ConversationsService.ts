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

    return convs.map((c: any) => {
      const lastMessage = c.messages.length > 0 ? c.messages[0] : null;
      // Computing unread could require an index on Messages.isRead and recipientId == userId
      // Mocking unreadCount as 0 for simplicity if no true read tracking per message is deeply implemented
      return {
        id: c.id,
        participants: [c.userA, c.userB],
        lastMessage: lastMessage ? lastMessage.text : '',
        updatedAt: c.updatedAt,
        unreadCount: lastMessage && !lastMessage.isRead && lastMessage.recipientId === userId ? 1 : 0
      };
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

  static async getMessages(conversationId: string) {
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
