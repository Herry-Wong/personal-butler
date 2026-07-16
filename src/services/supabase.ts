import { createClient } from '@supabase/supabase-js';
import type {
  Task,
  HealthRecord,
  ChatMessage,
  HealthPlan,
  AppSettings,
} from '../types';

const SUPABASE_URL = 'https://vldfysdjfbghthbeihzb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LaYO0vJ-HZEf6RmTfxRC7w_ttLPydFj';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type {
  Task,
  HealthRecord,
  ChatMessage,
  HealthPlan,
  AppSettings,
};

export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

export async function syncTasksFromCloud(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('同步任务失败:', error);
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description || '',
    category: item.category,
    priority: item.priority,
    dueDate: item.due_date,
    isCompleted: item.is_completed,
    repeat: item.repeat,
    reminderEnabled: item.reminder_enabled,
    createdAt: item.created_at,
    reminded: item.reminded,
  }));
}

export async function syncTasksToCloud(userId: string, tasks: Task[]): Promise<void> {
  if (tasks.length === 0) {
    await supabase.from('tasks').delete().eq('user_id', userId);
    return;
  }

  const { error } = await supabase.from('tasks').upsert(
    tasks.map((t) => ({
      id: t.id,
      user_id: userId,
      title: t.title,
      description: t.description,
      category: t.category,
      priority: t.priority,
      due_date: t.dueDate,
      is_completed: t.isCompleted,
      repeat: t.repeat,
      reminder_enabled: t.reminderEnabled,
      reminded: t.reminded,
      created_at: t.createdAt,
    })),
    { onConflict: 'id' }
  );

  if (error) {
    console.error('同步任务到云端失败:', error);
    throw error;
  }
}

export async function syncHealthRecordsFromCloud(userId: string): Promise<HealthRecord[]> {
  const { data, error } = await supabase
    .from('health_records')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('同步健康记录失败:', error);
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    type: item.type,
    value: item.value,
    unit: item.unit,
    date: item.date,
    note: item.note,
    createdAt: item.created_at,
  }));
}

export async function syncHealthRecordsToCloud(userId: string, records: HealthRecord[]): Promise<void> {
  if (records.length === 0) {
    await supabase.from('health_records').delete().eq('user_id', userId);
    return;
  }

  const { error } = await supabase.from('health_records').upsert(
    records.map((r) => ({
      id: r.id,
      user_id: userId,
      type: r.type,
      value: r.value,
      unit: r.unit,
      date: r.date,
      note: r.note,
      created_at: r.createdAt,
    })),
    { onConflict: 'id' }
  );

  if (error) {
    console.error('同步健康记录到云端失败:', error);
    throw error;
  }
}

export async function syncHealthPlansFromCloud(userId: string): Promise<HealthPlan[]> {
  const { data, error } = await supabase
    .from('health_plans')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('同步健康计划失败:', error);
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    problem: item.problem,
    title: item.title,
    description: item.description,
    weekCount: item.week_count,
    currentWeek: item.current_week,
    actions: item.actions,
    dailySchedule: item.daily_schedule,
    status: item.status,
    createdAt: item.created_at,
  }));
}

export async function syncHealthPlansToCloud(userId: string, plans: HealthPlan[]): Promise<void> {
  if (plans.length === 0) {
    await supabase.from('health_plans').delete().eq('user_id', userId);
    return;
  }

  const { error } = await supabase.from('health_plans').upsert(
    plans.map((p) => ({
      id: p.id,
      user_id: userId,
      problem: p.problem,
      title: p.title,
      description: p.description,
      week_count: p.weekCount,
      current_week: p.currentWeek,
      actions: p.actions,
      daily_schedule: p.dailySchedule,
      status: p.status,
      created_at: p.createdAt,
    })),
    { onConflict: 'id' }
  );

  if (error) {
    console.error('同步健康计划到云端失败:', error);
    throw error;
  }
}

export async function syncSettingsFromCloud(userId: string): Promise<AppSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('同步设置失败:', error);
    }
    return null;
  }

  return {
    theme: data.theme,
    notificationEnabled: data.notification_enabled,
    deepseekApiKey: data.deepseek_api_key,
  };
}

export async function syncSettingsToCloud(userId: string, settings: AppSettings): Promise<void> {
  const { error } = await supabase.from('user_settings').upsert(
    {
      user_id: userId,
      theme: settings.theme,
      notification_enabled: settings.notificationEnabled,
      deepseek_api_key: settings.deepseekApiKey,
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    console.error('同步设置到云端失败:', error);
    throw error;
  }
}

export async function syncAllFromCloud(userId: string): Promise<{
  tasks: Task[];
  healthRecords: HealthRecord[];
  healthPlans: HealthPlan[];
  settings: AppSettings | null;
}> {
  const [tasks, healthRecords, healthPlans, settings] = await Promise.all([
    syncTasksFromCloud(userId),
    syncHealthRecordsFromCloud(userId),
    syncHealthPlansFromCloud(userId),
    syncSettingsFromCloud(userId),
  ]);

  return { tasks, healthRecords, healthPlans, settings };
}

export async function syncAllToCloud(userId: string, state: {
  tasks: Task[];
  healthRecords: HealthRecord[];
  healthPlans: HealthPlan[];
  settings: AppSettings;
}): Promise<void> {
  await Promise.all([
    syncTasksToCloud(userId, state.tasks),
    syncHealthRecordsToCloud(userId, state.healthRecords),
    syncHealthPlansToCloud(userId, state.healthPlans),
    syncSettingsToCloud(userId, state.settings),
  ]);
}
