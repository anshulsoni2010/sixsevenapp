import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

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

    // Get request body
    const body = await req.json();
    const { priceId, planType } = body;

    if (!priceId || !planType) {
      return NextResponse.json({ error: 'Missing priceId or planType' }, { status: 400 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create Stripe Checkout Session
    const APP_REDIRECT_URL = process.env.APP_REDIRECT_URL || 'exp://localhost:8081';
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${APP_REDIRECT_URL}?subscription=success`,
      cancel_url: `${APP_REDIRECT_URL}?subscription=canceled`,
      metadata: {
        userId: user.id,
        planType: planType,
      },
    });

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id,
    });

  } catch (error) {
    console.error('Create checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
