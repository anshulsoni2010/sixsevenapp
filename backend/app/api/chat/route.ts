import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPTS } from '@/lib/prompts';

const prisma = new PrismaClient();

// Initialize Gemini
// Note: Make sure GEMINI_API_KEY is set in .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const DAILY_TOKEN_LIMIT = 20000;

export async function POST(req: Request) {
    try {
        // 1. Authentication
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

        // 2. Get User & Check Credits
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                dailyTokenCount: true,
                lastTokenUsageDate: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const now = new Date();
        const lastUsage = new Date(user.lastTokenUsageDate);

        // Check if it's a new day (simple check: different date string)
        const isNewDay = now.toDateString() !== lastUsage.toDateString();

        let currentCount = isNewDay ? 0 : user.dailyTokenCount;

        if (currentCount >= DAILY_TOKEN_LIMIT) {
            return NextResponse.json({
                error: 'Daily limit reached',
                credits: 0,
                maxCredits: DAILY_TOKEN_LIMIT
            }, { status: 403 });
        }

        // 3. Process Request
        const body = await req.json();
        const { text, model, conversationId } = body;

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const selectedModel = (model as string || '1x').toLowerCase();
        const systemPrompt = SYSTEM_PROMPTS[selectedModel as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS['1x'];

        // 4. Get or Create Conversation
        let conversation;
        if (conversationId) {
            // Verify the conversation belongs to this user
            conversation = await prisma.conversation.findFirst({
                where: {
                    id: conversationId,
                    userId: userId,
                }
            });

            if (!conversation) {
                return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
            }
        } else {
            // Generate title using AI
            let title = text.substring(0, 50);
            try {
                const titleModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                const titleResult = await titleModel.generateContent(`Generate a very short, concise title (max 4-5 words) for a conversation that starts with this message: "${text}". Return ONLY the title, no quotes.`);
                const aiTitle = titleResult.response.text().trim().replace(/^"|"$/g, '');
                if (aiTitle) title = aiTitle;
            } catch (e) {
                console.error("Failed to generate title:", e);
            }

            // Create new conversation
            conversation = await prisma.conversation.create({
                data: {
                    userId: userId,
                    title: title,
                }
            });
        }

        // 5. Save User Message
        const userMessage = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                role: 'user',
                content: text,
                model: selectedModel,
            }
        });

        // 6. Call Gemini
        let responseText: string;
        let success = true;
        let errorMessage: string | undefined;
        let tokensUsed = 1; // Default fallback

        try {
            const geminiModel = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                systemInstruction: systemPrompt,
            });

            const result = await geminiModel.generateContent(text);
            responseText = result.response.text();

            // Get actual token usage from Gemini
            tokensUsed = result.response.usageMetadata?.totalTokenCount || 1;
        } catch (error: any) {
            success = false;
            errorMessage = error.message || 'Gemini API error';
            responseText = 'Sorry, I encountered an error processing your request.';

            // Log the error but continue to save the failed attempt
            console.error('Gemini API Error:', error);
        }

        // 7. Save AI Response Message
        const aiMessage = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                role: 'assistant',
                content: responseText,
                model: selectedModel,
                tokensUsed: tokensUsed,
            }
        });

        // 8. Log Usage
        await prisma.usageLog.create({
            data: {
                userId: userId,
                messageId: aiMessage.id,
                model: selectedModel,
                tokensUsed: tokensUsed,
                success: success,
                errorMessage: errorMessage,
            }
        });

        // 9. Update Credits
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                dailyTokenCount: isNewDay ? tokensUsed : { increment: tokensUsed },
                lastTokenUsageDate: now,
            },
            select: {
                dailyTokenCount: true
            }
        });

        return NextResponse.json({
            text: responseText,
            credits: DAILY_TOKEN_LIMIT - updatedUser.dailyTokenCount,
            maxCredits: DAILY_TOKEN_LIMIT,
            conversationId: conversation.id,
            messageId: aiMessage.id,
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
