import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/usage:
 *   get:
 *     summary: Get usage statistics
 *     description: Retrieve usage statistics for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering usage logs (ISO date string)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering usage logs (ISO date string)
 *     responses:
 *       200:
 *         description: Usage statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTokens:
 *                   type: integer
 *                   description: Total tokens used
 *                 messageCount:
 *                   type: integer
 *                   description: Total number of messages
 *                 successCount:
 *                   type: integer
 *                   description: Number of successful requests
 *                 successRate:
 *                   type: number
 *                   format: float
 *                   description: Success rate as percentage
 *                 modelBreakdown:
 *                   type: object
 *                   description: Usage breakdown by model
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       count:
 *                         type: integer
 *                         description: Number of requests for this model
 *                       tokens:
 *                         type: integer
 *                         description: Tokens used for this model
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

        // Parse query params for date filtering
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const whereClause: any = { userId };

        if (startDate || endDate) {
            whereClause.createdAt = {};
            if (startDate) {
                whereClause.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
                whereClause.createdAt.lte = new Date(endDate);
            }
        }

        // Get usage logs
        const usageLogs = await prisma.usageLog.findMany({
            where: whereClause,
            select: {
                tokensUsed: true,
                model: true,
                success: true,
                createdAt: true,
            }
        });

        // Calculate statistics
        const totalTokens = usageLogs.reduce((sum, log) => sum + log.tokensUsed, 0);
        const messageCount = usageLogs.length;
        const successCount = usageLogs.filter(log => log.success).length;

        // Model breakdown
        const modelBreakdown: Record<string, { count: number; tokens: number }> = {};
        usageLogs.forEach(log => {
            if (!modelBreakdown[log.model]) {
                modelBreakdown[log.model] = { count: 0, tokens: 0 };
            }
            modelBreakdown[log.model].count++;
            modelBreakdown[log.model].tokens += log.tokensUsed;
        });

        return NextResponse.json({
            totalTokens,
            messageCount,
            successCount,
            successRate: messageCount > 0 ? (successCount / messageCount) * 100 : 0,
            modelBreakdown,
        });

    } catch (error) {
        console.error('Usage API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
