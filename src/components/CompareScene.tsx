import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/NotoSansSC";

const { fontFamily } = loadFont("normal", { weights: ["400", "700"] });

export type CompareSceneProps = {
  audioFile: string;
  label?: string;
  title: string;
  left: { title: string; color?: string; bg?: string; points: string[]; badge?: string };
  right: { title: string; color?: string; bg?: string; points: string[]; badge?: string };
  warning?: string;
};

export const CompareScene: React.FC<CompareSceneProps> = ({ audioFile, label, title, left, right, warning }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 200 } });
  const leftIn = spring({ frame: frame - 15, fps, config: { damping: 200 } });
  const rightIn = spring({ frame: frame - 30, fps, config: { damping: 200 } });
  const warningIn = spring({ frame: frame - 50, fps, config: { damping: 200 } });
  const dividerScale = interpolate(frame, [20, 50], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  const lColor = left.color ?? "#10b981";
  const rColor = right.color ?? "#1a56db";
  const lBg = left.bg ?? "#f0fdf4";
  const rBg = right.bg ?? "#eff6ff";

  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff", fontFamily, padding: "60px 80px" }}>
      <Audio src={staticFile(audioFile)} />
      <div style={{ opacity: titleIn, transform: `translateY(${interpolate(titleIn, [0, 1], [20, 0])}px)`, marginBottom: 40 }}>
        {label && <div style={{ fontSize: 14, color: "#1a56db", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>}
        <div style={{ fontSize: 40, fontWeight: 700, color: "#111827" }}>{title}</div>
      </div>

      <div style={{ display: "flex", gap: 0, flex: 1, alignItems: "stretch" }}>
        <div style={{ flex: 1, opacity: leftIn, transform: `translateX(${interpolate(leftIn, [0, 1], [-30, 0])}px)`, backgroundColor: lBg, borderRadius: "16px 0 0 16px", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: lColor }}>{left.title}</div>
          {left.badge && <div style={{ alignSelf: "flex-start", backgroundColor: lColor + "22", color: lColor, fontSize: 12, padding: "3px 10px", borderRadius: 999, fontWeight: 600 }}>{left.badge}</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {left.points.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: lColor, marginTop: 7, flexShrink: 0 }} />
                <div style={{ fontSize: 15, color: "#374151", lineHeight: 1.6 }}>{p}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ width: 2, backgroundColor: "#e5e7eb", transform: `scaleY(${dividerScale})`, transformOrigin: "top" }} />

        <div style={{ flex: 1, opacity: rightIn, transform: `translateX(${interpolate(rightIn, [0, 1], [30, 0])}px)`, backgroundColor: rBg, borderRadius: "0 16px 16px 0", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: rColor }}>{right.title}</div>
          {right.badge && <div style={{ alignSelf: "flex-start", backgroundColor: rColor + "22", color: rColor, fontSize: 12, padding: "3px 10px", borderRadius: 999, fontWeight: 600 }}>{right.badge}</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {right.points.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: rColor, marginTop: 7, flexShrink: 0 }} />
                <div style={{ fontSize: 15, color: "#374151", lineHeight: 1.6 }}>{p}</div>
              </div>
            ))}
          </div>
          {warning && (
            <div style={{ opacity: warningIn, backgroundColor: "#fef3c7", borderRadius: 10, padding: "12px 16px", borderLeft: "3px solid #f59e0b", marginTop: 8 }}>
              <div style={{ fontSize: 13, color: "#92400e", lineHeight: 1.5 }}>⚠️ {warning}</div>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
