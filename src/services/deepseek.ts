import type { ExerciseAction, DailySchedule, ChatMessage } from '../types';

const API_URL = 'https://api.deepseek.com/v1/chat/completions';

const ASSISTANT_SYSTEM_PROMPT = `你是一个贴心的个人AI管家，帮助用户管理日常生活、工作任务和身体健康。

你的能力：
1. 任务管理：帮用户规划任务、提醒事项、时间管理建议
2. 健康管理：提供健康建议、锻炼指导、饮食建议、睡眠改善
3. 生活建议：效率提升、习惯养成、压力缓解
4. 工作辅助：会议安排、优先级排序、专注技巧

你的风格：
- 简洁明了，不说废话
- 温暖贴心，像朋友一样
- 给出具体可执行的建议，不是空泛的道理
- 适当使用emoji让回复更生动，但不要太多
- 如果用户问健康相关的具体问题，给出专业但易懂的建议
- 如果用户说腰痛、颈椎痛等具体症状，先建议放松动作，再建议就医

注意：你只是AI助手，不能替代医生。严重健康问题请建议用户就医。`;

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
