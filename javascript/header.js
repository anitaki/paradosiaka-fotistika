// Poulimenos Handmade — site header: mobile menu (used by every page)

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.getElementById("main-nav");

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  mainNav.classList.remove("is-open");
}

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    mainNav.classList.toggle("is-open", !open);
  });

  mainNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuToggle.focus();
    }
  });
}

// ---------- Back to top: appears after scrolling down, on every page ----------

const toTop = document.createElement("button");
toTop.type = "button";
toTop.className = "to-top-button";
toTop.innerHTML =
  '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 15 6-6 6 6"/></svg>';
document.body.appendChild(toTop);

function labelToTop() {
  toTop.setAttribute("aria-label", document.documentElement.lang === "en" ? "Back to top" : "Επιστροφή στην αρχή");
}

function toggleToTop() {
  toTop.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.8);
}

toTop.addEventListener("click", () => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  const brand = document.querySelector(".site-header .brand");
  if (brand) brand.focus({ preventScroll: true });
});

window.addEventListener("scroll", toggleToTop, { passive: true });
new MutationObserver(labelToTop).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
labelToTop();
toggleToTop();

// ---------- Language flag: the pressed button hides, so keep keyboard focus on the visible one ----------

document.querySelectorAll(".lang-switch button").forEach((button) => {
  button.addEventListener("click", () => {
    setTimeout(() => {
      const visible = document.querySelector('.lang-switch button[aria-pressed="false"]');
      const lost = document.activeElement === button || document.activeElement === document.body;
      if (visible && lost) visible.focus();
    }, 0);
  });
});

// ---------- Reveal on scroll: sections and cards rise gently into view (every page) ----------
// Content stays fully visible without JavaScript or with "reduce motion"; the classes are added only here.

const REVEAL_SELECTOR = [
  ".hero-copy > *", ".section-head", ".product-card", ".split > *",
  ".contact-intro", ".map-frame", ".contact-grid > *", ".legal-main > *", ".faq-intro", ".faq-list",
  ".about h1", ".about h2", ".about-product", ".polaroid", ".call-to-action",
].join(",");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealObserver =
  !reduceMotion && "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          // items that enter together (a row of cards, the hero text) appear one after another
          entries
            .filter((entry) => entry.isIntersecting)
            .forEach((entry, i) => {
              entry.target.style.transitionDelay = `${Math.min(i, 6) * 90}ms`;
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            });
        },
        { rootMargin: "0px 0px -6% 0px", threshold: 0.12 }
      )
    : null;

// Arriving at a specific spot (e.g. epikoinonia#quote-form): go there instantly, no fade or smooth scroll,
// so the visitor lands on the form straight away.
const arrivingAtAnchor = location.hash.length > 1 && !!document.getElementById(decodeURIComponent(location.hash.slice(1)));

if (arrivingAtAnchor) {
  const jump = () => {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) target.scrollIntoView({ behavior: "instant", block: "start" });
  };
  jump();
  document.addEventListener("DOMContentLoaded", jump);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(jump); // fonts can shift the layout
}

function setupReveal() {
  if (!revealObserver || arrivingAtAnchor) return;
  document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
    if (el.dataset.reveal) return;
    el.dataset.reveal = "1";
    el.classList.add("reveal");
    const done = (event) => {
      if (event.target !== el || event.propertyName !== "opacity") return;
      el.classList.remove("reveal", "is-visible");
      el.style.removeProperty("transition-delay");
      el.removeEventListener("transitionend", done);
    };
    el.addEventListener("transitionend", done);
    revealObserver.observe(el);
  });
}

setupReveal();
// product pages build their cards on DOMContentLoaded (products.js), so look again afterwards
document.addEventListener("DOMContentLoaded", setupReveal);

// ---------- Cookie consent: Google Analytics loads only after "Accept" (every page) ----------

const GA_ID = "G-D71TBDEB9L";
const CONSENT_KEY = "cookie-consent"; // "granted" | "denied"

function readConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch (e) {
    return null;
  }
}

function saveConsent(value) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch (e) {
    // storage blocked: the choice applies to this visit only
  }
}

function loadAnalytics() {
  if (window.__gaLoaded) return;
  window.__gaLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID);
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
}

function clearAnalyticsCookies() {
  const domains = ["", location.hostname, "." + location.hostname.replace(/^www\./, "")];
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (!name.startsWith("_ga")) return;
    domains.forEach((d) => {
      document.cookie = `${name}=; Max-Age=0; path=/${d ? "; domain=" + d : ""}`;
    });
  });
}

// The banner is built now (before lang.js / site.js run) so it is translated together with the page.
const cookieBanner = document.createElement("div");
cookieBanner.className = "cookie-banner";
cookieBanner.setAttribute("role", "region");
cookieBanner.setAttribute("aria-label", "Ειδοποίηση cookies");
cookieBanner.setAttribute("data-lang-gr-aria-label", "Ειδοποίηση cookies");
cookieBanner.setAttribute("data-lang-en-aria-label", "Cookie notice");
cookieBanner.hidden = true;
cookieBanner.innerHTML = `
  <p class="cookie-title" data-lang-gr="Χρησιμοποιούμε cookies" data-lang-en="We use cookies">Χρησιμοποιούμε cookies</p>
  <p class="cookie-text">
    <span data-lang-gr="Με τη συγκατάθεσή σας χρησιμοποιούμε cookies στατιστικών (Google Analytics) για να βελτιώνουμε την ιστοσελίδα."
      data-lang-en="With your consent we use statistics cookies (Google Analytics) to improve the website.">Με τη συγκατάθεσή σας χρησιμοποιούμε cookies στατιστικών (Google Analytics) για να βελτιώνουμε την ιστοσελίδα.</span>
    <a href="politiki-cookies" data-lang-gr="Πολιτική Cookies" data-lang-en="Cookie Policy">Πολιτική Cookies</a>
  </p>
  <div class="cookie-actions">
    <button type="button" class="cookie-btn cookie-reject" data-lang-gr="Απόρριψη" data-lang-en="Reject">Απόρριψη</button>
    <button type="button" class="cookie-btn cookie-accept" data-lang-gr="Αποδοχή" data-lang-en="Accept">Αποδοχή</button>
  </div>`;
document.body.appendChild(cookieBanner);

// while the notice is open, the page gets extra space at the bottom so it never covers content for good
const bannerSpace = () => {
  document.documentElement.style.setProperty("--cookie-space", cookieBanner.hidden ? "0px" : `${cookieBanner.offsetHeight + 24}px`);
};
if ("ResizeObserver" in window) new ResizeObserver(bannerSpace).observe(cookieBanner);

function showCookieBanner() {
  cookieBanner.hidden = false;
  document.body.classList.add("has-cookie-banner");
  bannerSpace();
}

function hideCookieBanner() {
  cookieBanner.hidden = true;
  document.body.classList.remove("has-cookie-banner");
  bannerSpace();
}

cookieBanner.querySelector(".cookie-accept").addEventListener("click", () => {
  saveConsent("granted");
  hideCookieBanner();
  loadAnalytics();
});

cookieBanner.querySelector(".cookie-reject").addEventListener("click", () => {
  const wasGranted = readConsent() === "granted";
  saveConsent("denied");
  hideCookieBanner();
  clearAnalyticsCookies();
  if (wasGranted && window.__gaLoaded) window.location.reload(); // stop the already-running script
});

document.querySelectorAll(".cookie-settings").forEach((button) => {
  button.addEventListener("click", () => {
    showCookieBanner();
    cookieBanner.querySelector(".cookie-accept").focus();
  });
});

const storedConsent = readConsent();
if (storedConsent === "granted") loadAnalytics();
else if (storedConsent !== "denied") showCookieBanner();
