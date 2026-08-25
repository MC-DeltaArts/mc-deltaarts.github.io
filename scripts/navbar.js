const toggle = document.querySelector(".nav-toggle");
const menu = document.querySelector("#nav-menu");

function setOpen(open) {
  toggle.setAttribute("aria-expanded", String(open));
  menu.hidden = !open;
}

toggle.addEventListener("click", () => {
  const isOpen = toggle.getAttribute("aria-expanded") === "true";
  setOpen(!isOpen);
});

// close when a link is clicked
for (const link of menu.querySelectorAll("a")) {
  link.addEventListener("click", () => setOpen(false));
}

// close on Escape
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setOpen(false);
});
