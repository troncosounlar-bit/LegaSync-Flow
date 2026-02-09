import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environment/environment';

export const supabase = createClient(
  environment.supabaseUrl.trim(),
  environment.supabaseKey.trim(),
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      
      storage: window.localStorage,
      
      storageKey: 'legasync-flow-auth',
      
      
      lock: async <R>(name: string, acquireTimeout: number, fn: () => Promise<R>): Promise<R> => {
        return await fn();
      }
    }
  }
);