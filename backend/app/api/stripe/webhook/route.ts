/**
 * Six Seven API - Stripe Webhook Endpoints
 *
 * IMPORTANT: When modifying this file, remember to:
 * 1. Update the JSDoc swagger comments above each endpoint
 * 2. Run `npm run generate-swagger` to update documentation
 * 3. Test changes in Swagger UI at /api/docs
 *
 * See API_WORKFLOW.md for complete development guidelines.
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * @swagger
 * /api/stripe/webhook:
 *   post:
 *     summary: Stripe webhook handler
 *     description: Handle Stripe webhook events for subscription management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Raw Stripe webhook payload
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid webhook signature or payload
 *       500:
 *         description: Server error processing webhook
 *     security: []  # No authentication required for webhooks
 */
export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planType = session.metadata?.planType;

  if (!userId) {
    console.error('No userId in session metadata');
    return;
  }

  const subscriptionId = session.subscription as string;

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const subData = subscription as any;
  
  // Get period end from either top-level or from subscription items
  let periodEnd = subData.current_period_end;
  if (!periodEnd && subData.items?.data?.[0]?.current_period_end) {
    periodEnd = subData.items.data[0].current_period_end;
  }
  
  const periodEndDate = periodEnd ? new Date(periodEnd * 1000) : null;

  console.log('Checkout completed - Subscription details:', {
    subscriptionId,
    status: subscription.status,
    current_period_end: periodEnd,
    current_period_end_date: periodEndDate,
    userId,
    planType,
  });

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      subscribed: true,
      subscriptionPlan: planType || 'monthly',
      stripeSubscriptionId: subscriptionId,
      subscriptionStatus: subscription.status,
      subscriptionEndsAt: periodEndDate,
    },
  });

  console.log(`Subscription activated for user ${userId}, ends at: ${updatedUser.subscriptionEndsAt}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const user = await prisma.user.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!user) {
    console.error('User not found for subscription:', subscription.id);
    return;
  }

  const subData = subscription as any;
  let periodEnd = subData.current_period_end;
  if (!periodEnd && subData.items?.data?.[0]?.current_period_end) {
    periodEnd = subData.items.data[0].current_period_end;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscribed: subscription.status === 'active',
      subscriptionStatus: subscription.status,
      subscriptionEndsAt: periodEnd ? new Date(periodEnd * 1000) : null,
    },
  });

  console.log(`Subscription updated for user ${user.id}: ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const user = await prisma.user.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!user) {
    console.error('User not found for subscription:', subscription.id);
    return;
  }

  const subData = subscription as any;
  let periodEnd = subData.current_period_end;
  if (!periodEnd && subData.items?.data?.[0]?.current_period_end) {
    periodEnd = subData.items.data[0].current_period_end;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscribed: false,
      subscriptionStatus: 'canceled',
      subscriptionEndsAt: periodEnd ? new Date(periodEnd * 1000) : null,
    },
  });

  console.log(`Subscription canceled for user ${user.id}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;
  
  if (!subscriptionId) return;

  const user = await prisma.user.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!user) {
    console.error('User not found for subscription:', subscriptionId);
    return;
  }

  // Get updated subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const subData = subscription as any;
  let periodEnd = subData.current_period_end;
  if (!periodEnd && subData.items?.data?.[0]?.current_period_end) {
    periodEnd = subData.items.data[0].current_period_end;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscribed: true,
      subscriptionStatus: 'active',
      subscriptionEndsAt: periodEnd ? new Date(periodEnd * 1000) : null,
    },
  });

  console.log(`Payment succeeded for user ${user.id}, subscription extended to ${periodEnd ? new Date(periodEnd * 1000) : 'unknown'}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;
  
  if (!subscriptionId) return;

  const user = await prisma.user.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!user) {
    console.error('User not found for subscription:', subscriptionId);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'past_due',
    },
  });

  console.log(`Payment failed for user ${user.id}`);
}
