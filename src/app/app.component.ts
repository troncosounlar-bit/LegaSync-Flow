import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
 
  public router = inject(Router); 
  private authService = inject(AuthService);
  
  title = 'LegaSync Flow';


  private navEvent = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map((event: any) => event.urlAfterRedirects)
    )
  );


  public isAuthPage = computed(() => {
    const url = this.navEvent() || '';
    return url.includes('/auth');
  });


  public currentSection = computed(() => {
    const url = this.navEvent() || '';
    if (url.includes('dashboard')) return 'Panel Central / Dashboard';
    if (url.includes('customers')) return 'Gestión de Directorio / Clientes';
    if (url.includes('invoices')) return 'Administración Financiera / Facturación';
    return 'Panel Central';
  });

 
  onLogout() {
    this.authService.signOut();
  }
}