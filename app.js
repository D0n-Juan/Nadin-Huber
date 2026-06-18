const COLOR_SCHEMES = {
  A: { pageBg: "#f7fff7", sectionBg: "#CEFFF8", surface: "#FFFFFF", surfaceAlt: "#E9FFFC", text: "#03030B", textSoft: "#3F4A4A", dark: "#020315", accent: "#CEFFF8", accentStrong: "#03030B", border: "rgba(3,3,11,.14)" },
  B: { pageBg: "#F7F7FF", sectionBg: "#E8E8FF", surface: "#FFFFFF", surfaceAlt: "#F0F0FF", text: "#07031A", textSoft: "#46405F", dark: "#07031A", accent: "#9AFF4C", accentStrong: "#7D7DFF", border: "rgba(7,3,26,.14)" },
  C: { pageBg: "#FFF6EC", sectionBg: "#dec6ac", surface: "#FFFFFF", surfaceAlt: "#FFE8D1", text: "#24140C", textSoft: "#6D5142", dark: "#1A0D07", accent: "#E8894A", accentStrong: "#A6532F", border: "rgba(36,20,12,.14)" }
};

const ACTIVE_COLOR_SCHEME = "C";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function applyColorScheme() {
  const scheme = COLOR_SCHEMES[ACTIVE_COLOR_SCHEME] || COLOR_SCHEMES.atelierWarm;
  Object.entries(scheme).forEach(([name, value]) => {
    const cssName = name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    document.documentElement.style.setProperty(`--${cssName}`, value);
  });
}

function initHeader() {
  const header = document.querySelector("[data-header]");
  const button = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");
  if (!header || !button || !menu) return;

  const closeMenu = () => {
    button.setAttribute("aria-expanded", "false");
    menu.hidden = true;
    document.body.classList.remove("menu-open");
  };

  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!open));
    menu.hidden = open;
    document.body.classList.toggle("menu-open", !open);
  });

  menu.addEventListener("click", (event) => {
    if (event.target.matches("a")) closeMenu();
  });

  const update = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
  window.addEventListener("scroll", update, { passive: true });
  update();
}

function initSmoothScroll() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: reduceMotion.matches ? "auto" : "smooth",
      block: "start"
    });
  });
}

function initHorizontalScroll() {
  const section = document.querySelector("[data-horizontal-section]");
  const viewport = document.querySelector("[data-horizontal-viewport]");
  const track = document.querySelector("[data-horizontal-track]");
  const progress = document.querySelector("[data-horizontal-progress]");
  if (!section || !viewport || !track || reduceMotion.matches) return;

  const desktop = window.matchMedia("(min-width: 1024px)");
  let start = 0;
  let end = 1;
  let distance = 0;
  let ticking = false;

  function measure() {
    if (!desktop.matches) {
      section.style.removeProperty("--horizontal-scroll-height");
      track.style.transform = "";
      if (progress) progress.style.transform = "scaleX(0)";
      return;
    }

    const viewportWidth = window.innerWidth;
    distance = Math.max(0, track.scrollWidth - viewportWidth);

    const stickyHeight = window.innerHeight - 76;
    const sectionHeight = Math.max(window.innerHeight * 2.2, distance + stickyHeight + 180);
    section.style.setProperty("--horizontal-scroll-height", `${Math.ceil(sectionHeight)}px`);

    const rect = section.getBoundingClientRect();
    start = window.scrollY + rect.top;
    end = start + sectionHeight - window.innerHeight;
  }

  function render() {
    ticking = false;
    if (!desktop.matches) return;

    const progressValue = Math.min(1, Math.max(0, (window.scrollY - start) / Math.max(1, end - start)));
    track.style.transform = `translate3d(${-distance * progressValue}px, 0, 0)`;
    if (progress) progress.style.transform = `scaleX(${progressValue})`;
  }

  function requestRender() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(render);
  }

  window.refreshHorizontalScroll = () => {
    measure();
    requestRender();
  };

  window.addEventListener("resize", () => {
    measure();
    requestRender();
  });
  window.addEventListener("scroll", requestRender, { passive: true });
  window.addEventListener("load", () => {
    measure();
    requestRender();
  });
  desktop.addEventListener("change", () => {
    measure();
    requestRender();
  });

  measure();
  requestRender();
}

function initExpandableCards() {
  const track = document.querySelector("[data-card-accordion]");
  if (!track) return;

  const cards = [...track.querySelectorAll(".question-card")];
  const refresh = () => {
    if (typeof window.refreshHorizontalScroll === "function") {
      window.refreshHorizontalScroll();
    }
  };

  cards.forEach((card) => {
    const button = card.querySelector("button");
    const answer = card.querySelector(".card-answer");
    if (!button || !answer) return;

    const toggleCard = () => {
      const willOpen = button.getAttribute("aria-expanded") !== "true";

      cards.forEach((otherCard) => {
        const otherButton = otherCard.querySelector("button");
        const otherAnswer = otherCard.querySelector(".card-answer");
        otherCard.classList.remove("is-expanded");
        if (otherButton) otherButton.setAttribute("aria-expanded", "false");
        if (otherAnswer) otherAnswer.hidden = true;
      });

      card.classList.toggle("is-expanded", willOpen);
      button.setAttribute("aria-expanded", String(willOpen));
      answer.hidden = !willOpen;

      window.requestAnimationFrame(() => {
        refresh();
        if (willOpen && !window.matchMedia("(min-width: 1024px)").matches) {
          card.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", inline: "center", block: "nearest" });
        }
      });
    };

    card.addEventListener("click", toggleCard);
  });
}

function initYear() {
  document.querySelectorAll("[data-year]").forEach((item) => {
    item.textContent = new Date().getFullYear();
  });
}

applyColorScheme();
initHeader();
initSmoothScroll();
initHorizontalScroll();
initExpandableCards();
initYear();
