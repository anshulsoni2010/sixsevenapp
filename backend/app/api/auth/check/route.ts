import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

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
