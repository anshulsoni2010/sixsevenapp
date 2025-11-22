import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

/**
 * @swagger
 * /api/auth/check:
 *   post:
 *     summary: Check user existence
 *     description: Check if a user exists by email and their onboarding status
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *     responses:
 *       200:
 *         description: User check completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *                   description: Whether the user exists
 *                 onboarded:
 *                   type: boolean
 *                   description: Whether the user has completed onboarding
 *       400:
 *         description: Missing email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    return NextResponse.json({ exists: !!user, onboarded: user ? user.onboarded : false });
  } catch (err) {
    console.error('check route error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
