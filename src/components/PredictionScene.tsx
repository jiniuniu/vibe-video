import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/NotoSansSC";

const { fontFamily } = loadFont("normal", { weights: ["400", "700"] });

export type PredictionItem = {
  subject: string;
  prediction: string;
  confidence?: "高" | "中" | "低";
};

export type PredictionSceneProps = {
  audioFile: string;
  label?: string;
  title: string;
  predictions: PredictionItem[];
  disclaimer?: string;
};

const CONFIDENCE_COLORS: Record<string, { bg: string; color: string }> = {
  高: { bg: "#d1fae5", color: "#065f46" },
  中: { bg: "#fef3c7", color: "#92400e" },
  低: { bg: "#fee2e2", color: "#7f1d1d" },
};

export const PredictionScene: React.FC<PredictionSceneProps> = ({ audioFile, label, title, predictions, disclaimer }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 200 } });
  const disclaimerOpacity = interpolate(frame, [60, 80], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#f9fafb", fontFamily, padding: "60px 80px" }}>
      <Audio src={staticFile(audioFile)} />

      <div style={{ opacity: titleIn, transform: `translateY(${interpolate(titleIn, [0, 1], [20, 0])}px)`, marginBottom: 36 }}>
        {label && <div style={{ fontSize: 14, color: "#1a56db", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>}
        <div style={{ fontSize: 40, fontWeight: 700, color: "#111827" }}>{title}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
        {predictions.map((p, i) => {
          const cardIn = spring({ frame: frame - (i * 15 + 10), fps, config: { damping: 200 } });
          const conf = p.confidence ? CONFIDENCE_COLORS[p.confidence] : null;
          return (
            <div key={i} style={{ opacity: cardIn, transform: `translateX(${interpolate(cardIn, [0, 1], [-20, 0])}px)`, backgroundColor: "#ffffff", borderRadius: 12, padding: "20px 24px", display: "flex", gap: 20, alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6" }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: "#1a56db" }}>{i + 1}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>{p.subject}</div>
                <div style={{ fontSize: 17, color: "#111827", lineHeight: 1.5 }}>{p.prediction}</div>
              </div>
              {conf && (
                <div style={{ backgroundColor: conf.bg, color: conf.color, fontSize: 12, padding: "4px 12px", borderRadius: 999, fontWeight: 600, flexShrink: 0 }}>
                  置信度：{p.confidence}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {disclaimer && (
        <div style={{ opacity: disclaimerOpacity, marginTop: 16, fontSize: 13, color: "#9ca3af", textAlign: "center" }}>
          ⚠️ {disclaimer}
        </div>
      )}
    </AbsoluteFill>
  );
};
