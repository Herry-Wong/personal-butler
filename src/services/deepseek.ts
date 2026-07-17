import type { ExerciseAction, DailySchedule, ChatMessage } from '../types';

const API_URL = 'https://api.deepseek.com/v1/chat/completions';

const ASSISTANT_SYSTEM_PROMPT = `你是一个贴心的个人AI管家，能够直接操作用户的任务管理、健康记录等所有功能。

你可以通过以下工具直接操作用户的应用，不需要用户手动操作：

## 可用工具

### create_task - 创建新任务
参数：
- title: 任务标题（必填）
- description: 任务描述（可选，默认空）
- category: 分类，可选 "work"、"life"、"study"、"other"（默认 "life"）
- priority: 优先级，可选 "high"、"medium"、"low"（默认 "medium"）
- dueDate: 截止日期，格式 "YYYY-MM-DDTHH:mm"（如 "2026-07-18T15:00"），默认今天
- repeat: 重复，可选 "none"、"daily"、"weekly"、"monthly"（默认 "none"）
- reminderEnabled: 是否提醒，true/false（默认 true）

### update_task - 编辑任务
参数：
- id: 任务ID（必填）
- title: 新标题
- description: 新描述
- category: 新分类
- priority: 新优先级
- dueDate: 新截止日期
- repeat: 新重复设置
- reminderEnabled: 新提醒设置

### delete_task - 删除任务
参数：
- id: 任务ID（必填）

### add_health_record - 添加健康记录
参数：
- type: 类型，可选 "water"、"exercise"、"sleep"、"weight"
- value: 数值（必填）
- unit: 单位（"ml"、"分钟"、"小时"、"kg"）
- date: 日期，格式 "YYYY-MM-DD"（默认今天）
- note: 备注（可选）

### get_tasks - 查看任务
无需参数，返回当前任务列表

### get_health_records - 查看健康记录
无需参数，返回当前健康记录

## 使用方式

当用户请求你执行操作时，在回复中使用此格式：

[TOOL:工具名]
{JSON参数，一行}
[/TOOL]

示例 - 用户说"帮我创建明天下午3点的会议"：
好的，我来帮你创建！
[TOOL:create_task]
{"title": "会议", "category": "work", "priority": "high", "dueDate": "2026-07-18T15:00", "reminderEnabled": true}
[/TOOL]

## 重要规则

- 用户请求操作时，必须直接执行，不要只说"你可以手动操作"
- 先执行操作再回复，用户看不到工具调用过程
- 如果用户想查看任务/健康记录，使用 get_tasks / get_health_records
- 删除任务前要确认
- 日期默认用当前年份 2026

你的风格：简洁、温暖、像朋友一样，适当使用emoji。
注意：你只是AI助手，不能替代医生。`;

interface ChatParams {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
}

export async function chatWithAI({ messages, apiKey, temperature = 0.7, maxTokens = 2000 }: ChatParams): Promise<string> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('API 返回内容为空');
  }

  return content;
}

export function buildAssistantMessages(history: ChatMessage[], userMessage: string) {
  const recentHistory = history.slice(-20);
  return [
    { role: 'system' as const, content: ASSISTANT_SYSTEM_PROMPT },
    ...recentHistory.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user' as const, content: userMessage },
  ];
}

// ====== 工具调用解析和执行 ======

export interface ToolCall {
  tool: string;
  params: Record<string, unknown>;
}

export interface ToolResult {
  success: boolean;
  message: string;
}

export function parseToolCalls(response: string): { text: string; toolCalls: ToolCall[] } {
  const toolCalls: ToolCall[] = [];
  const text = response.replace(/\[TOOL:(\w+)\]\n?([\s\S]*?)\n?\[\/TOOL\]/g, (_, tool, paramsStr) => {
    try {
      const params = JSON.parse(paramsStr.trim());
      toolCalls.push({ tool, params });
    } catch {
      // 忽略解析失败的工具调用
    }
    return '';
  });
  return { text: text.trim(), toolCalls };
}

export type ToolExecutor = (toolCall: ToolCall) => ToolResult;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TaskList = Array<Record<string, any>>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TaskInput = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TaskUpdates = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HealthRecordInput = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HealthRecordList = Array<Record<string, any>>;

export function createToolExecutor(
  getTasks: () => TaskList,
  addTask: (task: TaskInput) => void,
  updateTask: (id: string, updates: TaskUpdates) => void,
  deleteTask: (id: string) => void,
  addHealthRecord: (record: HealthRecordInput) => void,
  getHealthRecords: () => HealthRecordList,
): ToolExecutor {
  return (toolCall: ToolCall): ToolResult => {
    const { tool, params } = toolCall;

    try {
      switch (tool) {
        case 'create_task': {
          const title = params.title as string;
          if (!title) return { success: false, message: '任务标题不能为空' };

          const today = new Date().toISOString().slice(0, 10);
          const dueDate = (params.dueDate as string) || `${today}T18:00`;
          const dueDateTime = dueDate.includes('T') ? new Date(dueDate).toISOString() : new Date(`${dueDate}T18:00`).toISOString();

          addTask({
            title,
            description: (params.description as string) || '',
            category: (params.category as string) || 'life',
            priority: (params.priority as string) || 'medium',
            dueDate: dueDateTime,
            isCompleted: false,
            repeat: (params.repeat as string) || 'none',
            reminderEnabled: params.reminderEnabled !== false,
          });

          return { success: true, message: `已创建任务「${title}」` };
        }

        case 'update_task': {
          const id = params.id as string;
          if (!id) return { success: false, message: '缺少任务ID' };

          const updates: Record<string, unknown> = {};
          if (params.title !== undefined) updates.title = params.title;
          if (params.description !== undefined) updates.description = params.description;
          if (params.category !== undefined) updates.category = params.category;
          if (params.priority !== undefined) updates.priority = params.priority;
          if (params.dueDate !== undefined) {
            const dd = params.dueDate as string;
            updates.dueDate = dd.includes('T') ? new Date(dd).toISOString() : new Date(`${dd}T18:00`).toISOString();
          }
          if (params.repeat !== undefined) updates.repeat = params.repeat;
          if (params.reminderEnabled !== undefined) updates.reminderEnabled = params.reminderEnabled;

          updateTask(id, updates);
          return { success: true, message: `已更新任务` };
        }

        case 'delete_task': {
          const id = params.id as string;
          if (!id) return { success: false, message: '缺少任务ID' };
          deleteTask(id);
          return { success: true, message: `已删除任务` };
        }

        case 'add_health_record': {
          const type = params.type as string;
          const value = Number(params.value);
          const unit = params.unit as string;
          if (!type || isNaN(value) || !unit) {
            return { success: false, message: '缺少必要参数 (type, value, unit)' };
          }

          const today = new Date().toISOString().slice(0, 10);
          addHealthRecord({
            type,
            value,
            unit,
            date: (params.date as string) || today,
            note: (params.note as string) || undefined,
          });

          return { success: true, message: `已记录${unit === 'ml' ? '饮水' : unit === '分钟' ? '运动' : unit === '小时' ? '睡眠' : '体重'} ${value}${unit}` };
        }

        case 'get_tasks': {
          const tasks = getTasks();
          if (tasks.length === 0) return { success: true, message: '当前没有任务' };
          const list = tasks.map((t) => {
            const status = t.isCompleted ? '✅' : '○';
            const due = t.dueDate ? new Date(t.dueDate).toLocaleString('zh-CN') : '无';
            return `${status} [${t.id.slice(0, 6)}] ${t.title} - ${t.category}/${t.priority} - ${due}`;
          }).join('\n');
          return { success: true, message: `当前任务列表:\n${list}` };
        }

        case 'get_health_records': {
          const records = getHealthRecords();
          if (records.length === 0) return { success: true, message: '当前没有健康记录' };
          const list = records.slice(0, 20).map((r) =>
            `- ${r.date}: ${r.type} ${r.value}${r.unit}${r.note ? ` (${r.note})` : ''}`
          ).join('\n');
          return { success: true, message: `最近健康记录:\n${list}` };
        }

        default:
          return { success: false, message: `未知工具: ${tool}` };
      }
    } catch (err) {
      return { success: false, message: `执行失败: ${err instanceof Error ? err.message : '未知错误'}` };
    }
  };
}

interface GeneratePlanParams {
  problem: string;        // 用户描述的问题
  severity: string;       // 严重程度
  duration: string;       // 每次可用时间
  apiKey: string;
}

interface AIGeneratedPlan {
  title: string;
  description: string;
  weekCount: number;
  actions: Array<{
    name: string;
    description: string;
    sets: number;
    reps: number;
    duration?: number;
    notes?: string;
  }>;
  dailySchedule: Array<{
    time: string;
    actionNames: string[];
  }>;
}

/**
 * 调用 DeepSeek API 生成健康锻炼计划
 */
export async function generateHealthPlan({
  problem,
  severity,
  duration,
  apiKey,
}: GeneratePlanParams): Promise<{
  title: string;
  description: string;
  weekCount: number;
  actions: ExerciseAction[];
  dailySchedule: DailySchedule[];
}> {
  const systemPrompt = `你是一位专业的康复理疗师和健身教练。根据用户的健康问题，生成一份个性化的锻炼计划。

要求：
1. 动作要安全、有效、适合用户描述的严重程度
2. 计划要考虑用户每次可用的时间
3. 动作描述要清晰，包含具体组数、次数或时长
4. 每日时间安排要合理（建议 1-3 个时间点）
5. 必须返回 JSON 格式

返回格式（严格 JSON，不要 markdown）：
{
  "title": "计划标题",
  "description": "计划描述（1-2句话说明目的）",
  "weekCount": 4,
  "actions": [
    {
      "name": "动作名称",
      "description": "动作要领描述",
      "sets": 3,
      "reps": 15,
      "duration": 30,
      "notes": "注意事项"
    }
  ],
  "dailySchedule": [
    {
      "time": "07:00",
      "actionNames": ["动作名称1", "动作名称2"]
    }
  ]
}`;

  const userPrompt = `我的问题：${problem}
严重程度：${severity}
每次可用时间：${duration}

请为我生成一份锻炼计划。`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('API 返回内容为空');
  }

  let parsed: AIGeneratedPlan;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('AI 返回的内容格式不正确，请重试');
  }

  // 转换为应用内部数据结构
  const generateId = () => Math.random().toString(36).substring(2, 11);

  const actions: ExerciseAction[] = parsed.actions.map((a) => ({
    id: generateId(),
    name: a.name,
    description: a.description,
    sets: a.sets,
    reps: a.reps,
    duration: a.duration,
    notes: a.notes,
  }));

  // 建立 actionName -> actionId 映射
  const nameToId = new Map<string, string>();
  actions.forEach((a) => nameToId.set(a.name, a.id));

  const dailySchedule: DailySchedule[] = parsed.dailySchedule.map((s) => ({
    time: s.time,
    actionIds: s.actionNames
      .map((name) => nameToId.get(name))
      .filter((id): id is string => !!id),
  }));

  return {
    title: parsed.title,
    description: parsed.description,
    weekCount: parsed.weekCount,
    actions,
    dailySchedule,
  };
}
