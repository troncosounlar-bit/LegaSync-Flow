export interface ActivityLog {
  id: string;
  created_at: string;
  type: 'success' | 'info' | 'warning';
  icon: string;
  message: string;
  user_id?: string;
}