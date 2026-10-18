const toggleButton = document.getElementById("langToggle");
const langButtons = document.querySelectorAll(".lang-switch button");
let currentLang = localStorage.getItem("lang") || "gr";

// Update UI based on current language
updateLanguage(currentLang);

function updateLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);

  // Update menu items
  const links = document.querySelectorAll(".dropdown-menu a");
  links.forEach((link) => {
    const text = link.getAttribute(`data-lang-${lang}`);
    link.textContent = text;
  });

  // Change the logo visibility
  const logoGr = document.querySelector(".img-gr");
  const logoEn = document.querySelector(".img-en");
  if (logoGr || logoEn) {
    document.querySelector(".img-gr").style.display =
      lang === "en" ? "none" : "block";
    document.querySelector(".img-en").style.display =
      lang === "gr" ? "none" : "block";
  }

  // Change the text of the page
  const elements = document.querySelectorAll(`[data-lang-${lang}]`);
  elements.forEach((element) => {
    const text = element.getAttribute(`data-lang-${lang}`);
    element.textContent = text;
  });

  // Update the map on index page
  const mapIframe = document.getElementById("map");
  if (mapIframe) {
    if (lang === "en") {
      mapIframe.src =
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d846.3211227800933!2d19.891924678945347!3d39.591662366031784!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x135b5f5d96d06ff7%3A0xc938b808e170eaa0!2zzqDOn86lzpvOl86czpXOnc6fzqMgzpTOl86czpfOpM6hzpnOn86jIM6mz4nPhM65z4PPhM65zrrOrA!5e0!3m2!1sen!2sgr!4v1719167024386!5m2!1sen!2sgr";
      mapIframe.title =
        "Google map with directions to the Miltiadis Poulimenos workshop";
    } else {
      mapIframe.src =
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3074.5707856612084!2d19.890383915371!3d39.59182277946944!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x135b5f5d96d06ff7%3A0xc938b808e170eaa0!2zzqDOn86lzpvOl86czpXOnc6fzqMgzpTOl86czpfOpM6hzpnOn86jIM6mz4nPhM65z4PPhM65zrrOrA!5e0!3m2!1sel!2sgr!4v1639591032210!5m2!1sel!2sgr";
      mapIframe.title = "Χάρτης του Google";
    }
  }

  // Update products gallery
  const products = document.getElementsByClassName("polaroid");
  if (products.length > 0) {
    renderProducts(path, lang);
    // console.log(products);
  }

  // Translate aria-labels and image alt texts
  ["aria-label", "alt"].forEach((attr) => {
    document.querySelectorAll(`[data-lang-${lang}-${attr}]`).forEach((element) => {
      element.setAttribute(attr, element.getAttribute(`data-lang-${lang}-${attr}`));
    });
  });

  document.documentElement.lang = lang === "en" ? "en" : "el";

  // Update EL / EN buttons (new header)
  langButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
  });

  // Update flag visibility (old header)
  const flagGr = document.querySelector(".gr");
  const flagEn = document.querySelector(".en");
  if (flagGr && flagEn) {
    flagGr.style.display = lang === "en" ? "none" : "inline";
    flagEn.style.display = lang === "gr" ? "none" : "inline";
  }
}

// Handle navigation link click
document.querySelectorAll("nav a").forEach((link) => {
  link.addEventListener("click", () => {
    // Don't change language on menu items click
    if (link !== toggleButton) {
      updateLanguage(currentLang);
    }
  });
});

// Handle toggle button click (old header)
if (toggleButton) {
  toggleButton.addEventListener("click", function () {
    currentLang = currentLang === "gr" ? "en" : "gr";
    updateLanguage(currentLang);
  });
}

// Handle EL / EN buttons (new header)
langButtons.forEach((button) => {
  button.addEventListener("click", () => updateLanguage(button.dataset.lang));
});
