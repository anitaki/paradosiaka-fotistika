// Poulimenos Handmade — behaviour for the redesigned pages (index + legal pages)

// ---------- Language (shares the "lang" key with lang.js on the product pages) ----------

const MAP_SRC = {
  gr: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3074.5707856612084!2d19.890383915371!3d39.59182277946944!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x135b5f5d96d06ff7%3A0xc938b808e170eaa0!2zzqDOn86lzpvOl86czpXOnc6fzqMgzpTOl86czpfOpM6hzpnOn86jIM6mz4nPhM65z4PPhM65zrrOrA!5e0!3m2!1sel!2sgr!4v1639591032210!5m2!1sel!2sgr",
  en: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d846.3211227800933!2d19.891924678945347!3d39.591662366031784!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x135b5f5d96d06ff7%3A0xc938b808e170eaa0!2zzqDOn86lzpvOl86czpXOnc6fzqMgzpTOl86czpfOpM6hzpnOn86jIM6mz4nPhM65z4PPhM65zrrOrA!5e0!3m2!1sen!2sgr!4v1719167024386!5m2!1sen!2sgr",
};

// Attributes that can be translated with data-lang-<lang>-<attr>
const TRANSLATED_ATTRS = ["aria-label", "alt", "placeholder", "title", "content", "href"];

function readStoredLang() {
  try {
    return localStorage.getItem("lang") === "en" ? "en" : "gr";
  } catch (e) {
    return "gr";
  }
}

function setLanguage(lang) {
  try {
    localStorage.setItem("lang", lang);
  } catch (e) {
    // storage unavailable (private mode) — language still switches for this visit
  }

  document.documentElement.lang = lang === "en" ? "en" : "el";

  document.querySelectorAll(`[data-lang-${lang}]`).forEach((el) => {
    el.textContent = el.getAttribute(`data-lang-${lang}`);
  });

  TRANSLATED_ATTRS.forEach((attr) => {
    document.querySelectorAll(`[data-lang-${lang}-${attr}]`).forEach((el) => {
      el.setAttribute(attr, el.getAttribute(`data-lang-${lang}-${attr}`));
    });
  });

  document.querySelectorAll(".lang-switch button").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
  });

  const map = document.getElementById("map");
  if (map && map.getAttribute("src") !== MAP_SRC[lang]) {
    map.setAttribute("src", MAP_SRC[lang]);
  }
}

document.querySelectorAll(".lang-switch button").forEach((btn) => {
  btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
});

setLanguage(readStoredLang());

// ---------- Quote form: sent by email through FormSubmit (no server needed) ----------

const FORM_ENDPOINT = "https://formsubmit.co/ajax/poulimenos.lights@gmail.com";
const quoteForm = document.getElementById("quote-form");

const FORM_TEXT = {
  sending: { gr: "Αποστολή…", en: "Sending…" },
  sent: {
    gr: "Ευχαριστούμε! Λάβαμε το αίτημά σας και θα επικοινωνήσουμε σύντομα μαζί σας.",
    en: "Thank you! We received your request and will get back to you soon.",
  },
  failed: {
    gr: "Η αποστολή δεν ολοκληρώθηκε. Δοκιμάστε ξανά ή καλέστε μας στο 2661 027811.",
    en: "Your request could not be sent. Please try again or call us on +30 2661 027811.",
  },
};

// Arriving from a product page (epikoinonia?product=kolones#quote-form): preselect that product
const PRODUCT_OPTION = { fanaria: 0, kolones: 1, fotistika: 2, krani: 3 };

if (quoteForm) {
  const productParam = new URLSearchParams(window.location.search).get("product");
  if (productParam in PRODUCT_OPTION) {
    quoteForm.elements.product.selectedIndex = PRODUCT_OPTION[productParam];
  }
}

// Phone check: digits, spaces, dashes, brackets and a leading +; 10–15 digits (Greek or international)
const PHONE_MESSAGE = {
  gr: "Συμπληρώστε έναν έγκυρο αριθμό τηλεφώνου (π.χ. 697 123 4567).",
  en: "Please enter a valid phone number (e.g. +30 697 123 4567).",
};

function checkPhone(input) {
  const value = input.value.trim();
  const digits = value.replace(/\D/g, "").length;
  const valid = value === "" || (/^\+?[0-9 ()\-]+$/.test(value) && digits >= 10 && digits <= 15);
  input.setCustomValidity(valid ? "" : PHONE_MESSAGE[readStoredLang()]);
}

if (quoteForm) {
  const phoneInput = quoteForm.elements.namedItem("phone");
  phoneInput.addEventListener("input", () => checkPhone(phoneInput));
  phoneInput.addEventListener("blur", () => checkPhone(phoneInput));
  // re-check right before the browser validates the form (also covers autofilled numbers)
  quoteForm.querySelector("button[type=submit]").addEventListener("click", () => checkPhone(phoneInput));
}

if (quoteForm) {
  const status = document.getElementById("form-status");
  const submitButton = quoteForm.querySelector("button[type=submit]");

  quoteForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    checkPhone(quoteForm.elements.namedItem("phone"));
    if (!quoteForm.reportValidity()) return;

    const lang = readStoredLang();
    const data = Object.fromEntries(new FormData(quoteForm)); // _honey is checked by FormSubmit itself

    const label = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = FORM_TEXT.sending[lang];
    status.textContent = "";

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || String(result.success) !== "true") throw new Error(result.message || `HTTP ${response.status}`);
      quoteForm.reset();
      status.textContent = FORM_TEXT.sent[lang];
    } catch (error) {
      status.textContent = FORM_TEXT.failed[lang];
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = label;
    }
  });
}

// ---------- Homepage figures (75+ / Πανελλαδικά / UNESCO): on phones one at a time, sliding by itself ----------

const statsList = document.querySelector(".stats");

if (statsList) {
  const items = [...statsList.children];
  const phone = window.matchMedia("(max-width: 600px)");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const DELAY = 3500; // ms each figure stays
  const RESUME = 7000; // ms after the visitor touches it
  let index = 0;
  let timer = null;
  let resumeTimer = null;
  let inView = false;

  // dots under the slider (shown on phones only, by CSS)
  const dots = document.createElement("div");
  dots.className = "stats-dots";
  dots.setAttribute("role", "group");
  dots.setAttribute("aria-label", "Επιλογή στοιχείου");
  dots.setAttribute("data-lang-gr-aria-label", "Επιλογή στοιχείου");
  dots.setAttribute("data-lang-en-aria-label", "Choose item");
  items.forEach((item, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `${i + 1} / ${items.length}`);
    dot.addEventListener("click", () => {
      pauseForUser();
      goTo(i);
    });
    dots.append(dot);
  });
  statsList.after(dots);

  const markDot = () =>
    [...dots.children].forEach((dot, i) => dot.setAttribute("aria-current", String(i === index)));

  function goTo(i) {
    index = (i + items.length) % items.length;
    statsList.scrollTo({ left: items[index].offsetLeft - items[0].offsetLeft, behavior: reduce.matches ? "auto" : "smooth" });
    markDot();
  }

  function stop() {
    clearInterval(timer);
    timer = null;
  }

  function start() {
    stop();
    if (phone.matches && !reduce.matches && inView && !resumeTimer) {
      timer = setInterval(() => goTo(index + 1), DELAY);
    }
  }

  function pauseForUser() {
    stop();
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      resumeTimer = null;
      start();
    }, RESUME);
  }

  // keep the dots in step when the visitor swipes by hand
  let scrollEnd = null;
  statsList.addEventListener("scroll", () => {
    clearTimeout(scrollEnd);
    scrollEnd = setTimeout(() => {
      const width = items[0].getBoundingClientRect().width || 1;
      index = Math.round(statsList.scrollLeft / width);
      markDot();
    }, 120);
  }, { passive: true });

  ["pointerdown", "touchstart", "wheel", "focusin"].forEach((type) =>
    statsList.addEventListener(type, pauseForUser, { passive: true })
  );

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      inView ? start() : stop();
    }, { threshold: 0.6 }).observe(statsList);
  }

  phone.addEventListener("change", () => {
    statsList.scrollTo({ left: 0 });
    index = 0;
    markDot();
    start();
  });

  markDot();
}
