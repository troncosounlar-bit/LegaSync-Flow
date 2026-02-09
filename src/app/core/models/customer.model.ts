export type CustomerStatus = 'prospect' | 'negotiation' | 'closed' | 'lost';
export type CustomerPriority = 'low' | 'medium' | 'high';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  vendor: string;
  date: string;
}

export interface ActivityLog {
  action: string;
  date: string;
}

export interface Customer {

  id: string; 
  name: string;
  email: string;
  company: string;
  phone?: string | null;
  status: CustomerStatus; 
  deal_value: number;    
  priority: CustomerPriority;
  last_contact?: Date | string | null;
  notes?: string;
  activity_log?: ActivityLog[];
  expenses?: Expense[];
  created_at?: Date | string;
}