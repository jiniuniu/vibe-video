import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/NotoSansSC";

const { fontFamily } = loadFont("normal", { weights: ["400", "700"] });

export type ConclusionPoint = {
  icon: string;
  text: string;
  color?: string;
};

export type ConclusionSceneProps = {
  audioFile: string;
  label?: string;
  title: string;
  points: ConclusionPoint[];
  cta?: string;
  ctaSubtext?: string;
};

export const ConclusionScene: React.FC<ConclusionSceneProps> = ({ audioFile, label, title, points, cta, ctaSubtext }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 200 } });
  const ctaIn = spring({ frame: frame - (points.length * 13 + 30), fps, config: { damping: 200 } });
  const lineWidth = interpolate(frame, [5, 40], [0, 100], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  const POINT_COLORS: Record<string, { border: string; bg: string }> = {
    "✓": { border: "#10b981", bg: "#f0fdf4" },
    "⚠": { border: "#f59e0b", bg: "#fffbeb" },
    "→": { border: "#1a56db", bg: "#eff6ff" },
    "✗": { border: "#dc2626", bg: "#fef2f2" },
    "★": { border: "#7c3aed", bg: "#f5f3ff" },
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#111827", fontFamily, padding: "60px 80px", display: "flex", flexDirection: "column" }}>
      <Audio src={staticFile(audioFile)} />
      <div style={{ position: "absolute", top: 0, left: 0, height: 4, width: `${lineWidth}%`, backgroundColor: "#1a56db" }} />

      <div style={{ opacity: titleIn, transform: `translateY(${interpolate(titleIn, [0, 1], [20, 0])}px)`, marginBottom: 36 }}>
        {label && <div style={{ fontSize: 14, color: "#60a5fa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>{label}</div>}
        <div style={{ fontSize: 42, fontWeight: 700, color: "#ffffff", lineHeight: 1.2 }}>{title}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
        {points.map((point, i) => {
          const pointIn = spring({ frame: frame - (i * 13 + 15), fps, config: { damping: 200 } });
          const colors = POINT_COLORS[point.icon] ?? { border: "#1a56db", bg: "#eff6ff" };
          return (
            <div key={i} style={{ opacity: pointIn, transform: `translateX(${interpolate(pointIn, [0, 1], [-24, 0])}px)`, display: "flex", gap: 16, alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "16px 20px", borderLeft: `4px solid ${colors.border}` }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: colors.bg, color: colors.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
                {point.icon}
              </div>
              <div style={{ fontSize: 17, color: "#e5e7eb", lineHeight: 1.5 }}>{point.text}</div>
            </div>
          );
        })}
      </div>

      {cta && (
        <div style={{ opacity: ctaIn, transform: `translateY(${interpolate(ctaIn, [0, 1], [20, 0])}px)`, backgroundColor: "#1a56db", borderRadius: 14, padding: "22px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#ffffff", marginBottom: ctaSubtext ? 4 : 0 }}>{cta}</div>
            {ctaSubtext && <div style={{ fontSize: 14, color: "#bfdbfe" }}>{ctaSubtext}</div>}
          </div>
          <div style={{ fontSize: 28, color: "#bfdbfe" }}>→</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
