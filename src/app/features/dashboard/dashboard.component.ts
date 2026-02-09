import { Component, OnInit, inject, computed, signal, effect, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { InvoiceService } from '../../core/services/invoice.service';
import { CustomerService } from '../../core/services/customer.service';
import { StatisticsService } from '../../core/services/statistics.service';
import { ExchangeService } from '../../core/services/exchange.service'; 
import { ActivityLogService } from '../../core/services/activity-log.service'; 
import { Chart, registerables } from 'chart.js';

import { SubscriptionManagerComponent } from './components/subscription-manager/subscription-manager.component';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SubscriptionManagerComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  public invoiceService = inject(InvoiceService);
  public customerService = inject(CustomerService);
  public statsService = inject(StatisticsService);
  public exchangeService = inject(ExchangeService);
  public logService = inject(ActivityLogService); 
  
  public Math = Math; 

  public riskAmount = this.invoiceService.riskCapital;
  public health = this.invoiceService.healthScore;
  
  public automation = computed(() => {
    const invoices = this.invoiceService.invoices();
    if (invoices.length === 0) return 0;

    const automaticInvoices = invoices.filter((inv: any) => inv.is_automatic === true).length;
    
    return Math.round((automaticInvoices / invoices.length) * 100);
  });
  
  public isRiskFilterActive = signal<boolean>(false);

  public selectedCurrency = signal<string>('USD');
  public taxPercentage = signal<number>(21);
  
  public isMarketOpen = signal<boolean>(false);  
  public isFiscalOpen = signal<boolean>(false); 
  public isAutoOpen = signal<boolean>(false); 
  public isActivityOpen = signal<boolean>(false); 

  public currencies = [
    { code: 'USD', name: 'Dólar Estadounidense', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'ARS', name: 'Peso Argentino', flag: '🇦🇷' },
    { code: 'MXN', name: 'Peso Mexicano', flag: '🇲🇽' },
    { code: 'BRL', name: 'Real Brasileño', flag: '🇧🇷' },
    { code: 'GBP', name: 'Libra Esterlina', flag: '🇬🇧' },
    { code: 'JPY', name: 'Yen Japonés', flag: '🇯🇵' },
    { code: 'CHF', name: 'Franco Suizo', flag: '🇨🇭' },
    { code: 'CLP', name: 'Peso Chileno', flag: '🇨🇱' },
    { code: 'PEN', name: 'Sol Peruano', flag: '🇵🇪' },
    { code: 'UYU', name: 'Peso Uruguayo', flag: '🇺🇾' }
  ];

  public currentPage = signal(1);
  public itemsPerPage = 5;

  public filteredInvoices = computed(() => {
    let invoices = this.invoiceService.invoices().filter(
      (inv: any) => inv.currency_code === this.selectedCurrency()
    );

    if (this.isRiskFilterActive()) {
      const today = new Date();
      invoices = invoices.filter((inv: any) => {
        const invoiceDate = new Date(inv.created_at);
        const diffDays = Math.floor((today.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
        return inv.status.toLowerCase() === 'pending' && diffDays > 15;
      });
    }

    return invoices;
  });

  public paginatedInvoices = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredInvoices().slice(startIndex, endIndex);
  });

  public totalPages = computed(() => 
    Math.ceil(this.filteredInvoices().length / this.itemsPerPage)
  );

  public totalRevenue = computed(() => {
    return this.filteredInvoices()
      .filter((inv: any) => inv.status.toLowerCase() === 'paid')
      .reduce((acc: number, inv: any) => acc + (Number(inv.base_amount) || 0), 0);
  });

  public totalPending = computed(() => {
    return this.filteredInvoices()
      .filter((inv: any) => inv.status.toLowerCase() === 'pending')
      .reduce((acc: number, inv: any) => acc + (Number(inv.base_amount) || 0), 0);
  });

  public totalCustomersCount = computed(() => {
    return this.customerService.customers().length;
  });

  public legacyCalculatedTotal = computed(() => {
    const baseAmount = this.invoiceService.amount();
    const taxRate = this.taxPercentage() / 100; 
    return baseAmount * (1 + taxRate);
  });

  private cashFlowChart: Chart | undefined;
  private customerChart: Chart | undefined;

  constructor() {
    effect(() => {
      this.filteredInvoices();
      this.selectedCurrency();
      this.isRiskFilterActive();
      this.statsService.revenueByCustomer();
      this.exchangeService.rates(); 
      this.logService.logs(); 
      
      if (this.cashFlowChart) this.updateChartData();
      if (this.customerChart) this.updateCustomerChart();
    });
  }

  ngOnInit(): void {
    this.refreshData();
  }

  ngAfterViewInit(): void {
    this.initChart();
    this.initCustomerChart();
  }

  private initChart(): void {
    const ctx = document.getElementById('cashFlowChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.cashFlowChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Cobrado', 'Pendiente'],
        datasets: [{
          label: `Monto`,
          data: [0, 0],
          backgroundColor: ['#10b981', '#f59e0b'],
          borderRadius: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  private initCustomerChart(): void {
    const ctx = document.getElementById('customerChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.customerChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#fb923c'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15 } },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const value = context.raw;
                return ` Total: $${value.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`;
              }
            }
          }
        },
        cutout: '70%'
      }
    });
  }

  private updateChartData(): void {
    if (!this.cashFlowChart) return;
    this.cashFlowChart.data.datasets[0].label = `Monto en ${this.selectedCurrency()}`;
    this.cashFlowChart.data.datasets[0].data = [this.totalRevenue(), this.totalPending()];
    this.cashFlowChart.update();
  }

  private updateCustomerChart(): void {
    if (!this.customerChart) return;
    const stats = this.statsService.revenueByCustomer();
    this.customerChart.data.labels = stats.labels;
    this.customerChart.data.datasets[0].data = stats.values;
    this.customerChart.update();
  }

  public toggleRiskFilter(): void {
    this.isRiskFilterActive.set(!this.isRiskFilterActive());
    this.currentPage.set(1);
  }

  public toggleMarket(): void {
    this.isMarketOpen.set(!this.isMarketOpen());
  }

  public toggleFiscal(): void {
    this.isFiscalOpen.set(!this.isFiscalOpen());
  }

  public toggleSubscriptionManager(): void {
    this.isAutoOpen.set(!this.isAutoOpen());
  }

  public toggleActivityLog(): void {
    this.isActivityOpen.set(!this.isActivityOpen());
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  onCurrencyChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedCurrency.set(select.value);
    this.isRiskFilterActive.set(false);
    this.currentPage.set(1);
  }

  onTaxChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.taxPercentage.set(Number(input.value));
  }

  onManualAmountChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.invoiceService.setAmount(input.value);
  }

  syncWithDB(): void {
    this.invoiceService.setAmount(this.totalRevenue());
  }

  applyExchangeToSimulator(rate: number): void {
    this.invoiceService.setAmount(rate);
    this.isFiscalOpen.set(true);
  }

  refreshData(): void {
    this.currentPage.set(1);
    this.isRiskFilterActive.set(false);
    this.invoiceService.fetchInvoices();
    this.customerService.getCustomers();
    this.exchangeService.fetchRates();
    this.logService.getRecentLogs(); 
  }
}