import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

/**
 * @swagger
 * /api/stripe/create-portal-session:
 *   post:
 *     summary: Create Stripe customer portal session
 *     description: Create a Stripe customer portal session for subscription management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Portal session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: Stripe customer portal URL
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found or no active subscription
 *       500:
 *         description: Server error
 */
export async function POST(req: Request) {
  try {
    // Get user from JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const decoded: any = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    // Create Stripe Customer Portal Session
    const APP_REDIRECT_URL = process.env.APP_REDIRECT_URL || 'exp://localhost:8081';
    
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${APP_REDIRECT_URL}?from=portal`,
    });

    return NextResponse.json({ 
      url: session.url,
    });

  } catch (error) {
    console.error('Create portal session error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
