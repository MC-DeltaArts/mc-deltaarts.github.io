import sharp from "sharp";
import { readdir, mkdir, access } from "node:fs/promises";

const PROJECTS = "assets/imgs/project-imgs";

const sources = [
  { dir: "assets/imgs/artworks", widths: [400, 800, 1600] },
  ...(await readdir(PROJECTS, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && entry.name !== "thumbs")
    .map((entry) => ({ dir: `${PROJECTS}/${entry.name}`, widths: [800] })),
];

for (const { dir, widths } of sources) {
  const out = `${dir}/thumbs`;
  await mkdir(out, { recursive: true });

  const files = await readdir(dir);
  const images = files.filter((name) => name.endsWith(".webp"));

  for (const file of images) {
    const { width: sourceWidth } = await sharp(`${dir}/${file}`).metadata();

    for (const width of widths) {
      // never upscale, the copy would be heavier than the original for nothing
      if (width >= sourceWidth) continue;

      const target = `${out}/${width}-${file}`;

      try {
        await access(target);
        continue;
      } catch {
        // file doesn't exist, so make it
      }

      await sharp(`${dir}/${file}`, { animated: true })
        .resize({ width })
        .webp({ quality: 85 })
        .toFile(target);

      console.log(`made ${width}-${file}`);
    }
  }
}

console.log("All done!");
