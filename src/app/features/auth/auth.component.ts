import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  
  public isLogin = signal(true);
  public isLoading = signal(false);
  public email = '';
  public password = '';
  public errorMessage = signal<string | null>(null);


  toggleMode() {
    this.isLogin.set(!this.isLogin());
    this.errorMessage.set(null);
  }

  async handleSubmit(event: Event) {
    event.preventDefault();
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const { data, error } = this.isLogin() 
        ? await this.authService.signIn(this.email, this.password)
        : await this.authService.signUp(this.email, this.password);

      if (error) throw error;

      
      if (data.user) {
        this.router.navigate(['/dashboard']);
      }
    } catch (err: any) {
      
      const msg = err.message === 'Invalid login credentials' 
        ? 'Credenciales inválidas. Revisa tu email y contraseña.' 
        : err.message;
      this.errorMessage.set(msg);
    } finally {
      this.isLoading.set(false);
    }
  }
}