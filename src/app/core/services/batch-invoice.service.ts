import { inject, Injectable, signal } from '@angular/core';
import { SubscriptionService } from './subscription.service';
import { InvoiceService } from './invoice.service';
import { supabase } from '../supabase.client';
import { Subscription } from '../models/subscription.model';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BatchInvoiceService {
  private subService = inject(SubscriptionService);
  private invService = inject(InvoiceService);
  
  public isProcessing = signal(false);

  async runMonthlyBilling() {
    this.isProcessing.set(true);
    
    try {
      const { data: subs, error } = await supabase
        .from('subscriptions')
        .select('*, customers(name)')
        .eq('is_active', true);

      if (error) throw error;

      const today = new Date();
      
      for (const sub of (subs as any[])) {
        const nextDate = new Date(sub.next_billing_date);
        if (nextDate <= today) {
          await this.processSingleSubscription(sub);
        }
      }
      
      await this.invService.getInvoices();
      alert('✅ Proceso de facturación masiva completado.');

    } catch (err) {
      console.error("Error en Batch Billing:", err);
    } finally {
      this.isProcessing.set(false);
    }
  }

  private async processSingleSubscription(sub: any) {
    const fiscalData = await this.simulateFiscalValidation();

    const newInvoice = {
      customer_id: sub.customer_id,
      customer_name: sub.customers?.name || 'Cliente LegaSync',
      base_amount: sub.amount,
      currency_code: 'USD', 
      status: 'pending' as const,
      fiscal_status: 'validated' as const,
      fiscal_id: fiscalData.cae,
      validation_date: new Date().toISOString()
    };

    const { error: invError } = await supabase.from('invoices').insert([newInvoice]);
    
    if (!invError) {
      const currentNextDate = new Date(sub.next_billing_date);
      currentNextDate.setMonth(currentNextDate.getMonth() + 1);

      await supabase
        .from('subscriptions')
        .update({ next_billing_date: currentNextDate.toISOString().split('T')[0] })
        .eq('id', sub.id);
    }
  }

  private async simulateFiscalValidation(): Promise<{ cae: string }> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const randomCAE = 'CAE-' + Math.random().toString(36).substring(2, 11).toUpperCase();
    return { cae: randomCAE };
  }
}