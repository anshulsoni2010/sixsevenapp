import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import jwt from 'jsonwebtoken';

/**
 * @swagger
 * /api/auth/email/verify:
 *   post:
 *     summary: Verify email code
 *     description: Verify the email verification code and authenticate the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *               token:
 *                 type: string
 *                 description: 6-digit verification code
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 onboarded:
 *                   type: boolean
 *                   description: Whether the user has completed onboarding
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     name:
 *                       type: string
 *                       nullable: true
 *                     picture:
 *                       type: string
 *                       format: uri
 *                       nullable: true
 *       400:
 *         description: Invalid or expired code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Verification failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, token } = body;

        if (!email || !token) {
            return NextResponse.json({ error: 'Email and token are required' }, { status: 400 });
        }

        // Verify token
        const verificationToken = await prisma.verificationToken.findFirst({
            where: {
                identifier: email,
                token,
                expires: {
                    gt: new Date(),
                },
            },
        });

        if (!verificationToken) {
            return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
        }

        // Delete used token
        await prisma.verificationToken.deleteMany({
            where: {
                identifier: email,
                token,
            },
        });

        // Find or create user
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    provider: 'email',
                    onboarded: false,
                },
            });
        }

        // Generate JWT
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
        }

        const jwtToken = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, { expiresIn: '30d' });

        return NextResponse.json({
            token: jwtToken,
            onboarded: user.onboarded,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                picture: user.picture,
            },
        });
    } catch (error) {
        console.error('Error verifying email:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
