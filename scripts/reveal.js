const STAGGER_STEP = 90;
const STAGGER_CAP = 8;

const cascades = [...document.querySelectorAll("[data-reveal-cascade]")];
const singles = [...document.querySelectorAll("[data-reveal]")].filter(
  (element) => !element.parentElement?.closest("[data-reveal-cascade]"),
);

function stepFor(element) {
  return Number(element.dataset.revealStagger) || STAGGER_STEP;
}

function reveal(element, delay) {
  const manual = element.dataset.revealDelay;
  element.style.setProperty("--reveal-delay", manual ?? `${delay}ms`);
  element.classList.add("is-revealed");
}

function revealCascade(container) {
  const step = stepFor(container);
  const children = [...container.querySelectorAll("[data-reveal]")];

  children.forEach((child, index) => {
    reveal(child, Math.min(index, STAGGER_CAP) * step);
  });

  container.classList.add("is-revealed");
}

function revealTarget(element, delay) {
  if (element.dataset.revealCascade !== undefined) revealCascade(element);
  else reveal(element, delay);
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
    let step = STAGGER_STEP;

    if (group) {
      index = seenPerGroup.get(group) ?? 0;
      seenPerGroup.set(group, index + 1);
      step = stepFor(group);
    }

    revealTarget(element, Math.min(index, STAGGER_CAP) * step);
    observer.unobserve(element);
  }
}

const observer = new IntersectionObserver(onIntersect, {
  rootMargin: "0px 0px -12% 0px",
  threshold: 0,
});

for (const element of [...cascades, ...singles]) {
  observer.observe(element);
}

window.addEventListener(
  "scroll",
  () => {
    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 4;
    if (!atBottom) return;

    for (const element of [...cascades, ...singles]) {
      if (element.classList.contains("is-revealed")) continue;
      if (element.offsetParent === null) continue;

      revealTarget(element, 0);
      observer.unobserve(element);
    }
  },
  { passive: true },
);

document.addEventListener("animationend", (event) => {
  if (!event.animationName.startsWith("reveal-")) return;

  const element = event.target;
  const stillRunning = element
    .getAnimations()
    .some(
      (animation) =>
        animation.animationName?.startsWith("reveal-") &&
        animation.playState === "running",
    );

  if (!stillRunning) element.classList.add("reveal-done");
});

const galleryList = document.querySelector(".gallery");

function rearm(element) {
  element.classList.remove("is-revealed", "reveal-done");
  element.style.removeProperty("--reveal-delay");
  observer.observe(element);
}

if (galleryList) {
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      const item = mutation.target;
      if (item.hidden) continue;
      if (!item.matches("[data-reveal]")) continue;
      rearm(item);
    }
  }).observe(galleryList, {
    attributes: true,
    attributeFilter: ["hidden"],
    subtree: true,
  });
}
