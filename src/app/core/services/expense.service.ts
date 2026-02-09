import { Injectable } from '@angular/core';

import { supabase } from '../supabase.client'; 
import { Expense } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  async addExpense(expense: Expense) {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expense])
      .select();
    return { data, error };
  }

  async getExpensesByCustomer(customerId: string) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('customer_id', customerId)
      .order('date', { ascending: false });
    return { data, error };
  }

  async deleteExpense(id: string) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    return { error };
  }
}