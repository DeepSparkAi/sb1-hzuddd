-- Drop existing tables if they exist
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS apps CASCADE;
DROP TABLE IF EXISTS templates CASCADE;

-- Create templates table
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    config_schema JSONB NOT NULL DEFAULT '[]',
    default_products JSONB NOT NULL DEFAULT '[]',
    erase_prior BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create apps table
CREATE TABLE apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#000000',
    template_id UUID REFERENCES templates(id),
    owner_id UUID NOT NULL,
    config JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    email TEXT NOT NULL,
    stripe_customer_id TEXT UNIQUE,
    subscription_status TEXT DEFAULT 'inactive',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    interval TEXT CHECK (interval IN ('month', 'year')),
    features JSONB DEFAULT '[]',
    stripe_price_id TEXT UNIQUE,
    stripe_product_id TEXT UNIQUE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE,
    status TEXT NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better query performance
CREATE INDEX idx_apps_owner_id ON apps(owner_id);
CREATE INDEX idx_apps_template_id ON apps(template_id);
CREATE INDEX idx_products_app_id ON products(app_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_app_id ON subscriptions(app_id);
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_stripe_customer_id ON customers(stripe_customer_id);

-- Create RLS policies
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Apps policies
CREATE POLICY "Public apps are viewable by everyone" ON apps
    FOR SELECT USING (active = true);

CREATE POLICY "Users can create apps" ON apps
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own apps" ON apps
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own apps" ON apps
    FOR DELETE USING (auth.uid() = owner_id);

-- Products policies
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (active = true);

CREATE POLICY "App owners can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM apps
            WHERE apps.id = products.app_id
            AND apps.owner_id = auth.uid()
        )
    );

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "App owners can view their app subscriptions" ON subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM apps
            WHERE apps.id = subscriptions.app_id
            AND apps.owner_id = auth.uid()
        )
    );

-- Customers policies
CREATE POLICY "Users can view their own customer data" ON customers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "App owners can view their customers" ON customers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM subscriptions
            JOIN apps ON apps.id = subscriptions.app_id
            WHERE subscriptions.customer_id = customers.id
            AND apps.owner_id = auth.uid()
        )
    );

-- Insert default template with Stripe price IDs
INSERT INTO templates (name, description, config_schema, default_products)
VALUES (
    'Basic SaaS Template',
    'A standard template for SaaS applications with tiered pricing',
    '[
        {
            "name": "App Name",
            "key": "app_name",
            "type": "text",
            "description": "The name of your application",
            "required": true
        },
        {
            "name": "Primary Color",
            "key": "primary_color",
            "type": "color",
            "description": "Main color theme for your app",
            "required": true,
            "default_value": "#4F46E5"
        }
    ]'::jsonb,
    '[
        {
            "name": "Starter",
            "description": "Perfect for small businesses",
            "amount": 2900,
            "interval": "month",
            "stripe_price_id": "price_starter",
            "features": [
                "Up to 1,000 subscribers",
                "Basic analytics",
                "Email support",
                "API access"
            ]
        },
        {
            "name": "Professional",
            "description": "For growing businesses",
            "amount": 9900,
            "interval": "month",
            "stripe_price_id": "price_pro",
            "features": [
                "Up to 10,000 subscribers",
                "Advanced analytics",
                "Priority support",
                "API access",
                "Custom integrations"
            ]
        },
        {
            "name": "Enterprise",
            "description": "For large organizations",
            "amount": 29900,
            "interval": "month",
            "stripe_price_id": "price_enterprise",
            "features": [
                "Unlimited subscribers",
                "Enterprise analytics",
                "24/7 phone support",
                "API access",
                "Custom integrations",
                "Dedicated account manager"
            ]
        }
    ]'::jsonb
);