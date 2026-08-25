const PAGE_SIZE = 10;

const gallery = document.querySelector(".gallery");
const checkboxes = document.querySelectorAll(".filter-chip input");
const items = [...document.querySelectorAll(".gallery-item")];
const loadMore = document.querySelector(".load-more");
const emptyMsg = document.querySelector(".gallery-empty");
const countMsg = document.querySelector(".gallery-count");

let shown = PAGE_SIZE;

function matchingItems() {
  const active = [...checkboxes]
    .filter((box) => box.checked)
    .map((box) => box.value);

  return items.filter((item) => {
    const tags = item.dataset.tags.split("|");
    return active.length === 0 || active.every((tag) => tags.includes(tag));
  });
}

function updateVisibility() {
  const matches = matchingItems();

  for (const item of items) {
    item.hidden = true;
  }

  for (const item of matches.slice(0, shown)) {
    item.hidden = false;
  }

  emptyMsg.hidden = matches.length > 0;
  gallery.hidden = matches.length === 0;
  loadMore.hidden = shown >= matches.length;
  countMsg.textContent =
    matches.length === 0
      ? ""
      : `Showing ${Math.min(shown, matches.length)} of ${matches.length}`;
}

function applyFilters() {
  gallery.classList.add("is-switching");

  setTimeout(() => {
    shown = PAGE_SIZE;
    updateVisibility();
    gallery.classList.remove("is-switching");
  }, 200);
}

loadMore.addEventListener("click", () => {
  const firstNew = matchingItems()[shown];
  shown += PAGE_SIZE;
  updateVisibility();

  if (firstNew) {
    firstNew.querySelector("a").focus();
  }
});

for (const box of checkboxes) {
  box.addEventListener("change", applyFilters);
}

updateVisibility();
