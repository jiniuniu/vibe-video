import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/NotoSansSC";

const { fontFamily } = loadFont("normal", { weights: ["400", "700"] });

export type QuoteSceneProps = {
  audioFile: string;
  label?: string;
  title: string;
  quote: string;
  author: string;
  authorTitle?: string;
  points?: string[];
};

export const QuoteScene: React.FC<QuoteSceneProps> = ({ audioFile, label, title, quote, author, authorTitle, points }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 200 } });
  const quoteIn = spring({ frame: frame - 20, fps, config: { damping: 200 } });
  const pointsIn = interpolate(frame, [40, 65], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const barHeight = interpolate(frame, [15, 45], [0, 100], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#fafafa", fontFamily, padding: "60px 80px" }}>
      <Audio src={staticFile(audioFile)} />

      <div style={{ opacity: titleIn, transform: `translateY(${interpolate(titleIn, [0, 1], [20, 0])}px)`, marginBottom: 36 }}>
        {label && <div style={{ fontSize: 14, color: "#1a56db", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>}
        <div style={{ fontSize: 40, fontWeight: 700, color: "#111827" }}>{title}</div>
      </div>

      <div style={{ display: "flex", gap: 48, alignItems: "flex-start" }}>
        <div style={{ flex: 1.2, opacity: quoteIn }}>
          <div style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
            <div style={{ width: 4, backgroundColor: "#374151", borderRadius: 2, height: `${barHeight}%`, minHeight: 4, alignSelf: "flex-start" }} />
            <div>
              <div style={{ fontSize: 16, color: "#374151", lineHeight: 1.7, fontStyle: "italic", marginBottom: 16 }}>"{quote}"</div>
              <div style={{ fontSize: 14, color: "#6b7280", fontWeight: 600 }}>— {author}{authorTitle ? `，${authorTitle}` : ""}</div>
            </div>
          </div>
        </div>

        {points && points.length > 0 && (
          <div style={{ flex: 1, opacity: pointsIn, display: "flex", flexDirection: "column", gap: 14 }}>
            {points.map((p, i) => (
              <div key={i} style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: "16px 20px", display: "flex", gap: 12, alignItems: "flex-start", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#1a56db", marginTop: 6, flexShrink: 0 }} />
                <div style={{ fontSize: 15, color: "#374151", lineHeight: 1.5 }}>{p}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
