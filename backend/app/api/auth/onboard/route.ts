import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../../lib/prisma';

/**
 * @swagger
 * /api/auth/onboard:
 *   post:
 *     summary: Complete user onboarding
 *     description: Update user profile information and mark as onboarded
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's display name
 *               age:
 *                 type: integer
 *                 minimum: 13
 *                 maximum: 120
 *                 description: User's age
 *               gender:
 *                 type: string
 *                 enum: [male, female, other, prefer-not-to-say]
 *                 description: User's gender
 *               alphaLevel:
 *                 type: string
 *                 description: User's preferred alpha level
 *               notifications:
 *                 type: boolean
 *                 description: Whether to enable notifications
 *     responses:
 *       200:
 *         description: Onboarding completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 onboarded:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
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
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

    // accept token from cookie or Authorization header
    const cookie = req.headers.get('cookie') ?? '';
    const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('session='));
    let token = match ? match.split('=')[1] : null;
    if (!token) {
      const auth = req.headers.get('authorization') ?? '';
      if (auth.startsWith('Bearer ')) token = auth.slice('Bearer '.length);
    }

    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    let payload: any;
    try {
      payload = jwt.verify(token, jwtSecret) as any;
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { name, age, gender, alphaLevel, notifications } = body;

    // Basic server-side validation
    const data: any = {};
    if (typeof name === 'string') data.name = name;
    if (typeof age === 'number') data.age = age;
    if (typeof gender === 'string') data.gender = gender;
    if (typeof alphaLevel === 'string') data.alphaLevel = alphaLevel;
    if (typeof notifications === 'boolean') data.notifications = notifications;
    data.onboarded = true;

    await prisma.user.update({ where: { id: payload.userId }, data });

    // Re-fetch the user selecting the onboarding fields to ensure the returned
    // object includes the newly added properties (TypeScript will infer the
    // correct shape).
    // Use a non-select fetch and cast to any to avoid strict TS mismatch while
    // the generated client types update; the DB row will include the
    // onboarding fields we just wrote.
    const updated = (await prisma.user.findUnique({ where: { id: payload.userId } })) as any;

    if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ user: updated, onboarded: updated.onboarded });
  } catch (err) {
    console.error('onboard route error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
