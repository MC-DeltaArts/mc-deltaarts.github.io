const STAGGER_STEP = 75;
const STAGGER_CAP = 8;

const targets = [...document.querySelectorAll("[data-reveal]")];

function reveal(element, delay) {
  element.style.setProperty("--reveal-delay", `${delay}ms`);
  element.classList.add("is-revealed");
}

function inDocumentOrder(a, b) {
  const position = a.target.compareDocumentPosition(b.target);
  return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

function onIntersect(entries, observer) {
  const entering = entries.filter((entry) => entry.isIntersecting);
  if (entering.length === 0) return;

  entering.sort(inDocumentOrder);

  const seenPerGroup = new Map();

  for (const entry of entering) {
    const element = entry.target;
    const group = element.parentElement?.closest("[data-reveal-stagger]");
    let index = 0;

    if (group) {
      index = seenPerGroup.get(group) ?? 0;
      seenPerGroup.set(group, index + 1);
    }

    reveal(element, Math.min(index, STAGGER_CAP) * STAGGER_STEP);
    observer.unobserve(element);
  }
}

const observer = new IntersectionObserver(onIntersect, {
  rootMargin: "0px 0px -12% 0px",
  threshold: 0,
});

for (const element of targets) {
  observer.observe(element);
}

window.addEventListener(
  "scroll",
  () => {
    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 4;
    if (!atBottom) return;

    for (const element of targets) {
      if (element.classList.contains("is-revealed")) continue;
      if (element.offsetParent === null) continue;

      reveal(element, 0);
      observer.unobserve(element);
    }
  },
  { passive: true },
);

document.addEventListener("animationend", (event) => {
  if (!event.animationName.startsWith("reveal-")) return;
  event.target.classList.add("reveal-done");
});
