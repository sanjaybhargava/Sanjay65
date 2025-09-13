import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, generateId } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, secret } = body;

    // Simple secret key protection (you can change this)
    if (secret !== 'beta-admin-2024') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const db = getDatabase();

    try {
      // Check if user already exists
      const existing = db.prepare('SELECT email FROM users WHERE email = ?').get(normalizedEmail);
      
      if (existing) {
        return NextResponse.json({
          message: 'User already exists and has beta access',
          email: normalizedEmail,
          alreadyExists: true
        });
      }

      // Add new beta user
      const userId = generateId();
      const result = db.prepare(`
        INSERT INTO users (id, email, first_name, last_name, created_at, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(userId, normalizedEmail, 'Beta', 'User');
      
      if (result.changes > 0) {
        // Get total count
        const count = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
        
        return NextResponse.json({
          message: 'Successfully added beta user',
          email: normalizedEmail,
          totalUsers: count
        });
      } else {
        return NextResponse.json(
          { error: 'Failed to add user' },
          { status: 500 }
        );
      }

    } catch (dbError) {
      console.error('Database error adding beta user:', dbError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error adding beta user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}