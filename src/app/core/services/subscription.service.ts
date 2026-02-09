import { Injectable, signal } from '@angular/core';
import { supabase } from '../supabase.client';
import { Subscription } from '../models/subscription.model';
import { from, Observable, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private supabase = supabase;
  
  public subscriptions = signal<Subscription[]>([]);

  constructor() {}

  async getAllActiveSubscriptions() {
    try {
      const { data, error } = await this.supabase
        .from('subscriptions')
        .select('*') 
        .eq('is_active', true);
      
      if (error) {
        console.error('Error de Supabase en getAllActiveSubscriptions:', error.message);
        return [];
      }

      if (data) {
        this.subscriptions.set(data);
      }
      return data || [];
    } catch (err) {
      console.error('Error crítico en el servicio de suscripciones:', err);
      return [];
    }
  }

  async runMonthlyAutomation() {
    const { data: activeSubs, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('is_active', true); 

    if (error || !activeSubs || activeSubs.length === 0) {
      return { success: false, message: 'No hay suscripciones activas para procesar' };
    }

    const newInvoices = activeSubs.map(sub => ({
      customer_id: sub.customer_id,
      amount: sub.amount,
      currency_code: sub.currency_code,
      status: 'pending',
      description: `Mensualidad Automática: ${sub.service_name || sub.description}`,
      is_automated: true,
      created_at: new Date().toISOString()
    }));

    const { error: insertError } = await this.supabase
      .from('invoices')
      .insert(newInvoices);

    if (insertError) {
      console.error('Error al generar facturas automáticas:', insertError.message);
      throw insertError;
    }

    return { success: true, count: newInvoices.length };
  }

  getSubscriptionsByCustomer(customerId: string): Observable<Subscription[]> {
    return from(
      this.supabase
        .from('subscriptions')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return res.data || [];
      })
    );
  }


  addSubscription(subscription: Subscription) {
    const subToSave = { ...subscription, is_active: true };
    
    return from(this.supabase.from('subscriptions').insert(subToSave)).pipe(
      tap(res => {
        if (!res.error) {
          this.getAllActiveSubscriptions();
        }
      })
    );
  }

  toggleSubscription(id: string, active: boolean) {
    return from(
      this.supabase
        .from('subscriptions')
        .update({ is_active: active })
        .eq('id', id)
    ).pipe(
      tap(() => this.getAllActiveSubscriptions())
    );
  }

  deleteSubscription(id: string) {
    return from(
      this.supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
    ).pipe(
      tap(() => this.getAllActiveSubscriptions())
    );
  }
}