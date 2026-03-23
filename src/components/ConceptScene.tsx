import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/NotoSansSC";

const { fontFamily } = loadFont("normal", { weights: ["400", "700"] });

export type ConceptSceneProps = {
  audioFile: string;
  label?: string;
  title: string;
  term: string;
  definition: string;
  visual?: "cycle" | "arrow" | "layers";
  visualLabel?: string;
  note?: string;
};

const CycleVisual: React.FC<{ progress: number; label: string }> = ({ progress, label }) => {
  const circumference = 2 * Math.PI * 60;
  return (
    <svg width={160} height={160} viewBox="0 0 160 160">
      <circle cx={80} cy={80} r={60} fill="none" stroke="#e5e7eb" strokeWidth={8} />
      <circle cx={80} cy={80} r={60} fill="none" stroke="#1a56db" strokeWidth={8}
        strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)}
        strokeLinecap="round" transform="rotate(-90 80 80)" />
      <text x={80} y={86} textAnchor="middle" fill="#111827" fontSize={15} fontWeight={700} fontFamily={fontFamily}>{label}</text>
    </svg>
  );
};

const ArrowVisual: React.FC<{ progress: number; label: string }> = ({ progress, label }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
    <div style={{ width: 4, height: interpolate(progress, [0, 1], [0, 80]), backgroundColor: "#1a56db", borderRadius: 2 }} />
    <div style={{ opacity: progress, width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "16px solid #1a56db" }} />
    <div style={{ opacity: progress, fontSize: 14, color: "#6b7280", fontFamily }}>{label}</div>
  </div>
);

const LayersVisual: React.FC<{ progress: number; label: string }> = ({ progress, label }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "stretch", width: 140 }}>
    {[["#1a56db", "层 3"], ["#3b82f6", "层 2"], ["#93c5fd", "层 1"]].map(([color, text], i) => (
      <div key={i} style={{ height: 32, backgroundColor: color, borderRadius: 6, opacity: interpolate(progress, [i * 0.2, i * 0.2 + 0.4], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" }), display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 12, color: "#fff", fontFamily, fontWeight: 700 }}>{text}</span>
      </div>
    ))}
    <div style={{ fontSize: 12, color: "#6b7280", fontFamily, textAlign: "center", marginTop: 4 }}>{label}</div>
  </div>
);

export const ConceptScene: React.FC<ConceptSceneProps> = ({ audioFile, label, title, term, definition, visual = "cycle", visualLabel = "", note }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 200 } });
  const cardIn = spring({ frame: frame - 15, fps, config: { damping: 200 } });
  const visualProgress = interpolate(frame, [20, 60], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const noteOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#f9fafb", fontFamily, padding: "60px 80px" }}>
      <Audio src={staticFile(audioFile)} />
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, backgroundColor: "#1a56db" }} />

      <div style={{ opacity: titleIn, transform: `translateY(${interpolate(titleIn, [0, 1], [20, 0])}px)`, marginBottom: 40 }}>
        {label && <div style={{ fontSize: 14, color: "#1a56db", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>}
        <div style={{ fontSize: 40, fontWeight: 700, color: "#111827" }}>{title}</div>
      </div>

      <div style={{ display: "flex", gap: 60, alignItems: "flex-start", flex: 1 }}>
        <div style={{ flex: 1, opacity: cardIn, transform: `translateX(${interpolate(cardIn, [0, 1], [-20, 0])}px)`, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: "24px 28px", borderLeft: "4px solid #1a56db", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>核心概念</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#111827", marginBottom: 12 }}>{term}</div>
            <div style={{ fontSize: 17, color: "#374151", lineHeight: 1.7 }}>{definition}</div>
          </div>
          {note && (
            <div style={{ opacity: noteOpacity, backgroundColor: "#eff6ff", borderRadius: 10, padding: "14px 20px", borderLeft: "3px solid #1a56db" }}>
              <div style={{ fontSize: 15, color: "#1e40af", lineHeight: 1.5 }}>{note}</div>
            </div>
          )}
        </div>

        <div style={{ width: 180, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 20 }}>
          {visual === "cycle" && <CycleVisual progress={visualProgress} label={visualLabel} />}
          {visual === "arrow" && <ArrowVisual progress={visualProgress} label={visualLabel} />}
          {visual === "layers" && <LayersVisual progress={visualProgress} label={visualLabel} />}
        </div>
      </div>
    </AbsoluteFill>
  );
};
