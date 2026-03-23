import "./index.css";
import { Composition } from "remotion";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const require: any;

// webpack require.context 自动扫描所有视频的 Composition.tsx，无需手动注册
const ctx = require.context("./videos", true, /\/Composition\.tsx$/);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const compositions: any[] = ctx.keys().map((key: string) => ctx(key).meta);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {compositions.map((meta) => (
        <Composition
          key={meta.id}
          id={meta.id}
          component={meta.component}
          durationInFrames={300}
          fps={30}
          width={1280}
          height={720}
          defaultProps={meta.defaultProps}
          calculateMetadata={meta.calculateMetadata}
        />
      ))}
    </>
  );
};
