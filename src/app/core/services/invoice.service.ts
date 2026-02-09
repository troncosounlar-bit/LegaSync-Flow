import { Injectable, signal, computed } from '@angular/core';
import { supabase } from '../supabase.client';
import { Invoice, Customer } from '../models/invoice.model';
import { of, delay, tap } from 'rxjs'; 


declare function calculateLegacyTax(amount: number): number;

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  public invoices = signal<Invoice[]>([]);
  public customers = signal<Customer[]>([]);
  public isLoading = signal<boolean>(false);
  public isProcessingBatch = signal<boolean>(false); 
  public currentFilter = signal<string | null>(null);

 
  public amount = signal<number>(0); 
  public legacyError = signal<string | null>(null);

  public totalRevenue = computed(() => 
    this.invoices().reduce((acc, inv) => acc + (Number(inv.base_amount) || 0), 0)
  );

  public riskCapital = computed(() => {
    const threshold = 15 * 24 * 60 * 60 * 1000;
    const now = new Date().getTime();
    
    return this.invoices()
      .filter(inv => inv.status === 'pending' && inv.created_at)
      .reduce((acc, inv) => {
        const created = new Date(inv.created_at!).getTime();
        return (now - created > threshold) ? acc + (Number(inv.base_amount) || 0) : acc;
      }, 0);
  });


  public automationRatio = computed(() => {
    const total = this.totalRevenue();
    if (total === 0) return 0;
    const automated = this.invoices()
      .filter(inv => inv.is_automated || inv.isAuto)
      .reduce((acc, inv) => acc + (Number(inv.base_amount) || 0), 0);
    return Math.round((automated / total) * 100);
  });


  public healthScore = computed(() => {
    const totalCount = this.invoices().length;
    if (totalCount === 0) return 100;
    const paidCount = this.invoices().filter(i => i.status === 'paid').length;
    return Math.round((paidCount / totalCount) * 100);
  });


  public totalCalculated = computed(() => {
    const val = Number(this.amount());
    if (isNaN(val) || val <= 0) return 0;
    try {
      return calculateLegacyTax(val);
    } catch (e) {
      console.error('LegaSync Engine Error:', e);
      return 0;
    }
  });

  constructor() {
    this.getInvoices(); 
  }

  public generateMonthlyBatch() {
    this.isProcessingBatch.set(true);

    return of(null).pipe(
      delay(2500),
      tap(() => {
        const batchResults: Invoice[] = [
          {
            id: crypto.randomUUID(),
            customer_name: 'Amazon Cloud Services',
            base_amount: 450.00,
            status: 'paid',
            fiscal_id: 'AFIP-8821-X90', 
            created_at: new Date(),
            isAuto: true 
          } as any,
          {
            id: crypto.randomUUID(),
            customer_name: 'Google G-Suite Business',
            base_amount: 125.50,
            status: 'paid',
            fiscal_id: 'AFIP-4412-Z11',
            created_at: new Date(),
            isAuto: true
          } as any,
          {
            id: crypto.randomUUID(),
            customer_name: 'Suscripción GitHub Pro',
            base_amount: 48.00,
            status: 'paid',
            fiscal_id: 'AFIP-1102-Q00',
            created_at: new Date(),
            isAuto: true
          } as any
        ];

        this.invoices.update(prev => [...batchResults, ...prev]);
        this.isProcessingBatch.set(false);
      })
    );
  }

  async getInvoices(searchTerm?: string) {
    this.isLoading.set(true);
    this.currentFilter.set(searchTerm || null);
    try {
      let query = supabase.from('invoices').select('*').order('created_at', { ascending: false });
      
      if (searchTerm) query = query.ilike('customer_name', `%${searchTerm}%`);
      
      const { data, error } = await query;
      if (error) throw error;
      this.invoices.set(data || []);
    } catch (error: any) {
      console.error('Error:', error.message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async fetchInvoices(searchTerm?: string) {
    return this.getInvoices(searchTerm);
  }

  clearFilters() {
    this.currentFilter.set(null);
    this.getInvoices();
  }

  async createInvoice(newInvoice: Partial<Invoice>) {
    this.isLoading.set(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert([{...newInvoice, created_at: new Date()}])
        .select();

      if (error) throw error;
      if (data) this.invoices.update(prev => [data[0], ...prev]);
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteInvoice(id: string) {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (!error) {
      this.invoices.update(prev => prev.filter(inv => inv.id !== id));
    }
  }

  setAmount(value: any) {
    const numericValue = value === '' ? 0 : Number(value);
    if (isNaN(numericValue)) {
      this.legacyError.set('Formato de número inválido');
    } else {
      this.legacyError.set(null);
    }
    this.amount.set(numericValue);
  }
}