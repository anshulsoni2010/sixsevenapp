import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

export async function GET(req: Request) {
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

    // Get user subscription status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        subscribed: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
        stripeSubscriptionId: true,
        onboarded: true,
        age: true,
        gender: true,
        alphaLevel: true,
        notifications: true,
        createdAt: true,
        provider: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('User subscription data:', {
      subscribed: user.subscribed,
      plan: user.subscriptionPlan,
      status: user.subscriptionStatus,
      endsAt: user.subscriptionEndsAt,
      stripeSubId: user.stripeSubscriptionId,
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      subscribed: user.subscribed,
      plan: user.subscriptionPlan,
      status: user.subscriptionStatus,
      endsAt: user.subscriptionEndsAt,
      onboarded: user.onboarded,
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
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

    // Get user data including Stripe subscription ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        stripeSubscriptionId: true,
        subscribed: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Cancel Stripe subscription if it exists
    if (user.stripeSubscriptionId && user.subscribed) {
      try {
        await stripe.subscriptions.cancel(user.stripeSubscriptionId);
        console.log('Stripe subscription cancelled:', user.stripeSubscriptionId);
      } catch (stripeError) {
        console.error('Error cancelling Stripe subscription:', stripeError);
        // Continue with user deletion even if Stripe cancellation fails
      }
    }

    // Delete the user from database
    await prisma.user.delete({
      where: { id: userId },
    });

    console.log('User account deleted:', userId);

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
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

    const body = await req.json();
    const { name, age, gender, alphaLevel, notifications } = body;

    // Validate input
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }
    if (age !== undefined && (typeof age !== 'number' || age < 13 || age > 120)) {
      return NextResponse.json({ error: 'Invalid age' }, { status: 400 });
    }
    if (gender !== undefined && !['male', 'female', 'other', 'prefer-not-to-say'].includes(gender)) {
      return NextResponse.json({ error: 'Invalid gender' }, { status: 400 });
    }
    if (alphaLevel !== undefined && typeof alphaLevel !== 'string') {
      return NextResponse.json({ error: 'Invalid alpha level' }, { status: 400 });
    }
    if (notifications !== undefined && typeof notifications !== 'boolean') {
      return NextResponse.json({ error: 'Invalid notifications setting' }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (age !== undefined) updateData.age = age;
    if (gender !== undefined) updateData.gender = gender;
    if (alphaLevel !== undefined) updateData.alphaLevel = alphaLevel;
    if (notifications !== undefined) updateData.notifications = notifications;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        subscribed: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
        onboarded: true,
        age: true,
        gender: true,
        alphaLevel: true,
        notifications: true,
        createdAt: true,
        provider: true,
      },
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
