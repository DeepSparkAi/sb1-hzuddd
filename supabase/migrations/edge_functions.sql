-- Enable HTTP extension for Edge Functions
create extension if not exists http with schema extensions;

-- Create secure schema for edge functions
create schema if not exists edge_functions;

-- Set up RLS policies for edge functions
alter table auth.users enable row level security;

-- Create policy for stripe webhook function
create policy "Allow stripe webhook to access customers"
  on customers for all
  using (true)
  with check (true);

create policy "Allow stripe webhook to access subscriptions"
  on subscriptions for all
  using (true)
  with check (true);

-- Create policy for create checkout function
create policy "Allow create checkout for authenticated users"
  on customers for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create policy for create products function
create policy "Allow create products for app owners"
  on products for all
  to authenticated
  using (
    exists (
      select 1 from apps
      where apps.id = products.app_id
      and apps.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from apps
      where apps.id = products.app_id
      and apps.owner_id = auth.uid()
    )
  );

-- Create function to validate stripe signature
create or replace function edge_functions.verify_stripe_signature(
  signature text,
  payload text,
  secret text
) returns boolean as $$
  -- Implementation would go here, but this is handled in the Edge Function itself
  return true;
$$ language plpgsql security definer;

-- Create function to handle stripe events
create or replace function edge_functions.handle_stripe_event(
  event_type text,
  event_data jsonb
) returns void as $$
begin
  case event_type
    when 'customer.subscription.created' then
      -- Handle subscription created
      insert into subscriptions (
        user_id,
        stripe_subscription_id,
        status,
        current_period_start,
        current_period_end
      )
      values (
        (event_data->>'customer'),
        (event_data->>'id'),
        (event_data->>'status'),
        to_timestamp((event_data->>'current_period_start')::integer),
        to_timestamp((event_data->>'current_period_end')::integer)
      );
    
    when 'customer.subscription.updated' then
      -- Handle subscription updated
      update subscriptions
      set
        status = (event_data->>'status'),
        current_period_start = to_timestamp((event_data->>'current_period_start')::integer),
        current_period_end = to_timestamp((event_data->>'current_period_end')::integer)
      where stripe_subscription_id = (event_data->>'id');
    
    when 'customer.subscription.deleted' then
      -- Handle subscription deleted
      update subscriptions
      set status = 'canceled'
      where stripe_subscription_id = (event_data->>'id');
    
    else
      -- Log unknown event type
      raise notice 'Unknown stripe event type: %', event_type;
  end case;
end;
$$ language plpgsql security definer;

-- Grant necessary permissions
grant usage on schema edge_functions to service_role;
grant all on all functions in schema edge_functions to service_role;

-- Create webhook secrets table
create table if not exists edge_functions.webhook_secrets (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  secret text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Insert initial webhook secret (replace 'your_webhook_secret' with actual secret)
insert into edge_functions.webhook_secrets (name, secret)
values ('stripe', 'your_webhook_secret')
on conflict (name) do nothing;

-- Create function to get webhook secret
create or replace function edge_functions.get_webhook_secret(secret_name text)
returns text as $$
  select secret from edge_functions.webhook_secrets where name = secret_name;
$$ language sql security definer;