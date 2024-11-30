import { serve } from 'https://deno.fresh.dev/std@v1/http/server.ts';
import { stripe } from '../_shared/stripe.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { priceId, userId, successUrl, cancelUrl } = await req.json();
    
    if (!priceId || !userId) {
      throw new Error('Price ID and User ID are required');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get or create customer
    const { data: customerData } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    let stripeCustomerId = customerData?.stripe_customer_id;

    if (!stripeCustomerId) {
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      
      if (!userData.user) {
        throw new Error('User not found');
      }

      const customer = await stripe.customers.create({
        email: userData.user.email,
        metadata: {
          supabase_user_id: userId,
        },
      });

      stripeCustomerId = customer.id;

      await supabase
        .from('customers')
        .insert({
          user_id: userId,
          email: userData.user.email,
          stripe_customer_id: customer.id,
        });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      payment_method_types: ['card'],
      client_reference_id: userId,
    });

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      },
    );
  }
});