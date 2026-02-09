export interface Customer {
  id?: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  created_at?: string;
}


export interface Invoice {
  id?: string;
  customer_name: string;   
  customer_id?: string;   
  base_amount: number;     
  currency_code: string;   
  status: 'paid' | 'pending';
  created_at?: string | Date;

 
  fiscal_status?: 'pending' | 'validated' | 'rejected';
  fiscal_id?: string;
  validation_date?: string;
  is_automated?: boolean;
  isAuto?: boolean; 
}