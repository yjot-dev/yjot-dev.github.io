let prevScrollPos = window.pageYOffset;

function handleScroll() {
  const navbar = document.querySelector(".topbar");
  let currentScrollPos = window.pageYOffset;

  if (window.innerWidth <= 590) {
    if (prevScrollPos > currentScrollPos && window.pageYOffset === 0) {
      // Inicio → mostrar topbar
      navbar.style.top = "0";
    } else {
      // Subiendo o bajando → ocultar topbar
      navbar.style.top = "-15rem";
    }
  } else {
    // En pantallas grandes, siempre visible
    navbar.style.top = "0";
  }

  prevScrollPos = currentScrollPos;
}

window.addEventListener("scroll", handleScroll);

function googleTranslateElementInit() {
    new google.translate.TranslateElement(
    {pageLanguage: 'es', includedLanguages: 'es,en'},
    'traductor'
    );
}

function doGTranslate(lang_pair) {
    if (lang_pair.value) lang_pair = lang_pair.value;
    var lang = lang_pair.split('|')[1];
    var select = document.querySelector("select.goog-te-combo");
    if (select && select.options) {
    for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].value == lang) {
        select.selectedIndex = i;
        select.dispatchEvent(new Event('change'));
        break;
        }
    }
    }
}