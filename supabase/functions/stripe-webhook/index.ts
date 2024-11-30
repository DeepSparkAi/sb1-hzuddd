import { serve } from 'https://deno.fresh.dev/std@v1/http/server.ts';
import { stripe } from '../_shared/stripe.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Get customer from Stripe
        const customer = await stripe.customers.retrieve(customerId);
        const userId = customer.metadata.supabase_user_id;

        // Get price details
        const priceId = subscription.items.data[0].price.id;
        const { data: productData } = await supabase
          .from('products')
          .select('name')
          .eq('stripe_price_id', priceId)
          .single();

        // Update subscription in database
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            plan_id: priceId,
            plan_name: productData?.name || 'Unknown Plan',
            amount: subscription.items.data[0].price.unit_amount / 100,
            currency: subscription.currency,
            interval: subscription.items.data[0].price.recurring.interval,
            interval_count: subscription.items.data[0].price.recurring.interval_count,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          });

        // Update customer subscription status
        await supabase
          .from('customers')
          .update({ subscription_status: subscription.status })
          .eq('stripe_customer_id', customerId);

        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Get customer from database
        const { data: customerData } = await supabase
          .from('customers')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (customerData) {
          // Update subscription status
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              canceled_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);

          // Update customer subscription status
          await supabase
            .from('customers')
            .update({ subscription_status: 'inactive' })
            .eq('stripe_customer_id', customerId);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    );
  }
});