import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPTS } from '@/lib/prompts';
import { uploadImageToImageKit } from '@/lib/imagekit';

const prisma = new PrismaClient();

// Initialize Gemini
// Note: Make sure GEMINI_API_KEY is set in .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const DAILY_TOKEN_LIMIT = 50000;

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
        const { text, image, model, conversationId } = body;

        if (!text && !image) {
            return NextResponse.json({ error: 'Text or image is required' }, { status: 400 });
        }

        const selectedModel = (model as string || '1x').toLowerCase();
        let systemPrompt = SYSTEM_PROMPTS[selectedModel as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS['1x'];

        // If image is present, add context that this is a chat screenshot
        if (image) {
            systemPrompt += `\n\n<ocr_context>\nThe user has uploaded a screenshot of a chat conversation. The text you receive is the extracted text from this image. Treat it as a conversation context and translate the messages found within it to the requested Gen Alpha slang style. If the text seems disjointed, it's likely due to OCR imperfections; do your best to reconstruct the flow and translate the core meaning.\n</ocr_context>`;
        }

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
            let title = (text || "Image Chat").substring(0, 50);
            if (text) {
                try {
                    const titleModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                    const titleResult = await titleModel.generateContent(`Generate a very short, concise title (max 4-5 words) for a conversation that starts with this message: "${text}". Return ONLY the title, no quotes.`);
                    const aiTitle = titleResult.response.text().trim().replace(/^"|"$/g, '');
                    if (aiTitle) title = aiTitle;
                } catch (e) {
                    console.error("Failed to generate title:", e);
                }
            }

            // Create new conversation
            conversation = await prisma.conversation.create({
                data: {
                    userId: userId,
                    title: title,
                }
            });
        }

        // 5. Upload Image to ImageKit (if present)
        let imageUrl: string | null = null;
        if (image) {
            const fileName = `chat-${userId}-${Date.now()}.jpg`;
            imageUrl = await uploadImageToImageKit(image, fileName);
            if (!imageUrl) {
                console.error('Failed to upload image to ImageKit');
            }
        }

        // 6. Save User Message
        const userMessage = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                role: 'user',
                content: text || '[Image]',
                image: imageUrl,
                model: selectedModel,
            }
        });

        // 7. OCR Processing
        let extractedText = text;

        if (image) {
            try {
                console.log('Starting OCR processing...');
                // Call OCR.space API
                const formData = new FormData();
                const base64Image = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`;

                formData.append('base64Image', base64Image);
                formData.append('apikey', process.env.OCR_SPACE_API_KEY || 'helloworld');
                formData.append('language', 'eng');
                formData.append('isOverlayRequired', 'false');

                const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
                    method: 'POST',
                    body: formData,
                });

                if (!ocrResponse.ok) {
                    console.error('OCR API returned error status:', ocrResponse.status);
                    const errorText = await ocrResponse.text();
                    console.error('OCR Error response:', errorText);
                } else {
                    const ocrData = await ocrResponse.json();
                    console.log('OCR Response:', JSON.stringify(ocrData, null, 2));

                    if (ocrData.OCRExitCode === 1 && ocrData.ParsedResults?.length > 0) {
                        const parsedText = ocrData.ParsedResults[0].ParsedText;
                        if (parsedText && parsedText.trim()) {
                            extractedText = parsedText.trim();
                            console.log('OCR Success! Extracted text:', extractedText.substring(0, 100) + '...');
                        } else {
                            console.warn('OCR: No text found in image');
                            extractedText = text || 'No text detected in image';
                        }
                    } else {
                        console.error('OCR Error - Exit Code:', ocrData.OCRExitCode);
                        console.error('OCR Error Message:', ocrData.ErrorMessage);
                        console.error('OCR Error Details:', ocrData.ErrorDetails);
                        extractedText = text || 'Failed to extract text from image';
                    }
                }
            } catch (ocrError) {
                console.error('OCR Request Failed:', ocrError);
                extractedText = text || 'Error processing image';
            }
        }

        // 8. Call Gemini
        let responseText: string;
        let success = true;
        let errorMessage: string | undefined;
        let tokensUsed = 1;

        if (!extractedText) {
            responseText = "I couldn't find any text in that image to translate. Try sending an image with clearer text! 📸";
        } else {
            try {
                const geminiModel = genAI.getGenerativeModel({
                    model: "gemini-2.0-flash-exp",
                    systemInstruction: systemPrompt,
                    generationConfig: {
                        temperature: 1.0,
                        topP: 0.95,
                        topK: 40,
                        maxOutputTokens: 500, // Limit output for faster responses
                    },
                });

                const result = await geminiModel.generateContent(extractedText);
                responseText = result.response.text();
                tokensUsed = result.response.usageMetadata?.totalTokenCount || 1;
            } catch (error: any) {
                success = false;
                errorMessage = error.message || 'Gemini API error';
                responseText = 'Sorry, I encountered an error processing your request.';
                console.error('Gemini API Error:', error);
            }
        }

        // 9. Save AI Response Message
        const aiMessage = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                role: 'assistant',
                content: responseText,
                model: selectedModel,
                tokensUsed: tokensUsed,
            }
        });

        // 10. Log Usage
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

        // 11. Update Credits
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
