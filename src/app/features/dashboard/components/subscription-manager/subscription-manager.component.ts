import { Component, input, Output, EventEmitter, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubscriptionService } from '../../../../core/services/subscription.service';
import { CustomerService } from '../../../../core/services/customer.service';
import { Subscription } from '../../../../core/models/subscription.model';

@Component({
  selector: 'app-subscription-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscription-manager.component.html',
  styleUrl: './subscription-manager.component.scss'
})
export class SubscriptionManagerComponent implements OnInit {
 
  public customerId = input<string | null>(null);
  
  @Output() subscriptionChanged = new EventEmitter<void>();

  private subService = inject(SubscriptionService);
  public customerService = inject(CustomerService);

  public subscriptions = signal<Subscription[]>([]);
  public isLoading = signal<boolean>(false);
  
  public isDashboardMode = computed(() => this.customerId() === null);

  
  public totalMonthly = computed(() => {
    return this.subscriptions()
      .filter(s => s.is_active === true)
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  });

  public activeCount = computed(() => 
    this.subscriptions().filter(s => s.is_active === true).length
  );

  public newSub = {
    service_name: '',
    amount: 0,
    currency_code: 'USD',
    interval: 'monthly' as 'monthly' | 'yearly',
    next_billing_date: new Date().toISOString().split('T')[0]
  };

  constructor() {
    effect(() => {
      this.loadSubscriptions();
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.loadSubscriptions();
  }


  async loadSubscriptions() {
    const currentId = this.customerId();
    this.isLoading.set(true);

    try {
      if (currentId) {
        this.subService.getSubscriptionsByCustomer(currentId).subscribe({
          next: (data) => {
            this.subscriptions.set(data);
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error('Error al cargar suscripciones del cliente:', err);
            this.isLoading.set(false);
          }
        });
      } else {
        const data = await this.subService.getAllActiveSubscriptions();
        this.subscriptions.set(data || []);
        this.isLoading.set(false);
      }
    } catch (error) {
      console.error('Error crítico en loadSubscriptions:', error);
      this.isLoading.set(false);
    }
  }

  async saveSubscription() {
    const finalCustomerId = this.customerId();

    if (!finalCustomerId || !this.newSub.service_name || this.newSub.amount <= 0) {
      alert('Por favor completa los campos obligatorios: Nombre y Monto.');
      return;
    }

    this.isLoading.set(true);

    const subData: Subscription = { 
      customer_id: finalCustomerId,
      service_name: this.newSub.service_name,
      amount: Number(this.newSub.amount),
      currency_code: this.newSub.currency_code,
      interval: this.newSub.interval,
      next_billing_date: this.newSub.next_billing_date,
      is_active: true
    };

    this.subService.addSubscription(subData).subscribe({
      next: () => {
        this.resetForm();
        this.loadSubscriptions(); 
        this.subscriptionChanged.emit(); 
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error al guardar suscripción (400 Bad Request?):', err);
        alert('Error al guardar: Verifique que todos los campos sean correctos.');
        this.isLoading.set(false);
      }
    });
  }

  
  deleteSub(id: string) {
    if (!confirm('¿Estás seguro de eliminar este abono?')) return;
    
    this.isLoading.set(true);
    this.subService.deleteSubscription(id).subscribe({
      next: () => {
        this.loadSubscriptions();
        this.subscriptionChanged.emit();
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error al eliminar:', err);
        this.isLoading.set(false);
      }
    });
  }

  
  public resetForm() {
    this.newSub = {
      service_name: '',
      amount: 0,
      currency_code: 'USD',
      interval: 'monthly',
      next_billing_date: new Date().toISOString().split('T')[0]
    };
  }
}