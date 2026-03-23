import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/NotoSansSC";

const { fontFamily } = loadFont("normal", { weights: ["400", "700"] });

export type TensionSceneProps = {
  audioFile: string;
  label?: string;
  title: string;
  surface: { heading: string; text: string };
  reality: { heading: string; text: string };
  sourceLabel?: string;
};

export const TensionScene: React.FC<TensionSceneProps> = ({ audioFile, label, title, surface, reality, sourceLabel }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 200 } });
  const topIn = spring({ frame: frame - 15, fps, config: { damping: 200 } });
  const bottomIn = spring({ frame: frame - 30, fps, config: { damping: 200 } });
  const sourceOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff", fontFamily, padding: "60px 80px" }}>
      <Audio src={staticFile(audioFile)} />

      <div style={{ opacity: titleIn, transform: `translateY(${interpolate(titleIn, [0, 1], [20, 0])}px)`, marginBottom: 32 }}>
        {label && <div style={{ fontSize: 14, color: "#1a56db", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>}
        <div style={{ fontSize: 40, fontWeight: 700, color: "#111827" }}>{title}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
        {/* 上：表面现象（绿） */}
        <div style={{ flex: 1, opacity: topIn, transform: `translateY(${interpolate(topIn, [0, 1], [-20, 0])}px)`, backgroundColor: "#f0fdf4", borderRadius: 16, padding: "28px 32px", borderLeft: "5px solid #10b981", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 14, color: "#fff" }}>👀</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.06em" }}>{surface.heading}</div>
          </div>
          <div style={{ fontSize: 20, color: "#374151", lineHeight: 1.6 }}>{surface.text}</div>
        </div>

        {/* 中：VS 分隔 */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, opacity: interpolate(frame, [35, 50], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" }) }}>
          <div style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.1em" }}>BUT</div>
          <div style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
        </div>

        {/* 下：真实情况（红） */}
        <div style={{ flex: 1, opacity: bottomIn, transform: `translateY(${interpolate(bottomIn, [0, 1], [20, 0])}px)`, backgroundColor: "#fef2f2", borderRadius: 16, padding: "28px 32px", borderLeft: "5px solid #dc2626", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 14, color: "#fff" }}>⚡</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#7f1d1d", textTransform: "uppercase", letterSpacing: "0.06em" }}>{reality.heading}</div>
          </div>
          <div style={{ fontSize: 20, color: "#374151", lineHeight: 1.6 }}>{reality.text}</div>
          {sourceLabel && <div style={{ opacity: sourceOpacity, fontSize: 13, color: "#9ca3af", marginTop: 4 }}>来源：{sourceLabel}</div>}
        </div>
      </div>
    </AbsoluteFill>
  );
};
