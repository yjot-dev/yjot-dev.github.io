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