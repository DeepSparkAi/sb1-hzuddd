export interface App {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url?: string;
  primary_color: string;
  owner_id: string;
  created_at: string;
  active: boolean;
  metadata: Record<string, unknown>;
}