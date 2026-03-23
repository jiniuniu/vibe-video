import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/NotoSansSC";

const { fontFamily } = loadFont("normal", { weights: ["400", "700"] });

export type AnalogyConceptProps = {
  audioFile: string;
  label?: string;
  title: string;
  concept: { term: string; description: string; icon?: string };
  analogy: { object: string; description: string; icon?: string };
  mapping?: Array<{ conceptItem: string; analogyItem: string }>;
};

export const AnalogyConcept: React.FC<AnalogyConceptProps> = ({ audioFile, label, title, concept, analogy, mapping }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 200 } });
  const leftIn = spring({ frame: frame - 15, fps, config: { damping: 200 } });
  const rightIn = spring({ frame: frame - 25, fps, config: { damping: 200 } });
  const arrowOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const mappingOpacity = interpolate(frame, [45, 65], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff", fontFamily, padding: "60px 80px" }}>
      <Audio src={staticFile(audioFile)} />

      <div style={{ opacity: titleIn, transform: `translateY(${interpolate(titleIn, [0, 1], [20, 0])}px)`, marginBottom: 36 }}>
        {label && <div style={{ fontSize: 14, color: "#1a56db", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>}
        <div style={{ fontSize: 40, fontWeight: 700, color: "#111827" }}>{title}</div>
      </div>

      <div style={{ display: "flex", gap: 0, alignItems: "stretch", flex: 1 }}>
        {/* 左：技术概念 */}
        <div style={{ flex: 1, opacity: leftIn, transform: `translateX(${interpolate(leftIn, [0, 1], [-24, 0])}px)`, backgroundColor: "#eff6ff", borderRadius: "16px 0 0 16px", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 13, color: "#1a56db", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>技术概念</div>
          {concept.icon && <div style={{ fontSize: 36 }}>{concept.icon}</div>}
          <div style={{ fontSize: 24, fontWeight: 700, color: "#1e3a8a" }}>{concept.term}</div>
          <div style={{ fontSize: 16, color: "#374151", lineHeight: 1.6 }}>{concept.description}</div>
        </div>

        {/* 中：箭头 */}
        <div style={{ width: 60, display: "flex", alignItems: "center", justifyContent: "center", opacity: arrowOpacity, backgroundColor: "#f3f4f6" }}>
          <div style={{ fontSize: 28, color: "#9ca3af" }}>≈</div>
        </div>

        {/* 右：类比 */}
        <div style={{ flex: 1, opacity: rightIn, transform: `translateX(${interpolate(rightIn, [0, 1], [24, 0])}px)`, backgroundColor: "#f0fdf4", borderRadius: "0 16px 16px 0", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 13, color: "#10b981", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>类比理解</div>
          {analogy.icon && <div style={{ fontSize: 36 }}>{analogy.icon}</div>}
          <div style={{ fontSize: 24, fontWeight: 700, color: "#065f46" }}>{analogy.object}</div>
          <div style={{ fontSize: 16, color: "#374151", lineHeight: 1.6 }}>{analogy.description}</div>
        </div>
      </div>

      {/* 映射项 */}
      {mapping && mapping.length > 0 && (
        <div style={{ opacity: mappingOpacity, marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {mapping.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "#f9fafb", borderRadius: 8, padding: "8px 16px", border: "1px solid #e5e7eb" }}>
              <span style={{ fontSize: 14, color: "#1e40af", fontWeight: 600 }}>{item.conceptItem}</span>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>→</span>
              <span style={{ fontSize: 14, color: "#065f46", fontWeight: 600 }}>{item.analogyItem}</span>
            </div>
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};
