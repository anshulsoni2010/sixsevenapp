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
 * /api/stripe/sync-subscription:
 *   post:
 *     summary: Sync subscription status
 *     description: Sync the user's subscription status with Stripe
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription synced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 subscriptionEndsAt:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                   description: Subscription end date
 *                 status:
 *                   type: string
 *                   description: Subscription status from Stripe
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: No subscription found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Failed to sync subscription
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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

    if (!user || !user.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    // Fetch subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    const subData = subscription as any;
    
    // Get period end from either top-level or from subscription items
    let periodEnd = subData.current_period_end;
    if (!periodEnd && subData.items?.data?.[0]?.current_period_end) {
      periodEnd = subData.items.data[0].current_period_end;
    }
    
    const periodEndDate = periodEnd ? new Date(periodEnd * 1000) : null;
    
    console.log('Subscription details:', {
      id: subscription.id,
      status: subscription.status,
      current_period_end: periodEnd,
      current_period_end_date: periodEndDate,
    });

    console.log('Stripe subscription data:', {
      id: subscription.id,
      status: subscription.status,
      current_period_end: periodEnd,
      current_period_end_date: periodEndDate,
    });

    // Update user with latest subscription data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        subscribed: subscription.status === 'active',
        subscriptionStatus: subscription.status,
        subscriptionEndsAt: periodEndDate,
      },
    });

    console.log('Updated user with subscriptionEndsAt:', updatedUser.subscriptionEndsAt);

    return NextResponse.json({ 
      success: true,
      subscriptionEndsAt: periodEndDate,
      status: subscription.status,
    });

  } catch (error) {
    console.error('Sync subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to sync subscription' },
      { status: 500 }
    );
  }
}
