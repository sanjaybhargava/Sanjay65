import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, generateId } from '@/lib/database';
import sgMail from '@sendgrid/mail';

async function sendWelcomeEmail(email: string) {
  try {
    // Initialize SendGrid only when actually sending emails
    if (!process.env.SENDGRID_API_KEY) {
      console.log('SENDGRID_API_KEY not configured - skipping email send');
      return;
    }
    
    console.log('Attempting to send welcome email to:', email);
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const result = await sgMail.send({
      from: 'sanjay@tiseed.com',
      to: email,
      subject: 'Finally, financial advice that reduces anxiety',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
          <p>Hi there,</p>
          
          <p>Thank you for joining the beta.</p>
          
          <p>Here's what makes this different: no overwhelming portfolios, no 47-step plans, no upsells. Just practical education with actions you can take that reduce financial anxiety.</p>
          
          <p>You have 9 lessons and 2 calculators waiting, designed for different life stages:</p>
          
          <p><strong>IF YOU'RE STARTING OUT:</strong><br>
          Begin with your Save Number calculator → shows you exactly how much you need to stop worrying about money forever.</p>
          
          <p><strong>IF YOU'RE ESTABLISHED:</strong><br>
          Start with your Spend Number calculator → reveals how much you can spend guilt-free on whatever makes you happy.</p>
          
          <p>Both take 3 minutes. Pick whichever fits your situation.</p>
          
          <p>After that, you'll find lessons tailored to where you are in life.</p>
          
          <p>Play with the lessons and calculators. The more you use them the clearer they will become.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://web-production-b4f4d.up.railway.app/dashboard" style="display: inline-block; background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px;">📊 Go to Dashboard</a>
          </div>
          
          <p>Two asks:</p>
          <p>1. If you find this useful, share it with others:</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="https://web-production-b4f4d.up.railway.app" style="display: inline-block; background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px;">🚀 Try Prototype</a>
          </div>
          
          <p>2. Share feedback: what you like, don't like, what's confusing - <a href="mailto:sanjay@tiseed.com">sanjay@tiseed.com</a></p>
          
          <p>Thank you for testing this!</p>
          
          <p>Best,<br>
          Sanjay</p>
        </div>
      `
    });
    console.log('Welcome email sent successfully to:', email);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

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
        // Send welcome email for new beta user
        sendWelcomeEmail(normalizedEmail).catch(err => 
          console.error('Welcome email failed for', normalizedEmail, err)
        );
        
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