import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/NotoSansSC";

const { fontFamily } = loadFont("normal", { weights: ["400", "700"] });

export type CaseItem = {
  company: string;
  subtitle?: string;
  description: string;
  metric?: { value: number; unit: string; label: string };
  badge?: string;
  color?: string;
};

export type CaseSceneProps = {
  audioFile: string;
  label?: string;
  title: string;
  cases: [CaseItem] | [CaseItem, CaseItem];
};

const CountUp: React.FC<{ value: number; frame: number; fps: number }> = ({ value, frame, fps }) => {
  const current = Math.round(value * interpolate(frame, [0, 1.5 * fps], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" }));
  return <span>{current}</span>;
};

const CaseCard: React.FC<{ item: CaseItem; cardIn: number; badgeOpacity: number; frame: number; fps: number; delay: number }> = ({ item, cardIn, badgeOpacity, frame, fps, delay }) => {
  const color = item.color ?? "#1a56db";
  return (
    <div style={{ flex: 1, opacity: cardIn, transform: `translateY(${interpolate(cardIn, [0, 1], [30, 0])}px)`, backgroundColor: "#f9fafb", borderRadius: 16, padding: "32px", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", border: "3px solid white" }} />
      </div>
      <div>
        {item.subtitle && <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>{item.subtitle}</div>}
        <div style={{ fontSize: 20, fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>{item.company}</div>
      </div>
      {item.metric && (
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 60, fontWeight: 700, color, lineHeight: 1 }}>
            <CountUp value={item.metric.value} frame={frame - delay} fps={fps} />
          </span>
          <span style={{ fontSize: 26, fontWeight: 700, color }}>{item.metric.unit}</span>
        </div>
      )}
      {item.metric && <div style={{ fontSize: 15, color: "#374151" }}>{item.metric.label}</div>}
      {!item.metric && <div style={{ fontSize: 16, color: "#374151", lineHeight: 1.6 }}>{item.description}</div>}
      {item.metric && <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.5 }}>{item.description}</div>}
      {item.badge && (
        <div style={{ opacity: badgeOpacity, alignSelf: "flex-start", backgroundColor: color + "22", color, fontSize: 12, padding: "4px 12px", borderRadius: 999, fontWeight: 600 }}>
          {item.badge}
        </div>
      )}
    </div>
  );
};

export const CaseScene: React.FC<CaseSceneProps> = ({ audioFile, label, title, cases }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 200 } });
  const card1In = spring({ frame: frame - 10, fps, config: { damping: 200 } });
  const card2In = spring({ frame: frame - 25, fps, config: { damping: 200 } });
  const badgeOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff", fontFamily, padding: "60px 80px" }}>
      <Audio src={staticFile(audioFile)} />
      <div style={{ opacity: titleIn, transform: `translateY(${interpolate(titleIn, [0, 1], [20, 0])}px)`, marginBottom: 44 }}>
        {label && <div style={{ fontSize: 14, color: "#1a56db", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>}
        <div style={{ fontSize: 40, fontWeight: 700, color: "#111827" }}>{title}</div>
      </div>
      <div style={{ display: "flex", gap: 32, alignItems: "stretch" }}>
        <CaseCard item={cases[0]} cardIn={card1In} badgeOpacity={badgeOpacity} frame={frame} fps={fps} delay={10} />
        {cases[1] && <CaseCard item={cases[1]} cardIn={card2In} badgeOpacity={badgeOpacity} frame={frame} fps={fps} delay={25} />}
      </div>
    </AbsoluteFill>
  );
};
