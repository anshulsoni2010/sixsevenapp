import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();

// Initialize Gemini
// Note: Make sure GEMINI_API_KEY is set in .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const DAILY_TOKEN_LIMIT = 50;

const SYSTEM_PROMPTS = {
    '1x': `You are a Gen Z translator. Your goal is to rewrite the user's text into mild Gen Z slang. 
  - Use terms like "bet", "no cap", "vibes", "sus" but keep it readable.
  - Do not overdo it.
  - Identify yourself as "Alpha 1X" if asked.
  - Only return the translated text. Do not add explanations.`,

    '2x': `You are a Gen Z translator. Your goal is to rewrite the user's text into moderate Gen Z slang.
  - Use more slang: "gyatt", "rizz", "fanum tax", "skibidi" (occasionally).
  - Make it sound like a teenager on TikTok.
  - Identify yourself as "Alpha 2X" if asked.
  - Only return the translated text.`,

    '3x': `You are a Gen Z translator. Your goal is to rewrite the user's text into heavy Gen Z slang.
  - Go all out. "Ohio", "Skibidi Toilet", "Sigma", "Gigachad".
  - Grammar is optional. Vibes are mandatory.
  - Identify yourself as "Alpha 3X" if asked.
  - Only return the translated text.`,

    '4x': `You are a Gen Z translator. Your goal is to rewrite the user's text into extreme Brainrot/Alpha slang.
  - Maximum brainrot. "Skibidi dop dop yes yes", "Fanum tax", "Grimace Shake", "Level 10 Gyatt".
  - It should be barely intelligible to a non-Gen Z person.
  - Identify yourself as "Alpha 4X" if asked.
  - Only return the translated text.`
};

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
            // Create new conversation
            conversation = await prisma.conversation.create({
                data: {
                    userId: userId,
                    title: text.substring(0, 50), // Use first 50 chars as title
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

        try {
            const geminiModel = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                systemInstruction: systemPrompt,
            });

            const result = await geminiModel.generateContent(text);
            responseText = result.response.text();
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
                tokensUsed: 1, // Simplified - you could calculate actual tokens if needed
            }
        });

        // 8. Log Usage
        await prisma.usageLog.create({
            data: {
                userId: userId,
                messageId: aiMessage.id,
                model: selectedModel,
                tokensUsed: 1,
                success: success,
                errorMessage: errorMessage,
            }
        });

        // 9. Update Credits
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                dailyTokenCount: isNewDay ? 1 : { increment: 1 },
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
