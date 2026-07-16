# 个人管家AI 应用 - 开发提示词

## 项目背景

我要开发一款个人成长体系应用，目标是解决"列了任务但很难去做"的痛点。使用者是团队领导，工作忙碌，经常被打断，难以专注，同时有骨盆前倾等健康问题影响注意力。需要三端使用（手机、电脑、网页）。

## 核心痛点

1. **任务执行困难**：用苹果提醒事项列了很多任务，也设了时间提醒，但提醒时刚好有事就没做，偶尔补做打勾
2. **注意力难集中**：作为领导经常被打断，打断后难以恢复，精神难集中
3. **健康影响工作**：骨盆前倾、腰痛等健康问题持续消耗注意力
4. **任务碎片化**：整天救火，重要的事被挤掉，缺乏优先级和时间盒

## 目标用户画像

- 团队领导，工作忙碌
- 每天基本都在工作，但经常被打断
- 有多个领域的任务：健康（骨盆前倾锻炼、脸型锻炼、眼神锻炼）、工作（发报价、做规划等）
- 需要三端使用：iPhone 14 Pro Max、电脑、网页
- 希望应用能灵活应对个人健康问题，生成个性化锻炼计划

## 技术栈

- React 18 + TypeScript + Vite 6
- TailwindCSS 3（自定义颜色、动画、字体）
- Zustand（状态管理 + localStorage 持久化）
- React Router 7（HashRouter，适配 GitHub Pages）
- Recharts（健康数据趋势图表）
- Framer Motion（动画效果）
- Lucide React（图标库）
- vite-plugin-pwa（PWA 支持）
- DeepSeek API（AI 健康计划生成）

## 部署目标

- GitHub Pages 静态托管
- PWA（渐进式 Web 应用），支持添加到主屏幕、离线使用
- 三端可用：手机、电脑、网页
- iPhone 14 Pro Max 移动端完美适配（含 safe-area）

## 功能模块

### 1. 任务定时提醒

- 任务 CRUD（创建、编辑、删除、完成）
- 分类：工作、生活、学习、其他
- 优先级：高、中、低
- 重复：不重复、每天、每周、每月
- 定时提醒（到点弹窗 + 浏览器通知）
- 响应式布局（桌面侧边栏 + 移动底部导航）

### 2. 个人健康管家

#### 2.1 基础健康数据记录
- 四大指标：饮水、运动、睡眠、体重
- 快速记录按钮
- 趋势图表（7天/30天）
- 健康建议卡片

#### 2.2 AI 健康计划生成器（核心功能）
- 用户描述健康问题（如"骨盆前倾，腰痛"）
- 选择严重程度：轻微、经常、严重
- 选择可用时间：5/10/15/20分钟
- 调用 DeepSeek API 生成个性化锻炼计划
- 计划包含：动作列表、组数、次数、每日时间安排
- 每个动作支持添加视频链接（抖音、B站、YouTube 等）
- 一键将锻炼计划写入每日提醒任务
- 支持多个计划管理（当前计划 + 历史计划归档）

#### 2.3 API Key 设置
- 健康管家页面右上角设置入口
- 设置弹窗填入 DeepSeek API Key
- Key 只存浏览器本地，不上传服务器
- 提供获取 Key 的链接：https://platform.deepseek.com/api_keys

### 3. AI 助手

- 对话界面
- 快捷指令
- 模拟智能回复（暂未接入真 AI）

### 4. 仪表盘

- 问候语（根据时间）
- 今日任务进度环
- 健康概览
- 快捷入口

## 开发原则：双端同步调整

**重要：任何界面修改、新增模块、修复问题时，必须同时考虑并验证桌面端和移动端的显示效果，确保两端体验一致且完整。**

### 检查清单（每次修改后必验）

- [ ] 桌面端（≥1024px）：侧边栏正常显示，弹窗居中，布局无错乱
- [ ] 移动端（<1024px）：底部导航正常显示，弹窗底部 Sheet 样式，不被导航栏遮挡
- [ ] 弹窗/模态框：桌面居中 + 移动底部 Sheet，两套样式都要正常
- [ ] 按钮/输入框：移动端点击区域≥44px，无 iOS 自动缩放
- [ ] 安全区域：iPhone 底部小黑条不遮挡内容
- [ ] 新增组件：必须同时适配桌面和移动两套布局

---

## 移动端适配要求（iPhone 14 Pro Max）

### 弹窗交互
- 所有弹窗在移动端采用**底部弹出 Sheet**样式（非居中半屏）
- 桌面端保持居中弹窗
- 弹窗顶部有拖动条视觉提示
- 弹窗 z-index = 60（高于底部导航的 50）

### iPhone 安全区域
- 底部导航添加 `paddingBottom: calc(0.5rem + env(safe-area-inset-bottom))`
- 弹窗底部按钮添加 `paddingBottom: calc(1rem + env(safe-area-inset-bottom))`
- 页面主内容 `paddingBottom: calc(5rem + env(safe-area-inset-bottom))`
- index.html viewport 添加 `viewport-fit=cover`

### 布局
- 桌面端（lg+）：固定左侧栏 64 + 主内容
- 移动端（<lg）：隐藏侧边栏，底部导航 4 个 tab
- 输入框字号用 `text-base`，避免 iOS 自动缩放
- 卡片圆角统一 `rounded-2xl` / `rounded-3xl`

## PWA 配置

- `vite.config.ts` 中 `base: './'`（相对路径）
- React Router 用 `HashRouter`（避免 GitHub Pages 子路由 404）
- vite-plugin-pwa 插件配置
- manifest.webmanifest 定义应用名、图标、主题色
- Service Worker 自动缓存，离线可用
- apple-mobile-web-app-capable 全屏模式

## 数据存储与三端同步

### 当前状态：单端本地存储
- 浏览器 localStorage（Zustand persist）
- 三端数据**不互通**（各自存储）
- 手机加的任务，电脑看不到；反之亦然

### 目标：三端数据可编辑且实时同步

用户在**任意一端编辑数据**（手机/电脑/网页），其他端**自动同步更新**，实现真正的三端互通。

### 实现方案：Supabase（推荐）

#### 1. 数据架构
```
浏览器（前端）
   ↓ fetch
Supabase（后端 + 数据库）
   ↓ PostgreSQL
三端共享同一份数据
```

#### 2. 核心能力
| 能力 | 说明 |
|------|------|
| **用户登录** | 邮箱/手机号/微信 OAuth 登录 |
| **云端存储** | 数据存 PostgreSQL，不再只存本地 |
| **实时同步** | 一端修改，其他端自动更新（Realtime） |
| **离线支持** | 断网时本地可编辑，联网后自动同步 |
| **冲突处理** | 以最后修改时间为准，简单可靠 |

#### 3. 表结构设计
```sql
-- 用户表（Supabase 自带 auth.users）
-- 任务表
tasks (
  id uuid primary key,
  user_id uuid references auth.users,
  title text,
  description text,
  category text,
  priority text,
  due_date timestamptz,
  is_completed boolean,
  repeat text,
  reminder_enabled boolean,
  created_at timestamptz,
  updated_at timestamptz  -- 用于冲突处理
)

-- 健康记录表
health_records (
  id uuid primary key,
  user_id uuid references auth.users,
  type text,
  value numeric,
  unit text,
  date date,
  created_at timestamptz
)

-- 健康计划表
health_plans (
  id uuid primary key,
  user_id uuid references auth.users,
  problem text,
  title text,
  actions jsonb,
  daily_schedule jsonb,
  status text,
  created_at timestamptz,
  updated_at timestamptz
)
```

#### 4. 实现步骤
1. **注册 Supabase**：https://supabase.com（免费额度够个人用）
2. **创建项目**：获取 URL 和 anon key
3. **建表**：执行上面的 SQL
4. **配置认证**：开启邮箱登录
5. **改造 Store**：Zustand 的 action 改为调用 Supabase API
6. **添加登录页**：未登录跳转登录
7. **Realtime 订阅**：监听数据变化，自动刷新
8. **离线队列**：断网时操作入队，联网后重放

#### 5. 备选方案

| 方案 | 优势 | 劣势 |
|------|------|------|
| **Supabase** ⭐推荐 | 开源、简单、有 Realtime | 需注册 |
| **Firebase** | Google 生态、文档全 | 国内访问慢 |
| **微信云开发** | 国内快、微信登录 | 锁定微信生态 |
| **自建后端** | 完全可控 | 要服务器、要运维 |

#### 6. 迁移策略（渐进式）
- **阶段1**：localStorage 保持不变，新增 Supabase 同步
- **阶段2**：登录后把本地数据上传到云端
- **阶段3**：完全以云端为准，本地仅做缓存
- **阶段4**：清理 localStorage，改为 IndexedDB 缓存

## UI 设计规范（苹果风格 · 简洁扁平化）

### 设计原则
- **极简留白**：大量负空间，内容呼吸感强
- **扁平化**：去除多余阴影、渐变、装饰色块
- **层次清晰**：用细边框（border）和背景色区分层次，不用重阴影
- **克制色彩**：以黑白灰为主，少量蓝色点缀
- **大圆角**：统一使用 rounded-2xl（16px）/ rounded-3xl（24px）
- **细腻动画**：Framer Motion 弹簧动画，克制不夸张

### 色彩系统
```
背景：#F5F5F7（苹果灰白）
卡片：#FFFFFF（纯白）
边框：rgba(0,0,0,0.06)（极淡灰）
主文字：#1D1D1F（苹果近黑）
次文字：#86868B（苹果中灰）
主色：#0071E3（苹果蓝，仅用于按钮和强调）
成功：#34C759（苹果绿）
警告：#FF9500（苹果橙）
危险：#FF3B30（苹果红）
```

### 字体
- 系统字体栈：`-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif`
- 中文：PingFang SC（苹方）
- 不使用衬线字体和装饰字体
- 标题用 font-semibold，不用 font-bold

### 卡片样式
- 背景：纯白 `bg-white`
- 边框：`border border-neutral-200/60`（极淡）
- 圆角：`rounded-2xl`
- 阴影：**不用**，或仅用 `shadow-sm`
- 悬停：轻微上浮 `hover:-translate-y-0.5`

### 按钮
- 主按钮：`bg-[#0071E3] text-white rounded-xl`（纯色，无渐变）
- 次按钮：`bg-neutral-100 text-neutral-800 rounded-xl`
- 危险按钮：`bg-[#FF3B30] text-white rounded-xl`
- 不用渐变（gradient-primary 全部移除）

### 背景
- 纯色背景 `#F5F5F7`，**不要**装饰色块、blob 动画
- 整体干净简洁

### 动画
- 页面切换：淡入淡出（opacity），不用大幅位移
- 弹窗：弹簧动画（spring, damping: 30, stiffness: 300）
- 列表项：stagger 渐入，间隔 0.05s

## 关键文件结构

```
src/
├── components/
│   ├── Layout.tsx              # 主布局（侧边栏 + 底部导航）
│   ├── Sidebar.tsx             # 桌面端侧边栏（hidden lg:block）
│   ├── BottomNav.tsx           # 移动端底部导航（lg:hidden + safe-area）
│   ├── TaskFormModal.tsx       # 任务弹窗（桌面居中 + 移动底部Sheet）
│   ├── HealthPlanGenerator.tsx # AI 计划生成器弹窗
│   ├── HealthPlanDetail.tsx    # 计划详情 + 视频管理 + 写入任务
│   └── SettingsModal.tsx       # API Key 设置弹窗
├── pages/
│   ├── Dashboard.tsx           # 仪表盘
│   ├── TasksPage.tsx           # 任务提醒中心
│   ├── HealthPage.tsx          # 健康管家（含 AI 计划）
│   └── AssistantPage.tsx       # AI 助手
├── services/
│   └── deepseek.ts             # DeepSeek API 调用
├── store/
│   └── useAppStore.ts          # Zustand 状态管理
├── types/
│   └── index.ts                # TypeScript 类型定义
└── utils/
    └── dateUtils.ts            # 日期工具
```

## 部署命令

```bash
# 构建并部署到 GitHub Pages
pnpm run deploy

# 本地预览生产版本
npx vite preview --host 0.0.0.0
```

## 验收标准

### 移动端适配
- [ ] iPhone 14 Pro Max 上弹窗全宽底部弹出，不被底部导航遮挡
- [ ] 所有页面在移动端正常显示，无横向滚动
- [ ] iPhone 底部小黑条不遮挡内容

### 功能完整性
- [ ] AI 健康计划生成功能可用（填入 API Key 后）
- [ ] 锻炼计划可一键写入每日提醒任务
- [ ] 每个动作可添加视频链接
- [ ] PWA 可添加到主屏幕，离线可打开

### 三端同步（目标）
- [ ] 三端都能正常访问使用（手机、电脑、网页）
- [ ] 用户登录后，数据存云端（Supabase）
- [ ] 任意一端编辑数据，其他端自动同步更新
- [ ] 离线时本地可编辑，联网后自动同步
- [ ] 未登录时降级为 localStorage 本地存储
