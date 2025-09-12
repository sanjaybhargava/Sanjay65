import { NextRequest, NextResponse } from 'next/server';
import { isValidEmail, normalizeEmail } from '@/lib/cookies';
import { getDatabase } from '@/lib/database';
import sgMail from '@sendgrid/mail';

async function sendWaitlistConfirmation(email: string) {
  try {
    // Initialize SendGrid only when actually sending emails
    if (!process.env.SENDGRID_API_KEY) {
      console.log('SENDGRID_API_KEY not configured - skipping email send');
      return;
    }
    
    console.log('Attempting to send waitlist confirmation to:', email);
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const result = await sgMail.send({
      from: 'sanjay@tiseed.com',
      to: email,
      subject: "You're on the ZeroFinanx waitlist!",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
          <p>Hi there,</p>
          
          <p>Thanks for joining our waitlist! You'll be among the first to know when ZeroFinanx launches.</p>
          
          <p>We're working hard to bring you the same philosophy that made our beta special:</p>
          <ul>
            <li>No overwhelming portfolios or 47-step plans</li>
            <li>Just practical education that reduces financial anxiety</li>
            <li>Teaching you to be your own financial advisor</li>
          </ul>
          
          <p>Our paid service will include:</p>
          <ul>
            <li>Comprehensive lessons updated weekly</li>
            <li>Advanced calculators for complex scenarios</li>
            <li>US-focused financial guidance</li>
            <li>No ads, no upsells - just education</li>
          </ul>
          
          <p>We'll email you as soon as it's ready. Until then, thanks for your patience!</p>
          
          <p><strong>Help us spread the word:</strong> If you know others struggling with financial anxiety, please share our waitlist with them. The more people who join us, the stronger our community becomes.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3003/beta-closed" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold;">Share the Waitlist</a>
          </div>
          
          <p>All the Best,<br>
          Sanjay Bhargava<br>
          ZeroFinanx Team</p>
        </div>
      `,
      text: `Hi there,

Thanks for joining our waitlist! You'll be among the first to know when ZeroFinanx launches.

We're working hard to bring you the same philosophy that made our beta special:
- No overwhelming portfolios or 47-step plans
- Just practical education that reduces financial anxiety  
- Teaching you to be your own financial advisor

Our paid service will include:
- Comprehensive lessons updated weekly
- Advanced calculators for complex scenarios
- US-focused financial guidance
- No ads, no upsells - just education

We'll email you as soon as it's ready. Until then, thanks for your patience!

Help us spread the word: If you know others struggling with financial anxiety, please share our waitlist with them. The more people who join us, the stronger our community becomes.

Share the waitlist: http://localhost:3003/beta-closed

All the Best,
Sanjay Bhargava
ZeroFinanx Team`
    });
    console.log('Waitlist confirmation email sent successfully:', result);
  } catch (error) {
    console.error('Failed to send waitlist confirmation email:', error);
    // Don't throw - we don't want email failures to break signup
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeEmail(email);
    
    // Validate email format
    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get database connection
    const db = getDatabase();

    try {
      // Insert email into waitlist (will fail if duplicate due to UNIQUE constraint)
      const insertStmt = db.prepare(`
        INSERT INTO waitlist (email) 
        VALUES (?)
      `);
      
      insertStmt.run(normalizedEmail);
      
      // Send confirmation email for new waitlist entries
      // Send email async without blocking the response
      sendWaitlistConfirmation(normalizedEmail).catch(err => 
        console.error('Waitlist confirmation email failed for', normalizedEmail, err)
      );

      return NextResponse.json({
        message: 'Successfully joined waitlist',
        email: normalizedEmail
      }, { status: 201 });

    } catch (dbError: any) {
      // Check if it's a duplicate email error
      if (dbError.code === 'SQLITE_CONSTRAINT_UNIQUE' || dbError.message?.includes('UNIQUE constraint failed')) {
        return NextResponse.json({
          message: 'Email already on waitlist',
          email: normalizedEmail
        }, { status: 200 });
      }
      
      throw dbError; // Re-throw other database errors
    }

  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get all waitlist entries (for admin use)
    const db = getDatabase();
    const waitlistEntries = db.prepare(`
      SELECT email, created_at 
      FROM waitlist 
      ORDER BY created_at DESC
    `).all();
    
    return NextResponse.json({
      waitlist: waitlistEntries,
      count: waitlistEntries.length
    });

  } catch (error) {
    console.error('Error fetching waitlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}