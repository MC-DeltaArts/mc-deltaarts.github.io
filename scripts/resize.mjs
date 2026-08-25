import sharp from "sharp";
import { readdir, mkdir, access } from "node:fs/promises";

const SRC = "assets/imgs/artworks";
const OUT = "assets/imgs/artworks/thumbs";

await mkdir(OUT, { recursive: true });

const files = await readdir(SRC);
const images = files.filter((name) => name.endsWith(".webp"));

for (const file of images) {
  for (const width of [400, 800, 1600]) {
    const target = `${OUT}/${width}-${file}`;

    try {
      await access(target);
      continue;
    } catch {
      // file doesn't exist, so make it
    }

    await sharp(`${SRC}/${file}`, { animated: true })
      .resize({ width })
      .webp({ quality: 85 })
      .toFile(target);

    console.log(`made ${width}-${file}`);
  }
}

console.log("All done!");
