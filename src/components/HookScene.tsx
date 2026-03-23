import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/NotoSansSC";

const { fontFamily } = loadFont("normal", { weights: ["400", "700"] });

export type HookSceneProps = {
  audioFile: string;
  label?: string;          // 顶部小标签，如"AI 深度分析"
  title: string;           // 主标题
  subtitle?: string;       // 副标题
  accent?: string;         // 副标题高亮部分
  tagA?: string;           // 对立标签左侧，如"技术突破"
  tagB?: string;           // 对立标签右侧，如"精心骗局"
};

export const HookScene: React.FC<HookSceneProps> = ({
  audioFile,
  label,
  title,
  subtitle,
  accent,
  tagA,
  tagB,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSlide = spring({ frame, fps, config: { damping: 200 } });
  const titleY = interpolate(titleSlide, [0, 1], [40, 0]);

  const subtitleOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const labelOpacity = interpolate(frame, [35, 55], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const tagsOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const lineWidth = interpolate(frame, [10, 50], [0, 100], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff", fontFamily, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 80px" }}>
      <Audio src={staticFile(audioFile)} />

      <div style={{ position: "absolute", top: 0, left: 0, width: `${lineWidth}%`, height: 4, backgroundColor: "#1a56db" }} />

      {label && (
        <div style={{ opacity: labelOpacity, position: "absolute", top: 60, left: 80, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 4, height: 20, backgroundColor: "#1a56db", borderRadius: 2 }} />
          <span style={{ fontSize: 16, fontWeight: 400, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
        </div>
      )}

      <div style={{ opacity: titleSlide, transform: `translateY(${titleY}px)`, textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 64, fontWeight: 700, color: "#111827", lineHeight: 1.2, letterSpacing: "-0.02em" }}>{title}</div>
      </div>

      {(subtitle || accent) && (
        <div style={{ opacity: subtitleOpacity, textAlign: "center", maxWidth: 720, marginBottom: tagA ? 32 : 0 }}>
          {subtitle && <span style={{ fontSize: 24, fontWeight: 400, color: "#374151", lineHeight: 1.6 }}>{subtitle}</span>}
          {accent && <span style={{ fontSize: 24, fontWeight: 700, color: "#dc2626" }}>{accent}</span>}
        </div>
      )}

      {(tagA || tagB) && (
        <div style={{ opacity: tagsOpacity, display: "flex", gap: 16, marginTop: 8 }}>
          {tagA && <div style={{ backgroundColor: "#d1fae5", color: "#065f46", fontSize: 18, fontWeight: 700, padding: "10px 28px", borderRadius: 999 }}>{tagA}</div>}
          {tagA && tagB && <div style={{ fontSize: 20, color: "#9ca3af", display: "flex", alignItems: "center" }}>vs</div>}
          {tagB && <div style={{ backgroundColor: "#fee2e2", color: "#7f1d1d", fontSize: 18, fontWeight: 700, padding: "10px 28px", borderRadius: 999 }}>{tagB}</div>}
        </div>
      )}
    </AbsoluteFill>
  );
};
