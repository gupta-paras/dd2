import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminCredentials,
  createSessionToken,
  SESSION_COOKIE_NAME,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const isValid = verifyAdminCredentials(username, password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID or password' },
        { status: 401 }
      );
    }

    const token = createSessionToken(username);

    const response = NextResponse.json({
      success: true,
      user: username,
      message: 'Authenticated successfully',
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error during login';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
