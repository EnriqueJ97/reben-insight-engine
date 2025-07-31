import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';
import { Resend } from 'npm:resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailQueueItem {
  id: string;
  to_email: string;
  subject: string;
  html_content: string;
  template_type: string;
  priority: string;
  status: string;
  retry_count: number;
  max_retries: number;
  metadata: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting email processing...');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    const resend = new Resend(resendApiKey);

    // Parse request body
    const { queue_ids } = await req.json();
    console.log('📧 Processing queue IDs:', queue_ids);

    // Get pending emails from queue
    let query = supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    // Filter by specific queue IDs if provided
    if (queue_ids && queue_ids.length > 0) {
      query = query.in('id', queue_ids);
    } else {
      // Limit to 50 emails if no specific IDs
      query = query.limit(50);
    }

    const { data: emailQueue, error: queueError } = await query;

    if (queueError) {
      console.error('❌ Error fetching email queue:', queueError);
      throw queueError;
    }

    if (!emailQueue || emailQueue.length === 0) {
      console.log('📭 No emails to process');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No emails to process',
        processed: 0 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`📬 Found ${emailQueue.length} emails to process`);

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      errors: [] as any[]
    };

    // Process each email in the queue
    for (const emailItem of emailQueue as EmailQueueItem[]) {
      try {
        console.log(`📨 Processing email ${emailItem.id} to ${emailItem.to_email}`);

        // Mark as processing
        await supabase
          .from('email_queue')
          .update({ 
            status: 'retrying',
            updated_at: new Date().toISOString()
          })
          .eq('id', emailItem.id);

        // Send email via Resend
        const emailResponse = await resend.emails.send({
          from: 'REBEN Sistema <noreply@resend.dev>', // Cambiar por tu dominio
          to: [emailItem.to_email],
          subject: emailItem.subject,
          html: emailItem.html_content,
          headers: {
            'X-Email-Type': emailItem.template_type,
            'X-Priority': emailItem.priority,
          }
        });

        console.log('✅ Email sent successfully:', emailResponse);

        // Update queue item as sent
        await supabase
          .from('email_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', emailItem.id);

        results.sent++;
        results.processed++;

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (emailError) {
        console.error(`❌ Error sending email ${emailItem.id}:`, emailError);

        const newRetryCount = emailItem.retry_count + 1;
        const shouldRetry = newRetryCount < emailItem.max_retries;

        // Update queue item with error
        await supabase
          .from('email_queue')
          .update({
            status: shouldRetry ? 'pending' : 'failed',
            retry_count: newRetryCount,
            error_message: emailError.message,
            updated_at: new Date().toISOString(),
            // Schedule retry for later if within retry limit
            scheduled_at: shouldRetry 
              ? new Date(Date.now() + (newRetryCount * 5 * 60 * 1000)).toISOString() // 5min, 10min, 15min delays
              : emailItem.scheduled_at
          })
          .eq('id', emailItem.id);

        results.failed++;
        results.processed++;
        results.errors.push({
          email_id: emailItem.id,
          to_email: emailItem.to_email,
          error: emailError.message,
          retry_count: newRetryCount,
          will_retry: shouldRetry
        });
      }
    }

    console.log('🎯 Email processing completed:', results);

    // Clean up old sent emails (older than 30 days)
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await supabase
        .from('email_queue')
        .delete()
        .eq('status', 'sent')
        .lt('sent_at', thirtyDaysAgo.toISOString());

      console.log('🧹 Cleaned up old sent emails');
    } catch (cleanupError) {
      console.warn('⚠️ Error cleaning up old emails:', cleanupError);
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${results.processed} emails`,
      results
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('💥 Fatal error in send-email function:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);