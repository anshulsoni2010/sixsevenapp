import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../../lib/prisma';

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     description: Get the current authenticated user from session cookie
 *     responses:
 *       200:
 *         description: User information retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     name:
 *                       type: string
 *                     picture:
 *                       type: string
 *                       format: uri
 *                 onboarded:
 *                   type: boolean
 *                   description: Whether the user has completed onboarding
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get('cookie') ?? '';
    const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('session='));
    if (!match) return NextResponse.json({ user: null }, { status: 200 });

    const token = match.split('=')[1];
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

    let payload: any;
    try {
      payload = jwt.verify(token, jwtSecret) as any;
    } catch (e) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return NextResponse.json({ user: null }, { status: 200 });

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, picture: user.picture }, onboarded: user.onboarded });
  } catch (err) {
    console.error('me route error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
