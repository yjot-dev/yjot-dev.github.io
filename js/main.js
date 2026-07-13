// Variables globales
let prevScrollPos = window.pageYOffset;

function updateNavbar() {
  const navbar = document.querySelector(".topbar");
  if (!navbar) return;

  const banner = document.querySelector("iframe.skiptranslate");
  const currentScrollPos = window.pageYOffset;
  const baseFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 18;
  const offsetRem = banner && banner.offsetHeight > 0 ? banner.offsetHeight / baseFontSize : 0;

  if (window.innerWidth <= 590) {
    if (window.pageYOffset === 0) {
      navbar.style.top = `${offsetRem}rem`;
      navbar.style.display = "flex";
    } else {
      navbar.style.display = "none";
    }
  } else {
    navbar.style.top = `${offsetRem}rem`;
    navbar.style.display = "flex";
  }

  prevScrollPos = currentScrollPos;
}

function initSubmenuToggle() {
  const buttons = Array.from(document.querySelectorAll("button[aria-controls]"));
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    const submenuId = btn.getAttribute("aria-controls");
    const submenu = submenuId ? document.getElementById(submenuId) : null;

    if (!submenu) return;

    btn.setAttribute("aria-expanded", "false");
    submenu.hidden = true;

    btn.addEventListener("click", (event) => {
      event.stopPropagation();

      const expanded = btn.getAttribute("aria-expanded") === "true";

      buttons.forEach((otherBtn) => {
        const otherId = otherBtn.getAttribute("aria-controls");
        const otherSubmenu = otherId ? document.getElementById(otherId) : null;

        if (otherSubmenu) {
          otherBtn.setAttribute("aria-expanded", "false");
          otherSubmenu.hidden = true;
        }
      });

      btn.setAttribute("aria-expanded", String(!expanded));
      submenu.hidden = expanded;
    });
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest(".menu")) return;

    buttons.forEach((btn) => {
      const submenuId = btn.getAttribute("aria-controls");
      const submenu = submenuId ? document.getElementById(submenuId) : null;

      if (submenu) {
        btn.setAttribute("aria-expanded", "false");
        submenu.hidden = true;
      }
    });
  });
}

function googleTranslateElementInit() {
  if (window.google && window.google.translate && window.google.translate.TranslateElement) {
    new window.google.translate.TranslateElement(
      { pageLanguage: "es", includedLanguages: "es,en" },
      "traductor"
    );
  }
}

function doGTranslate(langPair) {
  const value = typeof langPair === "string" ? langPair : langPair.value;
  const lang = value.split("|")[1];
  const select = document.querySelector("select.goog-te-combo");

  if (!select || !select.options) return;

  for (let i = 0; i < select.options.length; i += 1) {
    if (select.options[i].value === lang) {
      select.selectedIndex = i;
      select.dispatchEvent(new Event("change"));
      break;
    }
  }
}

function calculateExperience(startYear, startMonth, startDay) {
  const startDate = new Date(startYear, startMonth - 1, startDay);
  const today = new Date();

  let years = today.getFullYear() - startDate.getFullYear();
  const hasAnniversaryPassed =
    today.getMonth() > startDate.getMonth() ||
    (today.getMonth() === startDate.getMonth() && today.getDate() >= startDate.getDate());

  if (!hasAnniversaryPassed) {
    years -= 1;
  }

  return years;
}

function updateExperienceYears() {
  const circle = document.getElementById("experience-circle");
  if (!circle) return;

  const yearsExperience = calculateExperience(2022, 6, 14);
  circle.textContent = `+${yearsExperience}`;
}

const observer = new MutationObserver(() => updateNavbar());
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["style", "class"]
});

document.addEventListener("DOMContentLoaded", () => {
  initSubmenuToggle();
  updateNavbar();
  updateExperienceYears();
});

window.addEventListener("scroll", updateNavbar, { passive: true });
window.addEventListener("resize", updateNavbar);