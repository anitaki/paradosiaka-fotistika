// Poulimenos Handmade — product photo viewer (product pages)
// Tap/click a product photo to open it full screen (PhotoSwipe):
//   desktop: click or mouse wheel to zoom, drag to pan, arrow keys to browse, Esc to close
//   phone:   pinch or double-tap to zoom, swipe left/right to browse, swipe down to close

const productsSection = document.getElementById("products-section");

const GALLERY_TEXT = {
  open: { gr: "Μεγέθυνση φωτογραφίας", en: "Enlarge photo" },
  close: { gr: "Κλείσιμο (Esc)", en: "Close (Esc)" },
  zoom: { gr: "Μεγέθυνση", en: "Zoom" },
  prev: { gr: "Προηγούμενο", en: "Previous" },
  next: { gr: "Επόμενο", en: "Next" },
  error: { gr: "Η φωτογραφία δεν φόρτωσε.", en: "The photo could not be loaded." },
};

function galleryLang() {
  return document.documentElement.lang === "en" ? "en" : "gr";
}

function productImages() {
  return [...productsSection.querySelectorAll(".polaroid img")];
}

// make every product photo reachable and announced as a button (also after a language switch re-render)
function prepareProductImages() {
  const lang = galleryLang();
  productImages().forEach((img) => {
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute("aria-label", `${GALLERY_TEXT.open[lang]}: ${img.alt || ""}`.trim());
  });
}

function openGallery(index) {
  const lang = galleryLang();
  const images = productImages();
  const dataSource = images.map((img) => {
    const card = img.closest(".polaroid");
    const name = card.querySelector(".polaroid-codename");
    const desc = card.querySelector(".container p:not(.polaroid-codename)");
    return {
      src: img.currentSrc || img.src,
      msrc: img.currentSrc || img.src,
      width: img.naturalWidth || 1000,
      height: img.naturalHeight || 1000,
      alt: img.alt,
      element: img,
      caption: { name: name ? name.textContent.trim() : "", desc: desc ? desc.textContent.trim() : "" },
    };
  });

  const pswp = new window.PhotoSwipe({
    dataSource,
    index,
    bgOpacity: 1,
    showHideAnimationType: "zoom",
    // keep room under the photo for the caption (and around it for the arrows on desktop)
    paddingFn: (viewport) =>
      viewport.x < 700
        ? { top: 56, bottom: 120, left: 0, right: 0 }
        : { top: 28, bottom: 104, left: 76, right: 76 },
    // photos are fairly small, so allow zooming beyond their natural size to look at details
    secondaryZoomLevel: (zoom) => Math.min(Math.max(zoom.fit * 2, 1), 4),
    maxZoomLevel: (zoom) => Math.min(Math.max(zoom.fit * 3, 2), 6),
    closeTitle: GALLERY_TEXT.close[lang],
    zoomTitle: GALLERY_TEXT.zoom[lang],
    arrowPrevTitle: GALLERY_TEXT.prev[lang],
    arrowNextTitle: GALLERY_TEXT.next[lang],
    errorMsg: GALLERY_TEXT.error[lang],
  });

  // product name + description under the photo
  pswp.on("uiRegister", () => {
    pswp.ui.registerElement({
      name: "product-caption",
      order: 9,
      isButton: false,
      appendTo: "root",
      onInit: (el) => {
        const update = () => {
          const caption = pswp.currSlide && pswp.currSlide.data.caption;
          el.replaceChildren();
          if (!caption) return;
          const title = document.createElement("strong");
          title.textContent = caption.name;
          const text = document.createElement("span");
          text.textContent = caption.desc;
          el.append(title, text);
        };
        pswp.on("change", update);
        update();
      },
    });
  });

  // put keyboard focus back on the photo that was open when the viewer closes
  pswp.on("destroy", () => {
    const current = images[pswp.currIndex];
    if (current) current.focus({ preventScroll: true });
  });

  pswp.init();
}

if (productsSection && window.PhotoSwipe) {
  productsSection.addEventListener("click", (event) => {
    const img = event.target.closest(".polaroid img");
    if (!img) return;
    openGallery(productImages().indexOf(img));
  });

  productsSection.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target.matches(".polaroid img")) {
      event.preventDefault();
      openGallery(productImages().indexOf(event.target));
    }
  });

  // products.js builds (and on language change rebuilds) the cards
  new MutationObserver(prepareProductImages).observe(productsSection, { childList: true });
  prepareProductImages();
}
