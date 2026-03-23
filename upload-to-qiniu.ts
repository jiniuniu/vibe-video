import { statSync } from "fs";
import { join } from "path";
import * as qiniu from "qiniu";

const ACCESS_KEY = process.env.QINIU_ACCESS_KEY;
const SECRET_KEY = process.env.QINIU_SECRET_KEY;
const BUCKET_NAME = process.env.QINIU_BUCKET_NAME;
const DOMAIN = process.env.QINIU_DOMAIN;

if (!ACCESS_KEY || !SECRET_KEY || !BUCKET_NAME || !DOMAIN) {
  console.error("请在 .env 中配置 QINIU_ACCESS_KEY / QINIU_SECRET_KEY / QINIU_BUCKET_NAME / QINIU_DOMAIN");
  process.exit(1);
}

const slug = process.argv[2];
if (!slug) {
  console.error("用法: node --env-file=.env --experimental-strip-types upload-to-qiniu.ts <slug>");
  console.error("示例: node --env-file=.env --experimental-strip-types upload-to-qiniu.ts ai-hardware");
  process.exit(1);
}

const LOCAL_PATH = join(process.cwd(), "out", `${slug}.mp4`);
const KEY = `vibe-remotion-videos/${slug}.mp4`;

// 检查本地文件是否存在
try {
  statSync(LOCAL_PATH);
} catch {
  console.error(`✗ 文件不存在: ${LOCAL_PATH}`);
  console.error(`请先运行: pnpm exec remotion render ${slug} out/${slug}.mp4`);
  process.exit(1);
}

const mac = new qiniu.auth.digest.Mac(ACCESS_KEY, SECRET_KEY);
const putPolicy = new qiniu.rs.PutPolicy({ scope: `${BUCKET_NAME}:${KEY}`, expires: 7200 });
const uploadToken = putPolicy.uploadToken(mac);

const config = new qiniu.conf.Config();
config.zone = qiniu.zone.Zone_z0; // 华东，按需修改

const formUploader = new qiniu.form_up.FormUploader(config);
const putExtra = new qiniu.form_up.PutExtra();

console.log(`\n上传 ${slug} 到七牛云...`);
console.log(`  本地文件: ${LOCAL_PATH}`);
console.log(`  目标路径: ${KEY}`);

formUploader.putFile(uploadToken, KEY, LOCAL_PATH, putExtra, (err, body, info) => {
  if (err) {
    console.error("✗ 上传失败:", err);
    process.exit(1);
  }
  if (info.statusCode === 200) {
    const url = `${DOMAIN}/${KEY}`;
    console.log(`\n✅ 上传成功`);
    console.log(`  访问地址: ${url}`);
  } else {
    console.error(`✗ 上传失败 (${info.statusCode}):`, body);
    process.exit(1);
  }
});
