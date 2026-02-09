import { Injectable, signal } from '@angular/core';
import { supabase } from '../supabase.client';
import { ActivityLog } from '../models/activity-log.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {
  public logs = signal<ActivityLog[]>([]);

  async getRecentLogs() {
    const { data, error } = await supabase
      .from('dashboard_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) this.logs.set(data);
  }

  async addLog(log: Omit<ActivityLog, 'id' | 'created_at'>) {
    const { error } = await supabase.from('dashboard_logs').insert([log]);
    if (!error) await this.getRecentLogs();
  }
}