import { inject, Injectable, signal } from '@angular/core';
import { supabase } from '../supabase.client';
import { Router } from '@angular/router';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  public currentUser = signal<User | null>(null);

  constructor() {
    this.checkSession();

    supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser.set(session?.user ?? null);
      if (event === 'SIGNED_OUT') {
        this.router.navigate(['/auth']);
      }
    });
  }

  async checkSession() {
    const { data } = await supabase.auth.getSession();
    this.currentUser.set(data.session?.user ?? null);
  }

  async signUp(email: string, password: string) {
    return await supabase.auth.signUp({ email, password });
  }

  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    await supabase.auth.signOut();
    this.router.navigate(['/auth']);
  }
}