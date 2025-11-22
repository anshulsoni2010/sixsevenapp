import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/conversations:
 *   get:
 *     summary: Get user conversations
 *     description: Retrieve all conversations for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Conversation ID
 *                       title:
 *                         type: string
 *                         description: Conversation title
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Creation timestamp
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Last update timestamp
 *                       messageCount:
 *                         type: integer
 *                         description: Number of messages in conversation
 *                       lastMessage:
 *                         type: string
 *                         description: Preview of the last message
 *                       isArchived:
 *                         type: boolean
 *                         description: Whether the conversation is archived
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function GET(req: Request) {
    try {
        // Authentication
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
        }

        let userId: string;
        try {
            const decoded: any = jwt.verify(token, jwtSecret);
            userId = decoded.userId;
        } catch (e) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Get all conversations for this user
        const conversations = await prisma.conversation.findMany({
            where: { userId },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1, // Get last message for preview
                },
                _count: {
                    select: { messages: true }
                }
            },
            orderBy: { updatedAt: 'desc' },
        });

        const formattedConversations = conversations.map(conv => ({
            id: conv.id,
            title: conv.title || 'Untitled Conversation',
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt,
            messageCount: conv._count.messages,
            lastMessage: conv.messages[0]?.content.substring(0, 100) || '',
            isArchived: conv.isArchived,
        }));

        return NextResponse.json({ conversations: formattedConversations });

    } catch (error) {
        console.error('Conversations API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
