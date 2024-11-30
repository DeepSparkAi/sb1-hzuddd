export interface Subscription {
  id: string;
  status: string;
  current_period_end: string;
  plan: string;
  amount: number;
  user_id: string;
}