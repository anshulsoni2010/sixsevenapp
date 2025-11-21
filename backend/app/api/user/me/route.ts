/**
 * Six Seven API - User Management Endpoints
 *
 * IMPORTANT: When modifying this file, remember to:
 * 1. Update the JSDoc swagger comments above each endpoint
 * 2. Run `npm run generate-swagger` to update documentation
 * 3. Test changes in Swagger UI at /api/docs
 *
 * See API_WORKFLOW.md for complete development guidelines.
 */

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

/**
 * @swagger
 * /api/user/me:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve the authenticated user's profile information including subscription details
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *                 picture:
 *                   type: string
 *                 subscribed:
 *                   type: boolean
 *                 subscriptionPlan:
 *                   type: string
 *                   enum: [monthly, yearly]
 *                 subscriptionStatus:
 *                   type: string
 *                 subscriptionEndsAt:
 *                   type: string
 *                   format: date-time
 *                 onboarded:
 *                   type: boolean
 *                 age:
 *                   type: integer
 *                 gender:
 *                   type: string
 *                   enum: [male, female, other, prefer-not-to-say]
 *                 alphaLevel:
 *                   type: string
 *                 notifications:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
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
        dailyTokenCount: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate user stats
    // 1. Count total messages sent by user
    const messageCount = await prisma.message.count({
      where: {
        conversation: {
          userId: userId,
        },
        role: 'user', // Only count user messages, not assistant responses
      },
    });

    // 2. Calculate streak days (consecutive days with activity)
    const usageLogs = await prisma.usageLog.findMany({
      where: { userId: userId },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    let streakDays = 0;
    if (usageLogs.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const uniqueDays = new Set<string>();
      usageLogs.forEach(log => {
        const logDate = new Date(log.createdAt);
        logDate.setHours(0, 0, 0, 0);
        uniqueDays.add(logDate.toISOString().split('T')[0]);
      });

      const sortedDays = Array.from(uniqueDays).sort().reverse();

      // Check if user was active today or yesterday
      const todayStr = today.toISOString().split('T')[0];
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (sortedDays[0] === todayStr || sortedDays[0] === yesterdayStr) {
        streakDays = 1;
        let currentDate = new Date(sortedDays[0]);

        for (let i = 1; i < sortedDays.length; i++) {
          const prevDate = new Date(currentDate);
          prevDate.setDate(prevDate.getDate() - 1);
          const prevDateStr = prevDate.toISOString().split('T')[0];

          if (sortedDays[i] === prevDateStr) {
            streakDays++;
            currentDate = prevDate;
          } else {
            break;
          }
        }
      }
    }

    // 3. Calculate alpha points (based on tokens used)
    const totalTokens = await prisma.usageLog.aggregate({
      where: { userId: userId },
      _sum: { tokensUsed: true },
    });
    const alphaPoints = Math.floor((totalTokens._sum.tokensUsed || 0) / 100); // 1 point per 100 tokens

    console.log('User subscription data:', {
      subscribed: user.subscribed,
      plan: user.subscriptionPlan,
      status: user.subscriptionStatus,
      endsAt: user.subscriptionEndsAt,
      stripeSubId: user.stripeSubscriptionId,
    });

    console.log('User stats:', {
      messages: messageCount,
      streakDays: streakDays,
      alphaPoints: alphaPoints,
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
      dailyTokenCount: user.dailyTokenCount,
      createdAt: user.createdAt,
      age: user.age,
      gender: user.gender,
      alphaLevel: user.alphaLevel,
      notifications: user.notifications,
      stats: {
        messagesTranslated: messageCount,
        daysActive: streakDays,
      },
      alphaPoints: alphaPoints,
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/user/me:
 *   delete:
 *     summary: Delete user account
 *     description: Permanently delete the authenticated user's account and all associated data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account deleted successfully"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/user/me:
 *   patch:
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information
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
 *                 minLength: 1
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
 *                 description: User's alpha level preference
 *               notifications:
 *                 type: boolean
 *                 description: Push notification preference
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *                 picture:
 *                   type: string
 *                 subscribed:
 *                   type: boolean
 *                 subscriptionPlan:
 *                   type: string
 *                 subscriptionStatus:
 *                   type: string
 *                 onboarded:
 *                   type: boolean
 *                 age:
 *                   type: integer
 *                 gender:
 *                   type: string
 *                 alphaLevel:
 *                   type: string
 *                 notifications:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
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
