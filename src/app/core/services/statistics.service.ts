import { Injectable, inject, computed } from '@angular/core';
import { InvoiceService } from './invoice.service';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private invoiceService = inject(InvoiceService);

  private readonly EXCHANGE_RATES: Record<string, number> = {
    'USD': 1,
    'ARS': 0.0012, 
    'EUR': 1.08,
    'MXN': 0.058,
    'BRL': 0.20
  };

  public totalRevenueUSD = computed(() => {
    return this.invoiceService.invoices()
      .filter(inv => inv.status === 'paid')
      .reduce((acc, inv) => {
        const rate = this.EXCHANGE_RATES[inv.currency_code || 'USD'] || 1;
        return acc + (inv.base_amount * rate);
      }, 0);
  });

  public revenueByCustomer = computed(() => {
    const data: Record<string, number> = {};
    
    this.invoiceService.invoices().forEach(inv => {
      if (inv.status === 'paid') {
        const rate = this.EXCHANGE_RATES[inv.currency_code || 'USD'] || 1;
        const amountUSD = inv.base_amount * rate;
        data[inv.customer_name] = (data[inv.customer_name] || 0) + amountUSD;
      }
    });

    return {
      labels: Object.keys(data),
      values: Object.values(data)
    };
  });
}