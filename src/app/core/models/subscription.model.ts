export interface Subscription {
  id?: string;
  customer_id: string;      
  service_name: string;     
  amount: number;
  interval: 'monthly' | 'yearly';
  currency_code: string;
  next_billing_date: string | Date; 
  is_active: boolean;       
  
  status?: 'active' | 'paused'; 
  description?: string;
  billing_day?: number;
  created_at?: string;
}