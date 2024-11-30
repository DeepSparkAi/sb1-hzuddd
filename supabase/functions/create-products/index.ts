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
    const { appId, products } = await req.json();
    
    if (!appId || !products) {
      throw new Error('App ID and products are required');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Get app details
    const { data: app, error: appError } = await supabase
      .from('apps')
      .select('name, description')
      .eq('id', appId)
      .single();

    if (appError || !app) {
      throw new Error('App not found');
    }

    const createdProducts = [];

    for (const product of products) {
      // Create Stripe product
      const stripeProduct = await stripe.products.create({
        name: `${app.name} - ${product.name}`,
        description: product.description,
        metadata: {
          app_id: appId
        }
      });

      // Create Stripe price
      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: product.amount,
        currency: 'usd',
        recurring: {
          interval: product.interval
        },
        metadata: {
          app_id: appId
        }
      });

      // Save to database
      const { data: dbProduct, error: dbError } = await supabase
        .from('products')
        .insert({
          app_id: appId,
          name: product.name,
          description: product.description,
          amount: product.amount,
          interval: product.interval,
          features: product.features,
          stripe_product_id: stripeProduct.id,
          stripe_price_id: stripePrice.id,
          active: true
        })
        .select()
        .single();

      if (dbError) throw dbError;
      createdProducts.push(dbProduct);
    }

    return new Response(
      JSON.stringify({ products: createdProducts }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    );
  } catch (error) {
    console.error('Create products error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    );
  }
});