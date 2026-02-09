export interface Expense {
  id?: string;
  customer_id: string;
  description: string;
  amount: number;
  vendor: string;
  category: string;
  date?: string;
}