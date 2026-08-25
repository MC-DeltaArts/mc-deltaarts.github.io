const dialog = document.querySelector(".lightbox");
const image = dialog.querySelector(".lightbox-image");
const titleEl = dialog.querySelector(".lightbox-title");
const dateEl = dialog.querySelector(".lightbox-date");
const allLinks = [...document.querySelectorAll(".gallery-link")];

let currentIndex = 0;

function visibleLinks() {
  return allLinks.filter((link) => !link.closest(".gallery-item").hidden);
}

function show(index) {
  const links = visibleLinks();
  if (links.length === 0) return;

  currentIndex = (index + links.length) % links.length;

  const link = links[currentIndex];

  image.src = link.href;
  image.alt = link.dataset.description;

  titleEl.textContent = link.dataset.title;
  titleEl.removeAttribute("aria-label");
  if (link.dataset.titleSpoken !== link.dataset.title) {
    titleEl.setAttribute("aria-label", link.dataset.titleSpoken);
  }

  dateEl.textContent = link.dataset.date.slice(0, 4);
  dateEl.setAttribute("datetime", link.dataset.date);
}

for (const link of allLinks) {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    show(visibleLinks().indexOf(link));
    dialog.showModal();
  });
}

dialog
  .querySelector(".lightbox-next")
  .addEventListener("click", () => show(currentIndex + 1));
dialog
  .querySelector(".lightbox-prev")
  .addEventListener("click", () => show(currentIndex - 1));
dialog
  .querySelector(".lightbox-close")
  .addEventListener("click", () => dialog.close());

dialog.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") show(currentIndex + 1);
  if (event.key === "ArrowLeft") show(currentIndex - 1);
});

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
