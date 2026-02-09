import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

export interface DolarValue {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number | null;
  venta: number;
  fechaActualizacion: string;
}

@Injectable({ providedIn: 'root' })
export class ExchangeService {
  private http = inject(HttpClient);
  
  public rates = signal<DolarValue[]>([]);
  public loading = signal(false);

  constructor() {
    this.fetchRates();
  }

  public fetchRates() {
    this.loading.set(true);
    
    this.http.get<DolarValue[]>('https://dolarapi.com/v1/dolares')
      .pipe(
        map(data => {
          const nombresMap: Record<string, string> = {
            'oficial': 'Dólar Oficial',
            'blue': 'Dólar Blue',
            'bolsa': 'Dólar MEP',
            'contadoconliqui': 'Dólar CCL',
            'tarjeta': 'Dólar Tarjeta'
          };

          return data
            .filter(rate => nombresMap[rate.casa]) 
            .map(rate => ({
              ...rate,
              nombre: nombresMap[rate.casa] 
            }))
            .sort((a, b) => {
              const orden = ['oficial', 'blue', 'bolsa', 'contadoconliqui', 'tarjeta'];
              return orden.indexOf(a.casa) - orden.indexOf(b.casa);
            });
        })
      )
      .subscribe({
        next: (data) => {
          this.rates.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error fetching exchange rates:', err);
          this.loading.set(false);
        }
      });
  }

  public getRateByCasa(casa: string) {
    return this.rates().find(r => r.casa === casa);
  }
}