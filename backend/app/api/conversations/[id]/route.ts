import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
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

        const { id: conversationId } = await context.params;

        // Get conversation with all messages
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userId: userId, // Ensure user owns this conversation
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                }
            }
        });

        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        return NextResponse.json({ conversation });

    } catch (error) {
        console.error('Conversation Detail API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
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

        const { id: conversationId } = await context.params;

        // Verify ownership before deleting
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userId: userId,
            }
        });

        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        // Delete conversation (messages will cascade delete)
        await prisma.conversation.delete({
            where: { id: conversationId }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Delete Conversation API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
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

        const { id: conversationId } = await context.params;
        const body = await req.json();
        const { title, isArchived } = body;

        // Verify ownership
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userId: userId,
            }
        });

        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        // Update
        const updatedConversation = await prisma.conversation.update({
            where: { id: conversationId },
            data: {
                ...(title !== undefined && { title }),
                ...(isArchived !== undefined && { isArchived }),
            }
        });

        return NextResponse.json({ conversation: updatedConversation });

    } catch (error) {
        console.error('Update Conversation API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
