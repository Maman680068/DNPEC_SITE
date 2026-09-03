import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "public/logos/logo-dnpec-clean.png");
const INSET_RATIO = 0.15;

async function exportIcon(outPath, size) {
  const trimmedBuf = await sharp(src).trim({ threshold: 15 }).toBuffer();
  const meta = await sharp(trimmedBuf).metadata();
  const inset = Math.round(Math.min(meta.width, meta.height) * INSET_RATIO);
  const side = meta.width - inset * 2;

  const img = await sharp(trimmedBuf)
    .extract({ left: inset, top: inset, width: side, height: side })
    .resize(size, size, { fit: "fill", kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 0.6 })
    .toBuffer();

  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`,
  );

  await sharp(img)
    .composite([{ input: await sharp(mask).resize(size, size).png().toBuffer(), blend: "dest-in" }])
    .png()
    .toFile(outPath);

  console.log("wrote", outPath);
}

await exportIcon(path.join(root, "app/icon.png"), 512);
await exportIcon(path.join(root, "app/apple-icon.png"), 180);
await exportIcon(path.join(root, "public/logos/favicon-dnpec.png"), 192);
