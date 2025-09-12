import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Simple email normalization
    const normalizedEmail = email.trim().toLowerCase();

    // Get database connection
    const db = getDatabase();

    try {
      // Check if user exists in users table
      const user = db.prepare(`
        SELECT email FROM users 
        WHERE email = ? 
        LIMIT 1
      `).get(normalizedEmail);

      return NextResponse.json({
        exists: !!user,
        email: normalizedEmail
      });

    } catch (dbError) {
      console.error('Database error checking user:', dbError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error checking user existence:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}