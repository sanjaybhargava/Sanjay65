import { NextRequest, NextResponse } from 'next/server';
import { isValidEmail, normalizeEmail } from '@/lib/cookies';
import { userRepository, Customer } from '@/lib/repositories/users';
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
            <a href="https://bit.ly/IA_Dashboard" style="display: inline-block; background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px;">📊 Go to Dashboard</a>
          </div>
          
          <p>Two asks:</p>
          <p>1. If you find this useful, share it with others:</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="https://bit.ly/IA_Prototype" style="display: inline-block; background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px;">🚀 Try Prototype</a>
          </div>
          
          <p>2. Give us feedback - what's working, what's not, what's missing? Your input shapes what we build next. Our aim is to eliminate financial anxiety, and you can help make that happen.</p>
          
          <p><em>P.S. Don't try to do everything at once. One calculator, then one lesson. Progress beats perfection.</em></p>
          
          <p>All the Best,<br>
          Sanjay Bhargava</p>
        </div>
      `,
      text: `Hi there,

Thank you for joining the beta.

Here's what makes this different: no overwhelming portfolios, no 47-step plans, no upsells. Just practical education with actions you can take that reduce financial anxiety.

You have 9 lessons and 2 calculators waiting, designed for different life stages:

IF YOU'RE STARTING OUT:
Begin with your Save Number calculator → shows you exactly how much you need to stop worrying about money forever.

IF YOU'RE ESTABLISHED:
Start with your Spend Number calculator → reveals how much you can spend guilt-free on whatever makes you happy.

Both take 3 minutes. Pick whichever fits your situation.

After that, you'll find lessons tailored to where you are in life. 

Play with the lessons and calculators. The more you use them the clearer they will become. 

Go to Dashboard: https://bit.ly/IA_Dashboard

Two asks:
1. If you find this useful, share it with others: https://bit.ly/IA_Prototype

2. Give us feedback - what's working, what's not, what's missing? Your input shapes what we build next. Our aim is to eliminate financial anxiety, and you can help make that happen.

P.S. Don't try to do everything at once. One calculator, then one lesson. Progress beats perfection.

All the Best,
Sanjay Bhargava`
    });
    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't throw - we don't want email failures to break signup
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, notes, marketingConsent, smsConsent } = body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
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

    // Use upsertByEmail to create or update customer
    const result = userRepository.upsertByEmail({
      email: normalizedEmail,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone?.trim(),
      notes: notes?.trim(),
      marketingConsent: marketingConsent ?? false,
      smsConsent: smsConsent ?? false
    });

    // Send welcome email for new customers
    if (result.isNewCustomer) {
      // Send email async without blocking the response
      sendWelcomeEmail(normalizedEmail).catch(err => 
        console.error('Welcome email failed for', normalizedEmail, err)
      );
    }

    return NextResponse.json({
      customer: result.customer,
      isNewCustomer: result.isNewCustomer
    }, { status: result.isNewCustomer ? 201 : 200 });

  } catch (error) {
    console.error('Error creating/updating customer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get all customers (for admin use)
    const customerArray = userRepository.findAll();
    
    return NextResponse.json({
      customers: customerArray,
      count: customerArray.length
    });

  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}