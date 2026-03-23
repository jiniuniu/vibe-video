import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
if (!DASHSCOPE_API_KEY) {
  console.error("请设置 DASHSCOPE_API_KEY 环境变量");
  process.exit(1);
}

const slug = process.argv[2];
if (!slug) {
  console.error("用法: node --experimental-strip-types generate-voiceover-audio.ts <slug>");
  console.error("示例: node --experimental-strip-types generate-voiceover-audio.ts rsi-ai");
  process.exit(1);
}

const SCRIPT_PATH = join(process.cwd(), "src/videos", slug, "voiceover-script.json");
const PUBLIC_DIR = join(process.cwd(), "public");

interface Scene {
  id: string;
  sceneComponent: string;
  durationHint: number;
  voiceoverText: string;
  audioFile: string;
  audioDurationSeconds: number | null;
}

interface VoiceoverScript {
  voice: string;
  language_type: string;
  scenes: Scene[];
}

async function generateAudio(
  text: string,
  voice: string,
  languageType: string
): Promise<string> {
  console.log(`  → 调用 TTS API...`);
  const response = await fetch(
    "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen3-tts-flash",
        input: {
          text,
          voice,
          language_type: languageType,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API 请求失败 (${response.status}): ${err}`);
  }

  const data = await response.json() as { output?: { audio?: { url?: string } } };
  const audioUrl = data?.output?.audio?.url;
  if (!audioUrl) {
    throw new Error(`响应中没有 audio.url: ${JSON.stringify(data)}`);
  }
  return audioUrl;
}

async function downloadFile(url: string, destPath: string): Promise<void> {
  console.log(`  → 下载音频文件...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`下载失败 (${response.status}): ${url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(destPath, buffer);
  console.log(`  → 已保存到 ${destPath}`);
}

// 用 ffprobe 读取音频时长（秒）
function getAudioDuration(filePath: string): number {
  const result = execSync(
    `ffprobe -v error -show_entries format=duration -of csv=p=0 "${filePath}"`,
    { encoding: "utf-8" }
  ).trim();
  return parseFloat(result);
}

async function main() {
  const script: VoiceoverScript = JSON.parse(readFileSync(SCRIPT_PATH, "utf-8"));

  mkdirSync(join(PUBLIC_DIR, "voiceover"), { recursive: true });

  for (const scene of script.scenes) {
    console.log(`\n[${scene.id}] ${scene.sceneComponent}`);
    console.log(`  文本: ${scene.voiceoverText.slice(0, 30)}...`);

    const destPath = join(PUBLIC_DIR, scene.audioFile);

    try {
      const audioUrl = await generateAudio(
        scene.voiceoverText,
        script.voice,
        script.language_type
      );

      await downloadFile(audioUrl, destPath);

      const duration = getAudioDuration(destPath);
      scene.audioDurationSeconds = Math.round(duration * 100) / 100;
      console.log(`  → 时长: ${scene.audioDurationSeconds}s`);
    } catch (err) {
      console.error(`  ✗ 失败: ${err}`);
      process.exit(1);
    }
  }

  // 写回 JSON
  writeFileSync(SCRIPT_PATH, JSON.stringify(script, null, 2));
  console.log(`\n✅ 全部完成，已更新 src/videos/${slug}/voiceover-script.json`);

  // 输出汇总
  console.log("\n📊 各 Scene 音频时长：");
  for (const scene of script.scenes) {
    console.log(`  ${scene.id}: ${scene.audioDurationSeconds}s`);
  }
}

main();
