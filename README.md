# Vibe Video

把 AI 类文章自动转换成 Remotion 动画视频，包含旁白音频、场景动画和场景切换。

## 效果预览

每篇文章自动生成 5–8 个场景，包含：
- 开场钩子、核心概念解析、案例对比、趋势预测、结论行动
- 中文 TTS 旁白（阿里云 qwen3-tts-flash）
- Spring 弹性入场动画 + Fade 场景过渡
- 1280×720 横版，Noto Sans SC 字体

## 技术栈

- [Remotion](https://www.remotion.dev/) — React 视频渲染框架
- 阿里云 DashScope — TTS 语音合成
- Node.js 22+（原生 TypeScript 运行，无需编译）

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`，填入你的阿里云 DashScope API Key：

```
DASHSCOPE_API_KEY=your_api_key_here
```

> 在 [阿里云百炼控制台](https://bailian.console.aliyun.com/) 申请 API Key，开通 `qwen3-tts-flash` 模型权限。

### 3. 放入文章

将文章以 `{slug}.txt` 命名，放入 `articles/` 目录。文件名即为视频的 slug，例如：

```
articles/ai-hardware.txt
articles/rsi-ai.txt
```

### 4. 用 AI Agent 生成视频

用支持 Claude 的 AI 编程助手（如 Claude Code）打开项目，对话：

```
处理 articles/ai-hardware.txt
```

Agent 会自动完成：
1. 分析文章，规划 5–8 个场景
2. 生成旁白脚本（`src/videos/{slug}/voiceover-script.json`）
3. 调用 TTS API 生成音频（`public/voiceover/{slug}/`）
4. 生成所有 Scene 组件（`src/videos/{slug}/scenes/`）
5. 创建 Composition（自动注册，无需手动修改 Root.tsx）

### 5. 预览 & 渲染

```bash
# 在浏览器中预览
pnpm start

# 渲染为 MP4
pnpm exec remotion render {slug} out/{slug}.mp4
```

## 项目结构

```
vibe-video/
├── CLAUDE.md                    # AI Agent 操作手册（核心）
├── generate-voiceover-audio.ts  # TTS 生成脚本
├── src/
│   ├── Root.tsx                 # Remotion 入口
│   ├── components/              # 通用场景组件库（10 种）
│   └── videos/                  # 生成的视频（gitignore）
├── articles/                    # 待处理的文章（gitignore，用户自己放）
│   └── {slug}.txt               # 文件名即为视频 slug
└── public/
    └── voiceover/               # 生成的音频（gitignore）
```

## 场景组件库

10 种开箱即用的场景组件，覆盖常见内容结构：

| 组件 | 适用场景 |
|------|---------|
| `HookScene` | 开场钩子，抛问题制造悬念 |
| `ConceptScene` | 定义术语或核心思想 |
| `AnalogyConcept` | 技术概念 + 类比解释 |
| `CaseScene` | 真实案例，支持数字动画 |
| `CompareScene` | 两方对比 |
| `QuoteScene` | 专家引用 |
| `ReasoningScene` | 因果/递进推理链 |
| `TensionScene` | 转折/反转，认知冲突 |
| `PredictionScene` | 预测/影响推演 |
| `ConclusionScene` | 结论 + 行动建议 |

## 环境要求

- Node.js 22+（支持 `--experimental-strip-types` 和 `--env-file`）
- pnpm
- ffprobe（用于读取音频时长）：`brew install ffmpeg`
