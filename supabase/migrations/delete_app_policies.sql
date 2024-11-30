-- Add cascade delete to products table
ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_app_id_fkey,
ADD CONSTRAINT products_app_id_fkey
  FOREIGN KEY (app_id)
  REFERENCES apps(id)
  ON DELETE CASCADE;

-- Add cascade delete to subscriptions table
ALTER TABLE subscriptions
DROP CONSTRAINT IF EXISTS subscriptions_app_id_fkey,
ADD CONSTRAINT subscriptions_app_id_fkey
  FOREIGN KEY (app_id)
  REFERENCES apps(id)
  ON DELETE CASCADE;

-- Create policy for app deletion
CREATE POLICY "Users can delete their own apps"
  ON apps
  FOR DELETE
  USING (auth.uid() = owner_id);

-- Create policy to allow app owners to delete products
CREATE POLICY "App owners can delete products"
  ON products
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM apps
      WHERE apps.id = products.app_id
      AND apps.owner_id = auth.uid()
    )
  );

-- Create policy to allow app owners to delete subscriptions
CREATE POLICY "App owners can delete subscriptions"
  ON subscriptions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM apps
      WHERE apps.id = subscriptions.app_id
      AND apps.owner_id = auth.uid()
    )
  );

-- Create function to handle app deletion cleanup
CREATE OR REPLACE FUNCTION handle_app_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Cancel any active Stripe subscriptions
  UPDATE subscriptions
  SET 
    status = 'canceled',
    canceled_at = NOW()
  WHERE app_id = OLD.id
  AND status = 'active';

  -- Update customer subscription status if this was their only active subscription
  UPDATE customers c
  SET subscription_status = 'inactive'
  WHERE NOT EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.customer_id = c.id
    AND s.status = 'active'
  )
  AND c.id IN (
    SELECT customer_id FROM subscriptions
    WHERE app_id = OLD.id
  );

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for app deletion
DROP TRIGGER IF EXISTS app_deletion_cleanup ON apps;
CREATE TRIGGER app_deletion_cleanup
  BEFORE DELETE ON apps
  FOR EACH ROW
  EXECUTE FUNCTION handle_app_deletion();

-- Enable RLS on all relevant tables if not already enabled
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create index for better deletion performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_app_id_status
  ON subscriptions(app_id, status);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;