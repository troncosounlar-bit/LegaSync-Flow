import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ActivatedRoute } from '@angular/router';
import { InvoiceService } from '../../core/services/invoice.service';
import { CustomerService } from '../../core/services/customer.service';
import { BatchInvoiceService } from '../../core/services/batch-invoice.service'; 
import { Invoice } from '../../core/models/invoice.model';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.scss'
})
export class InvoicesComponent implements OnInit {
  public invoiceService = inject(InvoiceService);
  public customerService = inject(CustomerService);
  public batchService = inject(BatchInvoiceService);
  private route = inject(ActivatedRoute);

  public currentPage = signal(1);
  public itemsPerPage = 20;

  public paginatedInvoices = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.invoiceService.invoices().slice(startIndex, endIndex);
  });

  public totalPages = computed(() => 
    Math.ceil(this.invoiceService.invoices().length / this.itemsPerPage)
  );

  public showForm = signal(false);
  
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

  public newInvoice: Partial<Invoice> = {
    customer_name: '',
    base_amount: 0,
    currency_code: 'USD',
    status: 'pending'
  };

  ngOnInit(): void {
    this.customerService.getCustomers();

    this.route.queryParams.subscribe(params => {
      const filter = params['filter'];
      this.invoiceService.getInvoices(filter);
      
      if (filter) {
        this.newInvoice.customer_name = filter;
      }
    });
  }

  async onRunBatch() {
    try {
      this.invoiceService.generateMonthlyBatch().subscribe({
        next: () => {
          this.currentPage.set(1);
        },
        error: (err) => {
          console.error('Error en el proceso por lotes:', err);
          alert("❌ Error al procesar la facturación mensual.");
        }
      });
    } catch (error) {
      console.error('Error inesperado:', error);
    }
  }


  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      const tableSection = document.querySelector('.table-section');
      tableSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  async saveInvoice() {
    const clientName = this.newInvoice.customer_name?.trim() || '';
    const amount = Number(this.newInvoice.base_amount);
    const currency = this.newInvoice.currency_code || 'USD';

    const customerExists = this.customerService.customers().some(
      c => c.company.toLowerCase() === clientName.toLowerCase()
    );

    if (!customerExists) {
      alert(`❌ Error de LegaSync: La empresa "${clientName}" no existe en el Directorio.`);
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      alert('❌ Error: El monto base debe ser mayor a 0.');
      return;
    }

    try {
      const invoiceToSave = {
        customer_name: clientName,
        base_amount: amount,
        currency_code: currency,
        status: this.newInvoice.status || 'pending'
      };

      await this.invoiceService.createInvoice(invoiceToSave);
      
      this.showForm.set(false);
      this.resetForm();
      this.currentPage.set(1);
      
      await this.invoiceService.getInvoices();
      
      alert(`✅ Factura guardada correctamente en ${currency} para ${clientName}`);
    } catch (error) {
      console.error('Error en saveInvoice:', error);
      alert('❌ Error de base de datos: La columna fiscal_status no existe o hay un problema de red.');
    }
  }


  async deleteInvoice(id: string | undefined) {
    if (!id) return;
    
    const confirmDelete = confirm('⚠️ ¿Está seguro? Esta acción eliminará el registro financiero de forma permanente.');
    
    if (confirmDelete) {
      try {
        await this.invoiceService.deleteInvoice(id);
        
        if (this.paginatedInvoices().length === 0 && this.currentPage() > 1) {
          this.currentPage.update(p => p - 1);
        }
      } catch (error) {
        alert('❌ Error al intentar eliminar el registro.');
      }
    }
  }

  private resetForm() {
    this.newInvoice = {
      customer_name: '',
      base_amount: 0,
      currency_code: 'USD',
      status: 'pending'
    };
  }
}