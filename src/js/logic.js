let prevScrollPos = window.pageYOffset;

/**
 * Maneja el comportamiento de la barra de navegación superior (.topbar) 
 * en función del desplazamiento (scroll) y el ancho de la ventana.
 *
 * - En pantallas pequeñas (≤ 590px):
 *   - Si el usuario está en la parte superior de la página y se desplaza hacia arriba,
 *     la barra se muestra (top = "0").
 *   - En cualquier otro caso (desplazamiento hacia abajo o no en la parte superior),
 *     la barra se oculta (top = "-15rem").
 *
 * - En pantallas grandes (> 590px):
 *   - La barra permanece siempre visible (top = "0").
 *
 * Variables externas utilizadas:
 * @property prevScrollPos Variable global que guarda la posición previa del scroll
 *                         para determinar la dirección del desplazamiento.
 *
 * Efectos secundarios:
 * - Modifica dinámicamente el estilo CSS de la barra de navegación (.topbar).
 */
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

/**
 * Inicializa el comportamiento de un botón que controla un submenú
 * @param {string} buttonSelector - Selector del botón (ej: 'button[aria-controls="submenu-acerca"]')
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
    {pageLanguage: 'es', includedLanguages: 'es,en'},
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
      window.addEventListener("scroll", handleScroll);
    }
  }
}