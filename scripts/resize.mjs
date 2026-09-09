import sharp from "sharp";
import { readdir, mkdir, access } from "node:fs/promises";

const WIDTHS = [400, 800, 1600];
const PROJECTS = "assets/imgs/project-imgs";

const sources = [
  "assets/imgs/artworks",
  ...(await readdir(PROJECTS, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && entry.name !== "thumbs")
    .map((entry) => `${PROJECTS}/${entry.name}`),
];

for (const src of sources) {
  const out = `${src}/thumbs`;
  await mkdir(out, { recursive: true });

  const files = await readdir(src);
  const images = files.filter((name) => name.endsWith(".webp"));

  for (const file of images) {
    const { width: sourceWidth } = await sharp(`${src}/${file}`).metadata();

    for (const width of WIDTHS) {
      // never upscale, the copy would be heavier than the original for nothing
      if (width >= sourceWidth) continue;

      const target = `${out}/${width}-${file}`;

      try {
        await access(target);
        continue;
      } catch {
        // file doesn't exist, so make it
      }

      await sharp(`${src}/${file}`, { animated: true })
        .resize({ width })
        .webp({ quality: 85 })
        .toFile(target);

      console.log(`made ${width}-${file}`);
    }
  }
}

console.log("All done!");
