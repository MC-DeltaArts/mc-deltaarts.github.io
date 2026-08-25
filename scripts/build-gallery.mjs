import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";

const DATA = "data/artworks.json";
const PAGE = "index.html";
const SRC = "assets/imgs/artworks";
const THUMBS = "assets/imgs/artworks/thumbs";

const artworks = JSON.parse(await readFile(DATA, "utf8"));

artworks.sort((a, b) => b.date.localeCompare(a.date));

const items = [];

function escapeAttr(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

for (const art of artworks) {
  const meta = await sharp(`${SRC}/${art.file}`).metadata();
  const height = meta.pageHeight ?? meta.height;
  const ratio = (meta.width / meta.height).toFixed(3);

  items.push(`
      <li class="gallery-item" data-reveal="fade" data-tags="${art.tags.join("|")}" style="--ratio: ${ratio}">
          <a href="${THUMBS}/1600-${art.file}"
           class="gallery-link"
           data-title="${escapeAttr(art.title)}"
           data-title-spoken="${escapeAttr(art.titleSpoken ?? art.title)}"
           data-date="${art.date}"
           data-description="${escapeAttr(art.description)}">
          <img
            src="${THUMBS}/400-${art.file}"
            srcset="${THUMBS}/400-${art.file} 400w,
                    ${THUMBS}/800-${art.file} 800w,
                    ${THUMBS}/1600-${art.file} 1600w"
            sizes="(min-width: 700px) 600px, 95vw"
            width="${meta.width}"
            height="${height}"
            alt="${escapeAttr(art.alt)}"
            loading="lazy"
            decoding="async"
          />
        </a>
      </li>`);
}

const gallery = `<ul role="list" class="gallery" data-reveal-stagger>${items.join("")}\n    </ul>`;

const page = await readFile(PAGE, "utf8");
const updated = page.replace(
  /<!--GALLERY:START-->[\s\S]*?<!--GALLERY:END-->/,
  `<!--GALLERY:START-->\n    ${gallery}\n    <!--GALLERY:END-->`,
);

await writeFile(PAGE, updated);
console.log(`Wrote ${artworks.length} artworks into ${PAGE}.`);
