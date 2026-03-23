# Vibe Video — AI 文章转视频工具

## 项目概述

把 AI 类文章自动转换成 Remotion 动画视频，包含旁白音频、场景动画、场景切换。

## 技术栈

- **Remotion 4.x** — React 视频渲染框架
- **@remotion/transitions** — 场景过渡
- **@remotion/google-fonts/NotoSansSC** — 中文字体
- **@remotion/media** — Audio 组件
- **mediabunny** — 读取音频时长（用于 calculateMetadata）
- **阿里云 qwen3-tts-flash** — TTS 语音合成
- **ffprobe** — 本地读取音频时长

## 文件夹结构

```
vibe-video/
├── CLAUDE.md                          # 本文件
├── generate-voiceover-audio.ts        # TTS 生成脚本（通用，不随视频变化）
├── articles/                          # 待处理的文章（gitignore，用户自己放）
│   └── {slug}.txt                     # 文件名即为视频 slug
├── src/
│   ├── Root.tsx                       # Remotion 入口，注册所有视频的 Composition
│   ├── components/                    # 通用场景组件库（10 种）
│   │   ├── index.ts                   # 统一导出
│   │   ├── HookScene.tsx
│   │   ├── ConceptScene.tsx
│   │   ├── AnalogyConcept.tsx
│   │   ├── CaseScene.tsx
│   │   ├── CompareScene.tsx
│   │   ├── QuoteScene.tsx
│   │   ├── ReasoningScene.tsx
│   │   ├── TensionScene.tsx
│   │   ├── PredictionScene.tsx
│   │   └── ConclusionScene.tsx
│   └── videos/                        # 每个视频一个子文件夹
│       └── {slug}/
│           ├── Composition.tsx        # 该视频的 Composition + calculateMetadata
│           ├── voiceover-script.json  # 场景脚本 + 旁白文案 + 音频时长
│           └── scenes/                # 该视频的 Scene 组件（使用组件库填充内容）
│               ├── Scene1Hook.tsx
│               └── ...
└── public/
    └── voiceover/
        └── {slug}/                    # 每个视频的音频文件
            ├── scene-1.wav
            └── ...
```

> **约定**：将文章以 `{slug}.txt` 命名放入 `articles/` 目录，文件名即为视频 slug。
> 新增视频时，在 `src/videos/{slug}/` 下创建所有文件，
> 并在 `src/Root.tsx` 里注册新的 Composition。

## 视频风格规范

- **尺寸**：1280×720（横版）
- **FPS**：30
- **配色**：白色/浅灰背景，主色 `#1a56db`（蓝），强调色 `#dc2626`（红）/ `#10b981`（绿）
- **字体**：Noto Sans SC，weights: 400 / 700
- **动画**：spring 弹性入场（`damping: 200` 为无弹跳平滑），`interpolate` 渐变
- **过渡**：场景间 fade，`TRANSITION_FRAMES = 18`（0.6s）
- **停顿**：每个 Scene 音频结束后停留 `PAUSE_FRAMES = 30`（1s）再过渡
- **CSS transitions/animations 禁止使用**，只用 `useCurrentFrame()` 驱动

## 组件库（src/components/）

10 种通用 Scene 组件，**全部已实现**，每次生成视频直接从组件库导入使用。

| 组件 | 适用场景 | 核心 Props |
|------|---------|-----------|
| `HookScene` | 开场钩子，抛问题制造悬念 | `title`, `subtitle?`, `accent?`, `tagA?`, `tagB?` |
| `ConceptScene` | 定义术语或核心思想 | `term`, `definition`, `visual?`, `note?` |
| `AnalogyConcept` | 技术概念 + 类比解释 | `concept{term,description}`, `analogy{object,description}`, `mapping?[]` |
| `CaseScene` | 真实案例，支持数字动画 | `cases[]{company, metric?{value,unit,label}, badge?}` |
| `CompareScene` | 两方对比 | `left{title,points[]}`, `right{title,points[]}`, `warning?` |
| `QuoteScene` | 专家引用 | `quote`, `author`, `authorTitle?`, `points?[]` |
| `ReasoningScene` | 因果/递进推理链 | `steps[]{label,text,color?}`, `conclusion?` |
| `TensionScene` | 转折/反转，认知冲突 | `surface{heading,text}`, `reality{heading,text}` |
| `PredictionScene` | 预测/影响推演 | `predictions[]{subject,prediction,confidence?}`, `disclaimer?` |
| `ConclusionScene` | 结论 + 行动建议 | `points[]{icon,text}`, `cta?`, `ctaSubtext?` |

**所有组件的第一个 prop 都是 `audioFile: string`。**

**组件选择规则**：
- 第一个 Scene 必须是 `HookScene`
- 最后一个 Scene 必须是 `ConclusionScene`
- 技术解读类文章多用 `AnalogyConcept` + `ReasoningScene`
- 观点分析类文章多用 `QuoteScene` + `TensionScene`
- 行业分析类文章多用 `CaseScene` + `PredictionScene`

## 完整工作流（用户说"处理 articles/xxx.txt"时执行）

### Step 0：准备工作区

1. 读取指定文章文件（如 `articles/ai-hardware.txt`），**文件名去掉后缀即为 slug**（如 `ai-hardware`）
2. 创建目录：
   - `src/videos/{slug}/scenes/`
   - `public/voiceover/{slug}/`

### Step 1：分析文章，生成场景脚本

读取 `articles/{slug}.txt`，生成 `src/videos/{slug}/voiceover-script.json`：

```json
{
  "slug": "{slug}",
  "voice": "Cherry",
  "language_type": "Chinese",
  "scenes": [
    {
      "id": "scene-1",
      "sceneComponent": "Scene1Hook",
      "componentType": "HookScene",
      "durationHint": 8,
      "voiceoverText": "...",
      "audioFile": "voiceover/{slug}/scene-1.wav",
      "audioDurationSeconds": null
    }
  ]
}
```

**旁白文案风格**：知识博主口吻，口语化，有节奏感，偶尔反问带入听众，每段 60-120 字。

**场景数量**：5-8 个，根据文章长度和信息密度决定。

同时将此文件**软链接或拷贝**到根目录的 `voiceover-script.json`（generate-voiceover-audio.ts 需要读取根目录的文件）。

### Step 2：生成旁白音频

运行：
```bash
node --env-file=.env --experimental-strip-types generate-voiceover-audio.ts {slug}
```

脚本会：
1. 读取 `src/videos/{slug}/voiceover-script.json`
2. 调用阿里云 `qwen3-tts-flash` API（voice: Cherry）
3. 下载 WAV 到 `public/voiceover/{slug}/scene-N.wav`
4. 用 ffprobe 读取实际时长，写回 `src/videos/{slug}/voiceover-script.json`

### Step 3：生成 Scene 组件代码

在 `src/videos/{slug}/scenes/` 下为每个 scene 创建一个 TSX 文件。

#### 判断规则：优先用组件库，不满足再自定义

**第一步：判断能否用组件库**

对每个 scene，先对照下表检查内容是否能被组件库的 props 完整表达：

| componentType | 能表达的内容 | 不能表达的内容（→ 自定义） |
|---|---|---|
| `HookScene` | 标题 + 副标题 + 两个对立标签 | 需要超过两个标签、复杂图表 |
| `ConceptScene` | 术语 + 定义 + cycle/arrow/layers 三种图示 | 需要自定义图示 |
| `AnalogyConcept` | 概念 + 类比对象 + 映射关系列表 | 需要超过两列对比 |
| `CaseScene` | 1-2 个案例卡片，每张含数字指标/描述/badge | 需要 3 个以上案例 |
| `CompareScene` | 左右两列对比，每列含要点列表 + badge | 需要三方对比 |
| `QuoteScene` | 引用文字 + 作者 + 要点列表 | 需要多个引用 |
| `ReasoningScene` | 步骤列表（label + text + color） + 结论 | 需要分支结构 |
| `TensionScene` | 表面现象 vs 真实情况（各含标题+正文） | 需要三方以上对比 |
| `PredictionScene` | 预测列表（主体 + 预测 + 置信度高/中/低） | 需要进度条等特殊可视化 |
| `ConclusionScene` | 要点列表（icon + text） + CTA 按钮 | 需要深色背景以外的风格 |

**如果内容能被 props 完整表达 → 用组件库**（写法见下方示例）

**如果有以下任一情况 → 自定义**：
- 需要展示特殊数据可视化（进度条对比、层级图、流程图等）
- 内容结构超出 props 设计范围（如 3 个以上卡片）
- 该 scene 有独特的视觉创意，组件库无法实现

#### 写法 A：使用组件库（优先）

从 `src/components/` 导入对应组件，填充内容数据后导出：

```tsx
import { HookScene } from "../../../components";

export const Scene1Hook: React.FC<{ audioFile: string }> = ({ audioFile }) => (
  <HookScene
    audioFile={audioFile}
    label="AI 深度分析"
    title="递归自我改进"
    subtitle="这究竟是价值万亿美元的金点子，"
    accent="还是一场精心设计的骗局？"
    tagA="技术突破"
    tagB="精心骗局"
  />
);
```

```tsx
import { CaseScene } from "../../../components";

export const Scene3Cases: React.FC<{ audioFile: string }> = ({ audioFile }) => (
  <CaseScene
    audioFile={audioFile}
    label="真实案例"
    title="RSI 已在实践中发挥作用"
    cases={[
      {
        company: "Shopify CEO · Tobias Lütke",
        subtitle: "20 年未动的模板引擎",
        description: "AI 大规模运行实验后的结果",
        metric: { value: 53, unit: "%", label: "性能提升" },
        badge: "已验证",
        color: "#10b981",
      },
      {
        company: "Minimax M2.7",
        subtitle: "中国顶尖 AI 模型",
        description: "自主收集反馈 → 构建评估集 → 迭代架构与记忆机制",
        badge: "媲美美国前沿模型",
        color: "#1a56db",
      },
    ]}
  />
);
```

#### 写法 B：自定义组件（组件库无法满足时）

从头写完整 TSX，遵守 Remotion 关键规则（见下方）：
- `<Audio src={staticFile(audioFile)} />` 放在 AbsoluteFill 内第一个位置
- 所有动画用 `useCurrentFrame()` + `spring` / `interpolate` 驱动
- 加载字体：`const { fontFamily } = loadFont("normal", { weights: ["400", "700"] })`

### Step 4：创建视频的 Composition.tsx

在 `src/videos/{slug}/Composition.tsx` 中：
- import 所有 Scene 组件
- import `voiceover-script.json`（相对路径 `./voiceover-script.json`）
- 使用 mediabunny 的 `calculateMetadata` 读取音频时长
- 使用 `TransitionSeries` + `fade` 过渡串联所有 scene
- 导出命名为 `{SlugCamel}Composition`（如 `AIHardwareComposition`）

参考 `src/videos/rsi-ai/Composition.tsx` 的结构。

### Step 5：注册到 Root.tsx

在 `src/Root.tsx` 中添加新的 `<Composition>` 注册，id 为 slug。

### Step 6：验证

```bash
npx tsc --noEmit
```

如有错误，修复后重新检查，直到通过。

---

## Remotion 关键规则（每次写代码必须遵守）

1. **所有动画必须由 `useCurrentFrame()` 驱动**，禁止 CSS transitions/animations
2. **字体用 `@remotion/google-fonts/NotoSansSC`**，调用 `loadFont("normal", { weights: ["400", "700"] })`，不要传 subsets 参数
3. **音频用 `<Audio src={staticFile(audioFile)} />`**，放在 AbsoluteFill 内第一个位置
4. **`calculateMetadata` 用 mediabunny 的 `Input` + `UrlSource` 读取音频时长**
5. **场景时长 = `Math.ceil(audioDuration * FPS) + PAUSE_FRAMES`**
6. **总时长 = 各场景时长之和 - `(场景数 - 1) * TRANSITION_FRAMES`**
7. **`reduce` 替代 `flatMap`**（tsconfig lib 为 es2015，不支持 flatMap）
8. **JSON import 需要 `resolveJsonModule: true`**（tsconfig 已配置）
