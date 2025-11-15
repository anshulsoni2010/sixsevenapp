import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
