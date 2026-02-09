import { Injectable, signal } from '@angular/core';
import { supabase } from '../supabase.client'; 
import { Customer, Expense } from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  
  public customers = signal<Customer[]>([]);
  public isLoading = signal<boolean>(false);

  async getCustomers() {
    this.isLoading.set(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*, expenses(*)')
        .order('name', { ascending: true });

      if (error) throw error;
      if (data) this.customers.set(data as Customer[]);
    } catch (error: any) {
      console.error('Error al cargar clientes con gastos:', error.message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async createCustomer(newCustomer: Partial<Customer>) {
    this.isLoading.set(true);
    try {
      const initialLog = [{ 
        action: 'Cliente registrado en LegaSync Flow', 
        date: new Date().toISOString() 
      }];

      const { data, error } = await supabase
        .from('customers')
        .insert([{
          ...newCustomer,
          status: newCustomer.status || 'prospect',
          deal_value: newCustomer.deal_value || 0,
          activity_log: initialLog,
          created_at: new Date()
        }])
        .select();

      if (error) throw error;

      if (data) {
        const newEntry = { ...data[0], expenses: [] } as Customer;
        this.customers.update(prev => [...prev, newEntry]);
      }
      return data[0];
    } catch (error: any) {
      console.error('Error al crear cliente:', error.message);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateCustomer(id: string, changes: Partial<Customer>) {
    try {
      if (changes.status) {
        const currentCustomer = this.customers().find(c => c.id === id);
        const oldStatus = currentCustomer?.status;
        
        if (oldStatus && oldStatus !== changes.status) {
          const newLogEntry = {
            action: `Pipeline: de ${oldStatus.toUpperCase()} a ${changes.status.toUpperCase()}`,
            date: new Date().toISOString()
          };
          
          const updatedLog = currentCustomer?.activity_log 
            ? [...currentCustomer.activity_log, newLogEntry]
            : [newLogEntry];
          
          changes.activity_log = updatedLog;
        }
      }

      const { data, error } = await supabase
        .from('customers')
        .update(changes)
        .eq('id', id)
        .select();

      if (error) throw error;

      if (data) {
        this.customers.update(prev => 
          prev.map(c => c.id === id ? { ...c, ...data[0] } : c)
        );
      }
      return data[0];
    } catch (error: any) {
      console.error('Error al actualizar cliente:', error.message);
      throw error;
    }
  }

  async addExpense(customerId: string, newExpense: Partial<Expense>) {
    try {
      const expenseData = {
        customer_id: customerId,
        description: newExpense.description || 'Gasto sin descripción',
        amount: Number(newExpense.amount) || 0,
        category: newExpense.vendor || 'General', 
        date: newExpense.date || new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('expenses')
        .insert([expenseData])
        .select();

      if (error) throw error;

      if (data) {
        this.customers.update(prev => 
          prev.map(c => {
            if (c.id === customerId) {
              return {
                ...c,
                expenses: [...(c.expenses || []), data[0] as Expense]
              };
            }
            return c;
          })
        );
      }
      return data[0];
    } catch (error: any) {
      console.error('Error al registrar en tabla expenses:', error.message);
      throw error;
    }
  }

  async deleteExpense(customerId: string, expenseId: string) {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      this.customers.update(prev => 
        prev.map(c => c.id === customerId 
          ? { ...c, expenses: (c.expenses || []).filter(e => e.id !== expenseId) } 
          : c
        )
      );
    } catch (error: any) {
      console.error('Error al eliminar gasto:', error.message);
    }
  }

  async deleteCustomer(id: string) {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      this.customers.update(prev => prev.filter(c => c.id !== id));
    } catch (error: any) {
      console.error('Error al eliminar cliente:', error.message);
    }
  }
}