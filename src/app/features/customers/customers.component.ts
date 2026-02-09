import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterLink } from '@angular/router';
import { CustomerService } from '../../core/services/customer.service';
import { ExportService } from '../../core/services/export.service'; 
import { ExpenseService } from '../../core/services/expense.service';
import { SubscriptionService } from '../../core/services/subscription.service'; 
import { Customer, CustomerStatus } from '../../core/models/customer.model';
import { Expense } from '../../core/models/expense.model';
import { Subscription } from '../../core/models/subscription.model'; 


import { SubscriptionManagerComponent } from '../dashboard/components/subscription-manager/subscription-manager.component';


import { 
  CdkDragDrop, 
  moveItemInArray, 
  transferArrayItem, 
  CdkDropListGroup, 
  CdkDropList, 
  CdkDrag 
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    FormsModule, 
    CdkDropListGroup, 
    CdkDropList, 
    CdkDrag,
    SubscriptionManagerComponent 
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent implements OnInit {
  public customerService = inject(CustomerService);
  private exportService = inject(ExportService);
  private expenseService = inject(ExpenseService); 
  private subscriptionService = inject(SubscriptionService); 
  private router = inject(Router);

  public currentView = signal<'table' | 'kanban'>('table'); 
  public showForm = signal(false);
  public Math = Math;

  public selectedCustomer = signal<Customer | null>(null);
  public isDrawerOpen = signal(false);
  public isSavingNotes = signal(false);

  public expenses = signal<Expense[]>([]);
  public activeSubscriptions = signal<Subscription[]>([]); 

  public newExpense = {
    description: '',
    vendor: '',
    amount: null as number | null,
    date: new Date().toISOString().split('T')[0],
    category: 'operativo'
  };

  public totalExpenses = computed(() => 
    this.expenses().reduce((acc, exp) => acc + Number(exp.amount || 0), 0)
  );

  public profitMargin = computed(() => {
    const revenue = this.selectedCustomer()?.deal_value || 0;
    const totalExp = this.totalExpenses();
    
    const recurringRevenue = this.activeSubscriptions()
      .filter(s => s.is_active)
      .reduce((acc, sub) => acc + Number(sub.amount || 0), 0);

    return revenue + recurringRevenue - totalExp;
  });

  public columns: { id: CustomerStatus; title: string; icon: string }[] = [
    { id: 'prospect', title: 'Comprador', icon: '🚀' },
    { id: 'negotiation', title: 'Negociación', icon: '🤝' },
    { id: 'closed', title: 'Ganados', icon: '✅' },
    { id: 'lost', title: 'Perdidos', icon: '❌' }
  ];

  public getCustomersByStatus(status: CustomerStatus) {
    return this.customerService.customers().filter(c => c.status === status);
  }

  public currentPage = signal(1);
  public itemsPerPage = 20;

  public paginatedCustomers = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.customerService.customers().slice(startIndex, endIndex);
  });

  public totalPages = computed(() => 
    Math.ceil(this.customerService.customers().length / this.itemsPerPage)
  );

  public newCustomer: Partial<Customer> = {
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'prospect',
    deal_value: 0,
    priority: 'medium',
    activity_log: [] 
  };

  ngOnInit(): void {
    this.customerService.getCustomers();
    const savedView = localStorage.getItem('nexus_view_pref') as 'table' | 'kanban';
    if (savedView) {
      this.currentView.set(savedView);
    }
  }

  public toggleView(view: 'table' | 'kanban') {
    this.currentView.set(view);
    localStorage.setItem('nexus_view_pref', view);
  }

  public openCustomerDetails(customer: Customer) {
    this.selectedCustomer.set({ ...customer });
    this.isDrawerOpen.set(true);
    if (customer.id) {
        this.loadExpenses(customer.id);
        this.loadActiveSubscriptions(customer.id); 
    }
    this.resetExpenseForm(); 
  }

  public loadActiveSubscriptions(customerId: string) {
    this.subscriptionService.getSubscriptionsByCustomer(customerId).subscribe(subs => {
      this.activeSubscriptions.set(subs);
    });
  }

  public openBillingForCustomer(customer: Customer) {
    if (!customer.company) {
      alert('⚠️ Este cliente no tiene una empresa asignada para filtrar.');
      return;
    }
    this.router.navigate(['/invoices'], { 
      queryParams: { filter: customer.company } 
    });
  }

  public closeDrawer() {
    this.isDrawerOpen.set(false);
    this.selectedCustomer.set(null);
    this.expenses.set([]); 
    this.activeSubscriptions.set([]); 
  }

  async loadExpenses(customerId: string) {
    try {
        const { data, error } = await this.expenseService.getExpensesByCustomer(customerId);
        if (data) {
          this.expenses.set(data);
        }
    } catch (err) {
        console.error("Error al cargar gastos:", err);
    }
  }

  async addExpense() {
    const customer = this.selectedCustomer();
    const { description, amount, vendor, date, category } = this.newExpense;

    if (!customer?.id) {
      alert('❌ Error: No se ha detectado el ID del cliente.');
      return;
    }

    if (!description?.trim() || !amount || amount <= 0 || !vendor?.trim()) {
      alert('⚠️ Por favor completa los campos: Descripción, Monto (mayor a 0) y Proveedor.');
      return;
    }

    const newExp: Expense = {
      customer_id: customer.id,
      description: description.trim(),
      amount: Number(amount),
      vendor: vendor.trim(),
      category: category,
      date: date || new Date().toISOString()
    };

    try {
        const { data, error } = await this.expenseService.addExpense(newExp);
        
        if (error) {
            console.error("Error detallado de la base de datos:", error);
            alert(`Error de LegaSync: ${error.message || 'No se pudo registrar el gasto'}`);
            return;
        }

        if (data && data.length > 0) {
          this.expenses.update(current => [data[0], ...current]);
          this.resetExpenseForm();
        } else {
          await this.loadExpenses(customer.id);
          this.resetExpenseForm();
        }
    } catch (err) {
        console.error("Error crítico en addExpense:", err);
        alert('Ocurrió un error inesperado al conectar con el servidor.');
    }
  }

  private resetExpenseForm() {
    this.newExpense = {
      description: '',
      vendor: '',
      amount: null,
      date: new Date().toISOString().split('T')[0],
      category: 'operativo'
    };
  }

  async deleteExpense(id: string) {
    if (!confirm('¿Eliminar este gasto del balance?')) return;
    
    const { error } = await this.expenseService.deleteExpense(id);
    if (!error) {
      this.expenses.update(current => current.filter(e => e.id !== id));
    } else {
        alert('No se pudo eliminar el gasto.');
    }
  }

  public generatePDF() {
    const customer = this.selectedCustomer();
    if (!customer) return;

    const projectExpenses = this.expenses();
    const projectSubscriptions = this.activeSubscriptions(); 
    const totalValue = customer.deal_value || 0;
    const totalExp = this.totalExpenses();
    const margin = this.profitMargin();

    this.exportService.exportCustomerPDF(customer, {
      appName: 'LegaSync Flow',
      expenses: projectExpenses,
      subscriptions: projectSubscriptions, 
      financials: {
        totalValue,
        totalExpenses: totalExp,
        netBalance: margin
      },
      footerText: 'Generado automáticamente por LegaSync Flow CRM Engine'
    });
  }

  async saveNotes() {
    const customer = this.selectedCustomer();
    if (!customer || !customer.id) return;

    this.isSavingNotes.set(true);
    const newLog = {
      action: 'Nota de seguimiento actualizada',
      date: new Date().toISOString()
    };
    const updatedLog = [...(customer.activity_log || []), newLog];

    try {
      await this.customerService.updateCustomer(customer.id, { 
        notes: customer.notes,
        activity_log: updatedLog
      });
      this.selectedCustomer.set({ ...customer, activity_log: updatedLog });
      await this.customerService.getCustomers();
      alert('✅ Notas actualizadas.');
    } catch (error) {
      alert('❌ Error al guardar.');
    } finally {
      this.isSavingNotes.set(false);
    }
  }

  async drop(event: CdkDragDrop<Customer[]>, newStatus: CustomerStatus) {
    if (event.previousContainer === event.container && event.previousIndex === event.currentIndex) {
      return;
    }

    const customer = event.previousContainer.data[event.previousIndex];
    const oldStatus = customer.status;
    const newLog = {
      action: `Pipeline: de ${oldStatus.toUpperCase()} a ${newStatus.toUpperCase()}`,
      date: new Date().toISOString()
    };
    const updatedLog = [...(customer.activity_log || []), newLog];

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      customer.status = newStatus;
      customer.activity_log = updatedLog;
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    try {
      await this.customerService.updateCustomer(customer.id!, { 
        status: newStatus,
        activity_log: updatedLog 
      });
    } catch (error) {
      console.error('⚠️ Error sincronización:', error);
      this.customerService.getCustomers(); 
    }
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  viewInvoices(companyName: string) {
    if (!companyName) return;
    this.router.navigate(['/invoices'], { 
      queryParams: { filter: companyName } 
    });
  }

  async saveCustomer() {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (this.newCustomer.email && !emailRegex.test(this.newCustomer.email)) {
      alert('❌ Email no válido.');
      return;
    }
    if (!this.newCustomer.name?.trim() || !this.newCustomer.company?.trim()) {
      alert('⚠️ Nombre y Empresa obligatorios.');
      return;
    }

    try {
      this.newCustomer.activity_log = [{
        action: 'Cliente registrado en LegaSync Flow',
        date: new Date().toISOString()
      }];

      await this.customerService.createCustomer(this.newCustomer);
      this.showForm.set(false);
      this.resetForm();
      this.currentPage.set(1); 
      alert('✅ Cliente registrado.');
    } catch (error: any) {
      alert('❌ Error al guardar.');
    }
  }

  async deleteCustomer(id: string) {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        await this.customerService.deleteCustomer(id);
      } catch (error) {
        alert('❌ No se pudo eliminar.');
      }
    }
  }

  private resetForm() {
    this.newCustomer = { 
      name: '', company: '', email: '', phone: '',
      status: 'prospect', deal_value: 0, priority: 'medium',
      activity_log: []
    };
  }
}