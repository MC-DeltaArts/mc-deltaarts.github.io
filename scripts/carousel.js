const PAN_SPEED = 80; // pixels per second
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function setUpGallery(gallery) {
  const strip = gallery.querySelector(".media-strip");
  const track = gallery.querySelector(".media-track");
  const originals = [...track.children];

  function gapWidth() {
    return parseFloat(getComputedStyle(track).columnGap) || 0;
  }

  // one full set of images, plus the gap that follows it
  function setWidth() {
    const first = originals[0];
    const last = originals[originals.length - 1];
    return last.offsetLeft + last.offsetWidth - first.offsetLeft + gapWidth();
  }

  function addCopy() {
    for (const item of originals) {
      const copy = item.cloneNode(true);
      const copyLink = copy.querySelector(".media-link");
      const original = item.querySelector(".media-link");

      // a copy is scenery: no duplicate for screen readers, no tab stop,
      // and clicking it opens the lightbox on the image it copies
      copy.setAttribute("aria-hidden", "true");
      copy.querySelector("img").removeAttribute("loading");
      copyLink.classList.remove("gallery-link");
      copyLink.tabIndex = -1;
      copyLink.addEventListener("click", (event) => {
        event.preventDefault();
        original.click();
      });

      track.append(copy);
    }
  }

  function measure() {
    const distance = setWidth();

    // nothing to pan across, or the visitor asked for no motion
    if (distance <= 0 || reducedMotion.matches) {
      strip.classList.remove("is-panning");
      return;
    }

    // enough copies that the strip is never bare at the seam
    let guard = 20;
    while (track.scrollWidth < strip.clientWidth + distance && guard--) {
      addCopy();
    }

    track.style.setProperty("--pan-distance", `${distance}px`);
    track.style.setProperty(
      "--pan-duration",
      `${Math.max(10, Math.round(distance / PAN_SPEED))}s`,
    );

    strip.classList.add("is-panning");
  }

  measure();
  window.addEventListener("load", measure);
  window.addEventListener("resize", measure);
  reducedMotion.addEventListener("change", measure);
}

for (const gallery of document.querySelectorAll(".media-gallery")) {
  setUpGallery(gallery);
}
