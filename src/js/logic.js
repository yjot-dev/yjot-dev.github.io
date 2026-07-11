// Variable global para almacenar la posición previa del scroll
let prevScrollPos = window.pageYOffset;

/**
 * Actualiza dinámicamente la posición y visibilidad de la barra superior (.topbar)
 * en función del scroll, el tamaño de la pantalla y la presencia del banner
 * de Google Translate (iframe.skiptranslate).
 *
 * - En pantallas grandes (>590px): la barra siempre es visible y se ajusta
 *   hacia abajo según la altura del banner si está presente.
 * - En pantallas chicas (≤590px): la barra solo se muestra cuando el scroll
 *   está en la parte superior (pageYOffset === 0). Al desplazarse hacia abajo,
 *   se oculta para ahorrar espacio en pantalla.
 *
 * El cálculo de desplazamiento se hace en unidades `rem`, dividiendo la altura
 * del banner en píxeles por el font-size base del documento.
 *
 * Variables externas utilizadas:
 * - `prevScrollPos`: mantiene la posición previa del scroll para referencia.
 *
 * Efectos secundarios:
 * - Modifica dinámicamente las propiedades CSS `top` y `display` de `.topbar`.
 */
function updateNavbar() {
  const navbar = document.querySelector(".topbar");
  const banner = document.querySelector("iframe.skiptranslate");
  const currentScrollPos = window.pageYOffset;

  // Altura extra si el banner del traductor está visible
  const baseFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const offsetRem = banner && banner.offsetHeight > 0
    ? banner.offsetHeight / baseFontSize
    : 0;

  if (window.innerWidth <= 590) {
    // Pantallas chicas
    if (window.pageYOffset === 0) {
      // Solo visible arriba con altura dinamica si el banner está presente
      navbar.style.top = offsetRem + "rem";
      navbar.style.display = "flex";
    } else {
      // Oculta durante scroll
      navbar.style.display = "none";
    }
  } else {
    // Pantallas grandes
    // Siempre visible con altura dinamica si el banner está presente
    navbar.style.top = offsetRem + "rem";
    navbar.style.display = "flex";
  }

  // Ajusta la portada segun el NavBar y Banner
  prevScrollPos = currentScrollPos;
}

// Observador global: recalcula cuando aparece/cambia el banner
const observer = new MutationObserver(() => updateNavbar());
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["style", "class"]
});

// Ajuste inicial al cargar
window.addEventListener("DOMContentLoaded", updateNavbar);

/**
 * Inicializa la lógica de apertura y cierre de submenús accesibles mediante
 * botones con atributo `aria-controls`. Cada botón controla un submenú
 * identificado por su ID.
 *
 * Comportamiento:
 * - Estado inicial: todos los submenús se ocultan (`hidden = true`) y los
 *   botones se marcan con `aria-expanded="false"`.
 * - Al hacer clic en un botón:
 *   1. Se evita la propagación del evento (`stopPropagation`).
 *   2. Se cierran todos los submenús activos y se actualizan sus botones
 *      (`aria-expanded="false"`).
 *   3. Se alterna únicamente el submenú asociado al botón clicado:
 *      - Si estaba cerrado, se abre (`hidden = false`, `aria-expanded="true"`).
 *      - Si estaba abierto, se cierra.
 *
 * Accesibilidad:
 * - Usa atributos ARIA (`aria-controls`, `aria-expanded`) para mejorar la
 *   compatibilidad con lectores de pantalla.
 * - Los submenús se ocultan/mostrar mediante la propiedad `hidden`.
 *
 * Efectos secundarios:
 * - Modifica dinámicamente atributos ARIA y la propiedad `hidden` de los
 *   elementos de submenú.
 * - Añade listeners de clic a cada botón encontrado en el DOM.
 *
 * No recibe parámetros explícitos; actúa sobre todos los botones con
 * `aria-controls` presentes en el documento.
 */
function initSubmenuToggle() {
  const buttons = document.querySelectorAll("button[aria-controls]");

  buttons.forEach(btn => {
    const submenuId = btn.getAttribute("aria-controls");
    const submenu = document.getElementById(submenuId);

    if (!submenu) return;

    // Estado inicial
    btn.setAttribute("aria-expanded", "false");
    submenu.hidden = true;

    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // evita que el clic burbujee al document

      const expanded = btn.getAttribute("aria-expanded") === "true";

      // Cerrar todos los submenús antes de abrir el actual
      buttons.forEach(otherBtn => {
        const otherId = otherBtn.getAttribute("aria-controls");
        const otherSubmenu = document.getElementById(otherId);
        if (otherSubmenu) {
          otherBtn.setAttribute("aria-expanded", "false");
          otherSubmenu.hidden = true;
        }
      });

      // Alternar solo el actual
      btn.setAttribute("aria-expanded", String(!expanded));
      submenu.hidden = expanded;
    });
  });

  // Cerrar todos los submenús al hacer clic fuera del menú
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".menu")) {
      buttons.forEach(btn => {
        const submenuId = btn.getAttribute("aria-controls");
        const submenu = document.getElementById(submenuId);
        if (submenu) {
          btn.setAttribute("aria-expanded", "false");
          submenu.hidden = true;
        }
      });
    }
  });
}

/**
 * Inicializa el widget de Google Translate en la página.
 *
 * Esta función crea una nueva instancia de `google.translate.TranslateElement`
 * que permite traducir dinámicamente el contenido de la página.
 *
 * Configuración aplicada:
 * - `pageLanguage: 'es'` → Define el idioma original de la página (español).
 * - `includedLanguages: 'es,en'` → Limita los idiomas disponibles en el selector
 *   de traducción a español e inglés.
 *
 * El widget se renderiza dentro del elemento HTML con id `"traductor"`.
 *
 * Uso:
 * - Se invoca automáticamente cuando la librería de Google Translate
 *   carga el callback `googleTranslateElementInit`.
 * - No recibe parámetros ni devuelve valores.
 *
 * Efectos secundarios:
 * - Inserta en el DOM el selector de traducción de Google dentro del contenedor
 *   especificado.
 */
function googleTranslateElementInit() {
  new google.translate.TranslateElement(
    { pageLanguage: 'es', includedLanguages: 'es,en' },
    'traductor'
  );
}

/**
 * Cambia el idioma de la página utilizando el widget de Google Translate.
 *
 * Esta función selecciona el idioma indicado en el menú desplegable interno
 * de Google Translate (`select.goog-te-combo`) y dispara el evento `change`
 * para que se aplique la traducción.
 *
 * @param {string|HTMLSelectElement} lang_pair - Puede ser:
 *   - Una cadena con el formato `"origen|destino"` (ej: `"es|en"`).
 *   - Un elemento `<select>` cuyo valor siga el mismo formato.
 *
 * Proceso:
 * - Si se recibe un elemento con propiedad `.value`, se toma ese valor.
 * - Se extrae el idioma de destino (parte después del `|`).
 * - Se busca el `<select>` de Google Translate en el DOM.
 * - Si existe, se selecciona la opción correspondiente al idioma de destino
 *   y se dispara el evento `change` para activar la traducción.
 *
 * Efectos secundarios:
 * - Modifica el valor seleccionado en el `<select class="goog-te-combo">`.
 * - Dispara un evento `change` que provoca la traducción automática de la página.
 */
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

/**
 * Carga dinámicamente un fragmento HTML externo en un contenedor identificado por su `id`.
 * 
 * Este método utiliza `fetch` para obtener el contenido de un archivo HTML y lo inserta
 * dentro del elemento especificado. Además, si el fragmento corresponde a un header:
 * 
 * - Permite configurar dinámicamente la imagen de portada (`coverImage`).
 * - Reinicializa el comportamiento de los submenús (`initSubmenuToggle`).
 * - Activa el manejo de scroll para mostrar/ocultar la barra de navegación (`handleScroll`).
 *
 * @async
 * @function loadInclude
 * @param {string} id - El `id` del contenedor en el DOM donde se insertará el fragmento.
 *                      Ejemplo: `"header"` o `"footer"`.
 * @param {string} file - Ruta relativa al archivo HTML que se desea incluir.
 *                        Ejemplo: `"src/includes/header.html"`.
 * @param {Object} [options={}] - Opciones adicionales para personalizar la inclusión.
 * @param {string} [options.coverImage] - Ruta de la imagen de portada que se aplicará
 *                                        si el fragmento corresponde a un header.
 *
 * @returns {Promise<void>} No devuelve un valor, pero modifica el DOM insertando el contenido
 *                          y configurando el comportamiento del header si corresponde.
 *
 * @example
 * // Cargar el header con una portada personalizada
 * loadInclude("header", "src/includes/header.html", { coverImage: "src/assets/icons/cover.png" });
 *
 * @example
 * // Cargar el footer sin opciones adicionales
 * loadInclude("footer", "src/includes/footer.html");
 */
async function loadInclude(id, file, options = {}) {
  const element = document.getElementById(id);
  if (element) {
    const response = await fetch(file);
    const html = await response.text();
    element.innerHTML = html;

    // Usar imagen indicada si se cargó un header y se proporcionó una opción de coverImage
    if (id === "header" && options.coverImage) {
      const coverImg = element.querySelector("#cover-image");
      if (coverImg) {
        coverImg.src = options.coverImage;
      }
    }
    // Reinicializar submenús y scroll si se cargó un header
    if (id === "header") {
      initSubmenuToggle()
      window.addEventListener("scroll", updateNavbar);
    }
  }
}

/**
 * Calcula los años de experiencia transcurridos desde una fecha inicial.
 *
 * La función toma un año, mes y día de inicio y determina cuántos años
 * han pasado hasta la fecha actual. Si el aniversario del año en curso
 * aún no ha llegado, resta un año al cálculo.
 *
 * @param {number} startYear - Año de inicio (ej. 2022).
 * @param {number} startMonth - Mes de inicio (1-12, enero = 1).
 * @param {number} startDay - Día de inicio (1-31).
 * @returns {number} Número de años de experiencia acumulados.
 *
 * @example
 * // Si hoy es 10 de junio de 2026 y el inicio fue 14 de junio de 2022:
 * calculateExperience(2022, 6, 14); // Devuelve 3
 *
 * @example
 * // Si hoy es 20 de junio de 2026 y el inicio fue 14 de junio de 2022:
 * calculateExperience(2022, 6, 14); // Devuelve 4
 */
function calculateExperience(startYear, startMonth, startDay) {
  const startDate = new Date(startYear, startMonth - 1, startDay); // mes base 0
  const today = new Date();

  let years = today.getFullYear() - startDate.getFullYear();

  // Si aún no ha llegado el aniversario este año, restamos 1
  const hasAnniversaryPassed =
    today.getMonth() > startDate.getMonth() ||
    (today.getMonth() === startDate.getMonth() && today.getDate() >= startDate.getDate());

  if (!hasAnniversaryPassed) {
    years--;
  }

  return years;
}

// Espera a que el DOM esté completamente cargado para calcular y mostrar los años de experiencia
document.addEventListener("DOMContentLoaded", () => {
  // Calcula años de experiencia desde el 14 de junio de 2022
  const yearsExperience = calculateExperience(2022, 6, 14);

  // Actualiza el contenido del div con el número dinámico y el "+"
  const circle = document.getElementById("experience-circle");
  if (circle) {
    circle.textContent = "+" + yearsExperience;
  }
});