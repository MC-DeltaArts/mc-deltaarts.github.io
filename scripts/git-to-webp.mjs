import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";

const SRC = "assets/imgs/to-convert";
const OUT = "assets/imgs/artworks";

await mkdir(OUT, { recursive: true });

const files = await readdir(SRC);
const gifs = files.filter((name) => name.endsWith(".gif"));

for (const file of gifs) {
  const target = `${OUT}/${file.replace(".gif", ".webp")}`;

  await sharp(`${SRC}/${file}`, { animated: true })
    .webp({ quality: 80 })
    .toFile(target);

  console.log(`converted ${file}`);
}

console.log("All Done!");
