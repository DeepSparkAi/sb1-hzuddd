// Environment variable validation and configuration
const requiredEnvVars = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  VITE_STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
} as const;

// Validate environment variables
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  supabase: {
    url: requiredEnvVars.VITE_SUPABASE_URL,
    anonKey: requiredEnvVars.VITE_SUPABASE_ANON_KEY,
  },
  stripe: {
    publicKey: requiredEnvVars.VITE_STRIPE_PUBLIC_KEY,
  },
} as const;