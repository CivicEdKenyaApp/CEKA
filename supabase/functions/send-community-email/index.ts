import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CommunityMemberRequest {
  first_name: string;
  last_name: string;
  email: string;
  county?: string;
  interests?: string;
  areas_of_interest: string[];
  terms_accepted: boolean;
}

// Send email using Resend API directly via fetch
async function sendEmailWithResend(
  to: string[],
  subject: string,
  html: string
): Promise<{ data?: any; error?: any }> {
  if (!RESEND_API_KEY) {
    return { error: { message: 'RESEND_API_KEY not configured' } };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CEKA Community <onboarding@resend.dev>',
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: { message: (error as Error).message } };
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { 
      first_name, 
      last_name, 
      email, 
      county, 
      interests, 
      areas_of_interest, 
      terms_accepted 
    }: CommunityMemberRequest = await req.json();

    // Validate required fields
    if (!first_name || !last_name || !email || !terms_accepted) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Get client IP and user agent for logging
    const source_ip = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const user_agent = req.headers.get('user-agent') || 'unknown';

    // Check for duplicate submissions in last 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data: existingSubmissions, error: checkError } = await supabase
      .from('community_members')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .gte('created_at', twentyFourHoursAgo.toISOString());

    if (checkError) {
      console.error('Database check error:', checkError);
      return new Response(
        JSON.stringify({ error: 'Database error during validation' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    if (existingSubmissions && existingSubmissions.length > 0) {
      return new Response(
        JSON.stringify({ error: 'You have already submitted an application recently' }),
        { 
          status: 409, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Insert into database
    const { data: insertedMember, error: dbError } = await supabase
      .from('community_members')
      .insert([
        {
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          email: email.toLowerCase().trim(),
          county: county ? county.trim() : null,
          interests: interests ? interests.trim() : null,
          areas_of_interest: areas_of_interest || [],
          terms_accepted: true,
          source_ip,
          user_agent,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Database insertion error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to save application' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Prepare email content
    const areasOfInterestText = areas_of_interest && areas_of_interest.length > 0 
      ? areas_of_interest.map(area => 
          area.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
        ).join(', ')
      : 'None specified';

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New CEKA Community Application</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #006633 0%, #228B22 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .field { margin-bottom: 15px; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #006633; }
            .field-label { font-weight: bold; color: #006633; margin-bottom: 5px; }
            .field-value { color: #555; }
            .footer { margin-top: 20px; padding: 15px; background: #e9e9e9; text-align: center; font-size: 12px; color: #666; border-radius: 5px; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">CEKA</div>
                <h1 style="margin: 0;">New Community Member Application</h1>
                <p style="margin: 5px 0 0 0;">Civic Education Kenya Alliance</p>
            </div>
            <div class="content">
                <div class="field">
                    <div class="field-label">Full Name</div>
                    <div class="field-value">${first_name} ${last_name}</div>
                </div>
                <div class="field">
                    <div class="field-label">Email Address</div>
                    <div class="field-value">${email}</div>
                </div>
                <div class="field">
                    <div class="field-label">County</div>
                    <div class="field-value">${county || 'Not provided'}</div>
                </div>
                <div class="field">
                    <div class="field-label">Interests in Civic Education</div>
                    <div class="field-value">${interests || 'Not provided'}</div>
                </div>
                <div class="field">
                    <div class="field-label">Areas of Interest</div>
                    <div class="field-value">${areasOfInterestText}</div>
                </div>
                <div class="field">
                    <div class="field-label">Submission Date</div>
                    <div class="field-value">${new Date().toLocaleString('en-KE', { 
                      timeZone: 'Africa/Nairobi',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} (EAT)</div>
                </div>
                <div class="field">
                    <div class="field-label">IP Address</div>
                    <div class="field-value">${source_ip}</div>
                </div>
            </div>
            <div class="footer">
                <p><strong>Application ID:</strong> ${insertedMember.id}</p>
                <p>This application was automatically submitted through the CEKA website.</p>
                <p>Please review and follow up with the applicant as appropriate.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Send email notification
    let emailStatus = 'pending';
    try {
      const { data: emailData, error: emailError } = await sendEmailWithResend(
        ['civiceducationkenya@gmail.com'],
        `New CEKA Community Application: ${first_name} ${last_name}`,
        emailHtml
      );

      if (emailError) {
        console.error('Email sending error:', emailError);
        emailStatus = 'email_failed';
        
        // Update database status
        await supabase
          .from('community_members')
          .update({ status: 'email_failed' })
          .eq('id', insertedMember.id);
      } else {
        console.log('Email sent successfully:', emailData);
        emailStatus = 'processed';
        
        // Update database status
        await supabase
          .from('community_members')
          .update({ status: 'processed' })
          .eq('id', insertedMember.id);
      }
    } catch (emailError) {
      console.error('Email service error:', emailError);
      emailStatus = 'email_failed';
      
      // Update database status
      await supabase
        .from('community_members')
        .update({ status: 'email_failed' })
        .eq('id', insertedMember.id);
    }

    return new Response(
      JSON.stringify({ 
        message: 'Application submitted successfully!',
        application_id: insertedMember.id,
        email_status: emailStatus
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
