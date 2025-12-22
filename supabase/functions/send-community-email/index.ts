import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get("RESEND_API_KEY");

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

async function sendEmailWithResend(
  to: string[],
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string }> {
  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured, skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
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
      return { success: false, error: errorData.message || 'Email send failed' };
    }

    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
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

    if (!first_name || !last_name || !email || !terms_accepted) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const source_ip = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const user_agent = req.headers.get('user-agent') || 'unknown';

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
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (existingSubmissions && existingSubmissions.length > 0) {
      return new Response(
        JSON.stringify({ error: 'You have already submitted an application recently' }),
        { status: 409, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const { data: insertedMember, error: dbError } = await supabase
      .from('community_members')
      .insert([{
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
      }])
      .select()
      .single();

    if (dbError) {
      console.error('Database insertion error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to save application' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

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
        <title>New CEKA Community Application</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #006633 0%, #228B22 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">🇰🇪 CEKA</div>
                <h1 style="margin: 0;">New Community Member Application</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <p><strong>Full Name:</strong> ${first_name} ${last_name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>County:</strong> ${county || 'Not provided'}</p>
                <p><strong>Interests:</strong> ${interests || 'Not provided'}</p>
                <p><strong>Areas of Interest:</strong> ${areasOfInterestText}</p>
                <p><strong>Application ID:</strong> ${insertedMember.id}</p>
            </div>
        </div>
    </body>
    </html>
    `;

    let emailStatus = 'pending';
    const emailResult = await sendEmailWithResend(
      ['civiceducationkenya@gmail.com'],
      `🇰🇪 New CEKA Community Application: ${first_name} ${last_name}`,
      emailHtml
    );

    if (emailResult.success) {
      emailStatus = 'processed';
    } else {
      emailStatus = 'email_failed';
      console.warn('Email not sent:', emailResult.error);
    }

    await supabase
      .from('community_members')
      .update({ status: emailStatus })
      .eq('id', insertedMember.id);

    return new Response(
      JSON.stringify({ 
        message: 'Application submitted successfully!',
        application_id: insertedMember.id,
        email_status: emailStatus
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(handler);
