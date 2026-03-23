import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/NotoSansSC";

const { fontFamily } = loadFont("normal", { weights: ["400", "700"] });

export type ReasoningStep = {
  label: string;
  text: string;
  color?: string;
};

export type ReasoningSceneProps = {
  audioFile: string;
  label?: string;
  title: string;
  steps: ReasoningStep[];
  conclusion?: string;
};

const COLORS = ["#1a56db", "#7c3aed", "#059669", "#dc2626", "#d97706"];

export const ReasoningScene: React.FC<ReasoningSceneProps> = ({ audioFile, label, title, steps, conclusion }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 200 } });
  const conclusionOpacity = interpolate(frame, [55, 75], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff", fontFamily, padding: "60px 80px" }}>
      <Audio src={staticFile(audioFile)} />

      <div style={{ opacity: titleIn, transform: `translateY(${interpolate(titleIn, [0, 1], [20, 0])}px)`, marginBottom: 36 }}>
        {label && <div style={{ fontSize: 14, color: "#1a56db", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>}
        <div style={{ fontSize: 40, fontWeight: 700, color: "#111827" }}>{title}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 0, flex: 1 }}>
        {steps.map((step, i) => {
          const stepIn = spring({ frame: frame - (i * 15 + 10), fps, config: { damping: 200 } });
          const color = step.color ?? COLORS[i % COLORS.length];
          return (
            <div key={i}>
              <div style={{ opacity: stepIn, transform: `translateX(${interpolate(stepIn, [0, 1], [-20, 0])}px)`, display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{i + 1}</span>
                  </div>
                  {i < steps.length - 1 && <div style={{ width: 2, height: 32, backgroundColor: "#e5e7eb" }} />}
                </div>
                <div style={{ flex: 1, backgroundColor: "#f9fafb", borderRadius: 12, padding: "14px 20px", marginBottom: i < steps.length - 1 ? 0 : 0, borderLeft: `3px solid ${color}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{step.label}</div>
                  <div style={{ fontSize: 16, color: "#374151", lineHeight: 1.5 }}>{step.text}</div>
                </div>
              </div>
              {i < steps.length - 1 && <div style={{ height: 8 }} />}
            </div>
          );
        })}

        {conclusion && (
          <div style={{ opacity: conclusionOpacity, marginTop: 20, backgroundColor: "#1a56db", borderRadius: 12, padding: "16px 24px" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#ffffff", lineHeight: 1.5 }}>→ {conclusion}</div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
