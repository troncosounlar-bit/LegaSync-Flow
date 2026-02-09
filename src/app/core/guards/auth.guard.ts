import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { supabase } from '../supabase.client';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const { data } = await supabase.auth.getSession();

  if (data.session) {
    return true;
  } else {
    router.navigate(['/auth']);
    return false;
  }
};