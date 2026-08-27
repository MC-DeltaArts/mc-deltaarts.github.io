const TITLES = [
  {
    text: "Marco Caramazza",
    weight: 3,
    hold: 4000,
    subtitles: [
      { text: "Welcome to my portfolio", weight: 3 },
      { text: "Hope you stay a while!", weight: 1 },
    ],
  },
  {
    text: "Delta",
    weight: 1,
    subtitles: [
      { text: "Or at least that's what they call me", weight: 3 },
      { text: "The greek delta and epsilon are optional", weight: 1 },
    ],
  },
  {
    text: "An Artist",
    weight: 1,
    subtitles: [
      { text: "Drawing longer than I've been coding", weight: 1 },
      { text: "Let's make some art together" },
    ],
  },
  {
    text: "A Game Designer",
    weight: 1,
    subtitles: [
      { text: "If I make 'em, I play 'em", weight: 1 },
      { text: "Your vision? My pleasure" },
    ],
  },
];

const TYPE_SPEED = 90;
const DELETE_SPEED = 45;
const HOLD = 3000;
const PAUSE_BEFORE_TYPING = 400;
const SUBTITLE_IN = 700;
const SUBTITLE_OUT = 350;

const titleStack = document.querySelector(".intro-title");
const subtitleStack = document.querySelector(".intro-subtitle .type-stack");

if (titleStack && subtitleStack) {
  const titleText = titleStack.querySelector(".type-text");
  const caret = titleStack.querySelector(".type-caret");
  const subtitleLive = subtitleStack.querySelector(".type-live");
  const subtitleText = subtitleStack.querySelector(".type-text");

  subtitleLive.style.setProperty("--subtitle-in", `${SUBTITLE_IN}ms`);
  subtitleLive.style.setProperty("--subtitle-out", `${SUBTITLE_OUT}ms`);

  buildSizers(
    titleStack,
    TITLES.map((title) => title.text),
  );
  buildSizers(
    subtitleStack,
    TITLES.flatMap((title) => title.subtitles.map((sub) => sub.text)),
  );

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    titleText.textContent = TITLES[0].text;
    subtitleText.textContent = TITLES[0].subtitles[0].text;
    subtitleLive.classList.add("is-visible");
    caret.remove();
  } else {
    run();
  }

  function buildSizers(stack, texts) {
    const live = stack.querySelector(".type-live");

    for (const text of texts) {
      const sizer = document.createElement("span");
      sizer.className = "type-sizer";
      sizer.textContent = text;
      stack.insertBefore(sizer, live);
    }
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function pickWeighted(items, exclude) {
    const pool = items.filter((item) => item !== exclude);
    const list = pool.length > 0 ? pool : items;
    const total = list.reduce((sum, item) => sum + (item.weight ?? 1), 0);

    let roll = Math.random() * total;

    for (const item of list) {
      roll -= item.weight ?? 1;
      if (roll < 0) return item;
    }

    return list[list.length - 1];
  }

  async function typeTitle(text) {
    caret.classList.remove("is-blinking");

    for (let length = 1; length <= text.length; length++) {
      titleText.textContent = text.slice(0, length);
      await sleep(TYPE_SPEED);
    }

    caret.classList.add("is-blinking");
  }

  async function deleteTitle() {
    const text = titleText.textContent;
    caret.classList.remove("is-blinking");

    for (let length = text.length - 1; length >= 0; length--) {
      titleText.textContent = text.slice(0, length);
      await sleep(DELETE_SPEED);
    }

    caret.classList.add("is-blinking");
  }

  async function showSubtitle(text) {
    subtitleText.textContent = text;
    subtitleLive.classList.add("is-visible");
    await sleep(SUBTITLE_IN);
  }

  async function hideSubtitle() {
    subtitleLive.classList.remove("is-visible");
    await sleep(SUBTITLE_OUT);
  }

  async function run() {
    const lastSubtitle = new Map();

    let title = TITLES[0];
    let subtitle = title.subtitles[0];

    while (true) {
      await typeTitle(title.text);
      await showSubtitle(subtitle.text);
      await sleep(title.hold ?? HOLD);
      await hideSubtitle();
      await deleteTitle();
      await sleep(PAUSE_BEFORE_TYPING);

      lastSubtitle.set(title, subtitle);
      title = pickWeighted(TITLES, title);
      subtitle = pickWeighted(title.subtitles, lastSubtitle.get(title));
    }
  }
}
