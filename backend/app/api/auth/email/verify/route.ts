import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import jwt from 'jsonwebtoken';

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
