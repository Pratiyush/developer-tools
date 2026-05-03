/**
 * Authored translations for the 15 supported locales. Source of truth
 * before they're pushed to Tolgee. After a Tolgee-side edit, the synced
 * JSON wins at runtime (see src/locales/index.ts).
 *
 * Rule: every key in `Translations` must have a value in every locale.
 * Adding a key to `src/locales/types.ts` requires adding it here for all
 * 15 locales — feedback_translation_completeness memory enforces this.
 *
 * Style: error.* messages are lightly funny but informative
 * (see feedback_funny_errors).
 */

import type { Translations } from '../src/locales/types';
import en from '../src/locales/en';

const es: Translations = {
  'site.brand': 'Herramientas de Desarrollo',
  'site.tagline': 'Un banco de trabajo de pequeñas utilidades para desarrolladores. Solo local.',
  'site.copyright': 'Copyright © 2026 Pratiyush Kumar. Licenciado bajo AGPL-3.0.',
  'site.author': 'Hecho por Pratiyush.',
  'nav.home': 'Inicio',
  'home.hero.title': '100 herramientas para devs, en tu navegador.',
  'home.hero.subtitle':
    'Un banco de trabajo de pequeñas utilidades para desarrolladores. Solo local — nada sale de tu navegador. Cada herramienta tiene un enlace profundo a una URL compartible.',
  'home.empty':
    'Aún no hay herramientas. La primera se publicará pronto. Ejecuta `pnpm new-tool <slug> --category <NN>` para añadir la primera.',
  'sidebar.search.placeholder': 'Buscar herramientas…',
  'sidebar.search.aria': 'Buscar herramientas',
  'sidebar.empty': 'Aún no hay herramientas',
  'sidebar.empty.search': 'Sin resultados',
  'sidebar.foot.line1': 'Solo local · todo el procesamiento ocurre en tu navegador.',
  'sidebar.foot.line2': 'Hecho por Pratiyush.',
  'topbar.theme.aria': 'Tema',
  'topbar.github.aria': 'Repositorio de GitHub',
  'tool.placeholder.title': 'Herramienta aún no implementada',
  'tool.placeholder.body': 'Lógica de la herramienta disponible; capa de renderizado pendiente.',
  'footer.privacy': 'Privacidad',
  'footer.disclaimer': 'Aviso legal',
  'footer.license': 'Licencia',
  'footer.security': 'Seguridad',
  'footer.repo': 'GitHub',
  'error.404.title': 'Perdido en el taller',
  'error.404.body':
    'No hay ninguna herramienta llamada "{id}". Quizás fue renombrada, retirada, o el enlace se torció en el camino. La página de inicio sabe el camino de vuelta.',
  'error.unknown':
    'Algo se rompió. La causa no está del todo clara, ni siquiera para nosotros. Recargar suele ayudar.',
  'error.copy.failed':
    'El portapapeles dijo no. Probablemente sea cuestión de permisos — revisa la configuración de tu navegador y prueba otra vez.',
  'error.parse.failed':
    'Eso no parece del todo correcto. Comprueba si hay caracteres sueltos o formato erróneo y vuelve a intentarlo.',
  'error.back.home': '← Volver al inicio',
  'tools.base64.mode.aria': 'Codificar o decodificar',
  'tools.base64.mode.encode': 'Codificar',
  'tools.base64.mode.decode': 'Decodificar',
  'tools.base64.urlsafe.label': 'Variante URL-safe (-_, sin relleno)',
  'tools.base64.urlsafe.aria': 'Usar alfabeto base64 URL-safe',
  'tools.base64.input.label': 'Entrada',
  'tools.base64.input.aria': 'Entrada del conversor base64',
  'tools.base64.input.placeholder':
    'Escribe o pega — UTF-8, emoji, segmentos JWT. Todo se reconvierte sin pérdida.',
  'tools.base64.output.label': 'Salida',
  'tools.base64.output.aria': 'Salida del conversor base64',
  'tools.base64.swap': 'Intercambiar ⇄',
  'tools.base64.copy': 'Copiar',
  'tools.base64.lengths': '{in} caracteres entrada · {out} caracteres salida',
};

const fr: Translations = {
  'site.brand': 'Outils pour Développeurs',
  'site.tagline': 'Un atelier de petits utilitaires pour développeurs. Uniquement local.',
  'site.copyright': 'Copyright © 2026 Pratiyush Kumar. Sous licence AGPL-3.0.',
  'site.author': 'Réalisé par Pratiyush.',
  'nav.home': 'Accueil',
  'home.hero.title': '100 outils pour devs, dans votre navigateur.',
  'home.hero.subtitle':
    'Un atelier de petits utilitaires pour développeurs. Uniquement local — rien ne quitte votre navigateur. Chaque outil possède un lien profond vers une URL partageable.',
  'home.empty':
    'Aucun outil pour le moment. Le premier arrive bientôt. Exécutez `pnpm new-tool <slug> --category <NN>` pour ajouter le premier.',
  'sidebar.search.placeholder': 'Rechercher des outils…',
  'sidebar.search.aria': 'Rechercher des outils',
  'sidebar.empty': 'Aucun outil pour le moment',
  'sidebar.empty.search': 'Aucun résultat',
  'sidebar.foot.line1': 'Uniquement local · tout le traitement se fait dans votre navigateur.',
  'sidebar.foot.line2': 'Réalisé par Pratiyush.',
  'topbar.theme.aria': 'Thème',
  'topbar.github.aria': 'Dépôt GitHub',
  'tool.placeholder.title': 'Outil non encore implémenté',
  'tool.placeholder.body': 'Logique de l’outil disponible ; couche de rendu en attente.',
  'footer.privacy': 'Confidentialité',
  'footer.disclaimer': 'Avertissement',
  'footer.license': 'Licence',
  'footer.security': 'Sécurité',
  'footer.repo': 'GitHub',
  'error.404.title': 'Perdu dans l’atelier',
  'error.404.body':
    'Aucun outil nommé "{id}". Il a peut-être été renommé, retiré, ou le lien a fait un détour. La page d’accueil connaît le chemin du retour.',
  'error.unknown':
    'Quelque chose a cassé. La cause n’est pas tout à fait claire, même pour nous. Recharger aide souvent.',
  'error.copy.failed':
    'Le presse-papiers a refusé. Sans doute une histoire de permissions — vérifiez votre navigateur et réessayez.',
  'error.parse.failed':
    'Ça n’a pas l’air tout à fait juste. Vérifiez les caractères en trop ou le mauvais format et réessayez.',
  'error.back.home': '← Retour à l’accueil',
  'tools.base64.mode.aria': 'Encoder ou décoder',
  'tools.base64.mode.encode': 'Encoder',
  'tools.base64.mode.decode': 'Décoder',
  'tools.base64.urlsafe.label': 'Variante URL-safe (-_, sans padding)',
  'tools.base64.urlsafe.aria': 'Utiliser l’alphabet base64 URL-safe',
  'tools.base64.input.label': 'Entrée',
  'tools.base64.input.aria': 'Entrée du convertisseur base64',
  'tools.base64.input.placeholder':
    'Tapez ou collez — UTF-8, emoji, segments JWT. Tout fait l’aller-retour proprement.',
  'tools.base64.output.label': 'Sortie',
  'tools.base64.output.aria': 'Sortie du convertisseur base64',
  'tools.base64.swap': 'Échanger ⇄',
  'tools.base64.copy': 'Copier',
  'tools.base64.lengths': '{in} caractères entrée · {out} caractères sortie',
};

const de: Translations = {
  'site.brand': 'Entwicklerwerkzeuge',
  'site.tagline': 'Eine Werkbank kleiner Entwickler-Tools. Nur lokal.',
  'site.copyright': 'Copyright © 2026 Pratiyush Kumar. Lizenziert unter AGPL-3.0.',
  'site.author': 'Erstellt von Pratiyush.',
  'nav.home': 'Startseite',
  'home.hero.title': '100 Entwickler-Tools, in deinem Browser.',
  'home.hero.subtitle':
    'Eine Werkbank kleiner Entwickler-Tools. Nur lokal — nichts verlässt deinen Browser. Jedes Tool ist über eine teilbare URL direkt verlinkbar.',
  'home.empty':
    'Noch keine Tools. Das erste kommt bald. Führe `pnpm new-tool <slug> --category <NN>` aus, um das erste hinzuzufügen.',
  'sidebar.search.placeholder': 'Tools suchen…',
  'sidebar.search.aria': 'Tools suchen',
  'sidebar.empty': 'Noch keine Tools',
  'sidebar.empty.search': 'Keine Treffer',
  'sidebar.foot.line1': 'Nur lokal · alle Verarbeitung läuft in deinem Browser.',
  'sidebar.foot.line2': 'Erstellt von Pratiyush.',
  'topbar.theme.aria': 'Thema',
  'topbar.github.aria': 'GitHub-Repository',
  'tool.placeholder.title': 'Tool noch nicht implementiert',
  'tool.placeholder.body': 'Tool-Logik verfügbar; Render-Schicht ausstehend.',
  'footer.privacy': 'Datenschutz',
  'footer.disclaimer': 'Haftungsausschluss',
  'footer.license': 'Lizenz',
  'footer.security': 'Sicherheit',
  'footer.repo': 'GitHub',
  'error.404.title': 'In der Werkstatt verloren',
  'error.404.body':
    'Kein Tool namens "{id}". Vielleicht umbenannt, eingelagert, oder der Link hat sich verirrt. Die Startseite kennt den Weg zurück.',
  'error.unknown':
    'Etwas ist kaputtgegangen. Die Ursache ist uns selbst nicht ganz klar. Neu laden hilft meist.',
  'error.copy.failed':
    'Die Zwischenablage hat Nein gesagt. Wahrscheinlich Berechtigungen — schau im Browser nach und versuch es noch einmal.',
  'error.parse.failed':
    'Das sieht nicht ganz richtig aus. Prüfe auf fremde Zeichen oder falsches Format und versuch es nochmal.',
  'error.back.home': '← Zurück zur Startseite',
  'tools.base64.mode.aria': 'Kodieren oder Dekodieren',
  'tools.base64.mode.encode': 'Kodieren',
  'tools.base64.mode.decode': 'Dekodieren',
  'tools.base64.urlsafe.label': 'URL-sichere Variante (-_, ohne Padding)',
  'tools.base64.urlsafe.aria': 'URL-sicheres base64-Alphabet verwenden',
  'tools.base64.input.label': 'Eingabe',
  'tools.base64.input.aria': 'Base64-Konverter-Eingabe',
  'tools.base64.input.placeholder':
    'Tippen oder einfügen — UTF-8, Emoji, JWT-Segmente. Alles macht den Roundtrip sauber.',
  'tools.base64.output.label': 'Ausgabe',
  'tools.base64.output.aria': 'Base64-Konverter-Ausgabe',
  'tools.base64.swap': 'Tauschen ⇄',
  'tools.base64.copy': 'Kopieren',
  'tools.base64.lengths': '{in} Zeichen Eingabe · {out} Zeichen Ausgabe',
};

const pt: Translations = {
  'site.brand': 'Ferramentas para Desenvolvedores',
  'site.tagline': 'Uma bancada de pequenas utilidades para desenvolvedores. Apenas local.',
  'site.copyright': 'Copyright © 2026 Pratiyush Kumar. Licenciado sob AGPL-3.0.',
  'site.author': 'Feito por Pratiyush.',
  'nav.home': 'Início',
  'home.hero.title': '100 ferramentas para devs, no seu navegador.',
  'home.hero.subtitle':
    'Uma bancada de pequenas utilidades para desenvolvedores. Apenas local — nada sai do seu navegador. Cada ferramenta tem um link direto para uma URL compartilhável.',
  'home.empty':
    'Ainda não há ferramentas. A primeira chega em breve. Execute `pnpm new-tool <slug> --category <NN>` para adicionar a primeira.',
  'sidebar.search.placeholder': 'Buscar ferramentas…',
  'sidebar.search.aria': 'Buscar ferramentas',
  'sidebar.empty': 'Ainda não há ferramentas',
  'sidebar.empty.search': 'Sem resultados',
  'sidebar.foot.line1': 'Apenas local · todo o processamento ocorre no seu navegador.',
  'sidebar.foot.line2': 'Feito por Pratiyush.',
  'topbar.theme.aria': 'Tema',
  'topbar.github.aria': 'Repositório do GitHub',
  'tool.placeholder.title': 'Ferramenta ainda não implementada',
  'tool.placeholder.body': 'Lógica da ferramenta disponível; camada de renderização pendente.',
  'footer.privacy': 'Privacidade',
  'footer.disclaimer': 'Isenção de responsabilidade',
  'footer.license': 'Licença',
  'footer.security': 'Segurança',
  'footer.repo': 'GitHub',
  'error.404.title': 'Perdido na oficina',
  'error.404.body':
    'Nenhuma ferramenta chamada "{id}". Pode ter sido renomeada, retirada, ou o link tropeçou no caminho. A página inicial sabe o caminho de volta.',
  'error.unknown':
    'Algo quebrou. A causa não está totalmente clara, nem para nós. Recarregar costuma ajudar.',
  'error.copy.failed':
    'A área de transferência disse não. Provavelmente é uma questão de permissões — verifica o navegador e tenta de novo.',
  'error.parse.failed':
    'Isso não parece muito certo. Verifica caracteres soltos ou formato errado e tenta de novo.',
  'error.back.home': '← Voltar ao início',
  'tools.base64.mode.aria': 'Codificar ou decodificar',
  'tools.base64.mode.encode': 'Codificar',
  'tools.base64.mode.decode': 'Decodificar',
  'tools.base64.urlsafe.label': 'Variante URL-safe (-_, sem padding)',
  'tools.base64.urlsafe.aria': 'Usar alfabeto base64 URL-safe',
  'tools.base64.input.label': 'Entrada',
  'tools.base64.input.aria': 'Entrada do conversor base64',
  'tools.base64.input.placeholder':
    'Digite ou cole — UTF-8, emoji, segmentos JWT. Tudo faz round-trip limpo.',
  'tools.base64.output.label': 'Saída',
  'tools.base64.output.aria': 'Saída do conversor base64',
  'tools.base64.swap': 'Trocar ⇄',
  'tools.base64.copy': 'Copiar',
  'tools.base64.lengths': '{in} caracteres entrada · {out} caracteres saída',
};

const it: Translations = {
  'site.brand': 'Strumenti per Sviluppatori',
  'site.tagline': 'Un banco da lavoro di piccoli strumenti per sviluppatori. Solo locale.',
  'site.copyright': 'Copyright © 2026 Pratiyush Kumar. Concesso in licenza AGPL-3.0.',
  'site.author': 'Realizzato da Pratiyush.',
  'nav.home': 'Home',
  'home.hero.title': '100 strumenti per dev, nel tuo browser.',
  'home.hero.subtitle':
    'Un banco da lavoro di piccoli strumenti per sviluppatori. Solo locale — nulla esce dal tuo browser. Ogni strumento ha un link diretto verso un URL condivisibile.',
  'home.empty':
    'Nessuno strumento ancora. Il primo arriva presto. Esegui `pnpm new-tool <slug> --category <NN>` per aggiungerne uno.',
  'sidebar.search.placeholder': 'Cerca strumenti…',
  'sidebar.search.aria': 'Cerca strumenti',
  'sidebar.empty': 'Nessuno strumento ancora',
  'sidebar.empty.search': 'Nessun risultato',
  'sidebar.foot.line1': 'Solo locale · tutta l’elaborazione avviene nel tuo browser.',
  'sidebar.foot.line2': 'Realizzato da Pratiyush.',
  'topbar.theme.aria': 'Tema',
  'topbar.github.aria': 'Repository GitHub',
  'tool.placeholder.title': 'Strumento non ancora implementato',
  'tool.placeholder.body': 'Logica dello strumento disponibile; livello di rendering in sospeso.',
  'footer.privacy': 'Privacy',
  'footer.disclaimer': 'Avviso legale',
  'footer.license': 'Licenza',
  'footer.security': 'Sicurezza',
  'footer.repo': 'GitHub',
  'error.404.title': 'Perso in officina',
  'error.404.body':
    'Nessuno strumento chiamato "{id}". Forse rinominato, ritirato, o il link ha sbagliato strada. La home conosce la via del ritorno.',
  'error.unknown':
    'Qualcosa si è rotto. La causa non è del tutto chiara, nemmeno per noi. Ricaricare di solito aiuta.',
  'error.copy.failed':
    'Gli appunti hanno detto no. Probabilmente è una questione di permessi — controlla il browser e riprova.',
  'error.parse.failed':
    'Non sembra del tutto giusto. Controlla caratteri estranei o formato sbagliato e riprova.',
  'error.back.home': '← Torna alla home',
  'tools.base64.mode.aria': 'Codifica o decodifica',
  'tools.base64.mode.encode': 'Codifica',
  'tools.base64.mode.decode': 'Decodifica',
  'tools.base64.urlsafe.label': 'Variante URL-safe (-_, senza padding)',
  'tools.base64.urlsafe.aria': 'Usa alfabeto base64 URL-safe',
  'tools.base64.input.label': 'Input',
  'tools.base64.input.aria': 'Input del convertitore base64',
  'tools.base64.input.placeholder':
    'Scrivi o incolla — UTF-8, emoji, segmenti JWT. Tutto torna integro.',
  'tools.base64.output.label': 'Output',
  'tools.base64.output.aria': 'Output del convertitore base64',
  'tools.base64.swap': 'Scambia ⇄',
  'tools.base64.copy': 'Copia',
  'tools.base64.lengths': '{in} caratteri input · {out} caratteri output',
};

const nl: Translations = {
  'site.brand': 'Ontwikkelaarstools',
  'site.tagline': 'Een werkbank met kleine ontwikkelaarstools. Alleen lokaal.',
  'site.copyright': 'Copyright © 2026 Pratiyush Kumar. Onder AGPL-3.0-licentie.',
  'site.author': 'Gemaakt door Pratiyush.',
  'nav.home': 'Home',
  'home.hero.title': '100 ontwikkelaarstools, in je browser.',
  'home.hero.subtitle':
    'Een werkbank met kleine ontwikkelaarstools. Alleen lokaal — niets verlaat je browser. Elke tool heeft een diepe link naar een deelbare URL.',
  'home.empty':
    'Nog geen tools. De eerste komt eraan. Voer `pnpm new-tool <slug> --category <NN>` uit om de eerste toe te voegen.',
  'sidebar.search.placeholder': 'Tools zoeken…',
  'sidebar.search.aria': 'Tools zoeken',
  'sidebar.empty': 'Nog geen tools',
  'sidebar.empty.search': 'Geen resultaten',
  'sidebar.foot.line1': 'Alleen lokaal · alle verwerking gebeurt in je browser.',
  'sidebar.foot.line2': 'Gemaakt door Pratiyush.',
  'topbar.theme.aria': 'Thema',
  'topbar.github.aria': 'GitHub-repository',
  'tool.placeholder.title': 'Tool nog niet geïmplementeerd',
  'tool.placeholder.body': 'Tool-logica beschikbaar; rendering-laag in afwachting.',
  'footer.privacy': 'Privacy',
  'footer.disclaimer': 'Disclaimer',
  'footer.license': 'Licentie',
  'footer.security': 'Beveiliging',
  'footer.repo': 'GitHub',
  'error.404.title': 'Verdwaald in de werkplaats',
  'error.404.body':
    'Geen tool met de naam "{id}". Misschien hernoemd, gepensioneerd, of de link is verdwaald. De homepage weet de weg terug.',
  'error.unknown':
    'Er is iets stuk. De oorzaak is ons niet helemaal duidelijk. Opnieuw laden helpt meestal.',
  'error.copy.failed':
    'Het klembord zei nee. Waarschijnlijk rechten — kijk in je browser en probeer het nog eens.',
  'error.parse.failed':
    'Dat klopt niet helemaal. Controleer op vreemde tekens of verkeerd formaat en probeer opnieuw.',
  'error.back.home': '← Terug naar home',
  'tools.base64.mode.aria': 'Coderen of decoderen',
  'tools.base64.mode.encode': 'Coderen',
  'tools.base64.mode.decode': 'Decoderen',
  'tools.base64.urlsafe.label': 'URL-veilige variant (-_, geen padding)',
  'tools.base64.urlsafe.aria': 'URL-veilig base64-alfabet gebruiken',
  'tools.base64.input.label': 'Invoer',
  'tools.base64.input.aria': 'Base64-converter-invoer',
  'tools.base64.input.placeholder':
    'Typ of plak — UTF-8, emoji, JWT-segmenten. Alles maakt schoon de round-trip.',
  'tools.base64.output.label': 'Uitvoer',
  'tools.base64.output.aria': 'Base64-converter-uitvoer',
  'tools.base64.swap': 'Wisselen ⇄',
  'tools.base64.copy': 'Kopiëren',
  'tools.base64.lengths': '{in} tekens invoer · {out} tekens uitvoer',
};

const pl: Translations = {
  'site.brand': 'Narzędzia dla deweloperów',
  'site.tagline': 'Warsztat małych narzędzi dla deweloperów. Tylko lokalnie.',
  'site.copyright': 'Copyright © 2026 Pratiyush Kumar. Na licencji AGPL-3.0.',
  'site.author': 'Stworzone przez Pratiyusha.',
  'nav.home': 'Strona główna',
  'home.hero.title': '100 narzędzi dla deweloperów, w Twojej przeglądarce.',
  'home.hero.subtitle':
    'Warsztat małych narzędzi dla deweloperów. Tylko lokalnie — nic nie opuszcza Twojej przeglądarki. Każde narzędzie ma głęboki link do udostępnianego adresu URL.',
  'home.empty':
    'Brak narzędzi. Pierwsze pojawi się wkrótce. Uruchom `pnpm new-tool <slug> --category <NN>`, aby dodać pierwsze.',
  'sidebar.search.placeholder': 'Szukaj narzędzi…',
  'sidebar.search.aria': 'Szukaj narzędzi',
  'sidebar.empty': 'Brak narzędzi',
  'sidebar.empty.search': 'Brak wyników',
  'sidebar.foot.line1': 'Tylko lokalnie · całe przetwarzanie odbywa się w Twojej przeglądarce.',
  'sidebar.foot.line2': 'Stworzone przez Pratiyusha.',
  'topbar.theme.aria': 'Motyw',
  'topbar.github.aria': 'Repozytorium GitHub',
  'tool.placeholder.title': 'Narzędzie jeszcze nie zaimplementowane',
  'tool.placeholder.body': 'Logika narzędzia dostępna; warstwa renderowania oczekuje.',
  'footer.privacy': 'Prywatność',
  'footer.disclaimer': 'Zastrzeżenie',
  'footer.license': 'Licencja',
  'footer.security': 'Bezpieczeństwo',
  'footer.repo': 'GitHub',
  'error.404.title': 'Zgubiono w warsztacie',
  'error.404.body':
    'Brak narzędzia o nazwie "{id}". Może je przemianowano, wycofano, albo link zabłądził. Strona główna zna drogę powrotną.',
  'error.unknown':
    'Coś się zepsuło. Przyczyna nie jest do końca jasna, nawet dla nas. Przeładowanie zwykle pomaga.',
  'error.copy.failed':
    'Schowek powiedział nie. Pewnie uprawnienia — sprawdź przeglądarkę i spróbuj jeszcze raz.',
  'error.parse.failed':
    'To nie wygląda zbyt prawidłowo. Sprawdź zbędne znaki lub zły format i spróbuj ponownie.',
  'error.back.home': '← Wróć do strony głównej',
  'tools.base64.mode.aria': 'Koduj lub dekoduj',
  'tools.base64.mode.encode': 'Koduj',
  'tools.base64.mode.decode': 'Dekoduj',
  'tools.base64.urlsafe.label': 'Wariant URL-safe (-_, bez paddingu)',
  'tools.base64.urlsafe.aria': 'Użyj alfabetu base64 URL-safe',
  'tools.base64.input.label': 'Wejście',
  'tools.base64.input.aria': 'Wejście konwertera base64',
  'tools.base64.input.placeholder':
    'Wpisz lub wklej — UTF-8, emoji, segmenty JWT. Wszystko czysto wraca w obie strony.',
  'tools.base64.output.label': 'Wyjście',
  'tools.base64.output.aria': 'Wyjście konwertera base64',
  'tools.base64.swap': 'Zamień ⇄',
  'tools.base64.copy': 'Kopiuj',
  'tools.base64.lengths': '{in} znaków wejście · {out} znaków wyjście',
};

const ru: Translations = {
  'site.brand': 'Инструменты разработчика',
  'site.tagline': 'Верстак небольших инструментов для разработчиков. Только локально.',
  'site.copyright': 'Copyright © 2026 Pratiyush Kumar. Лицензировано по AGPL-3.0.',
  'site.author': 'Сделано Pratiyush.',
  'nav.home': 'Главная',
  'home.hero.title': '100 инструментов для разработчиков, в вашем браузере.',
  'home.hero.subtitle':
    'Верстак небольших инструментов для разработчиков. Только локально — ничего не покидает ваш браузер. Каждый инструмент имеет глубокую ссылку на общедоступный URL.',
  'home.empty':
    'Инструментов пока нет. Первый скоро появится. Выполните `pnpm new-tool <slug> --category <NN>`, чтобы добавить первый.',
  'sidebar.search.placeholder': 'Поиск инструментов…',
  'sidebar.search.aria': 'Поиск инструментов',
  'sidebar.empty': 'Инструментов пока нет',
  'sidebar.empty.search': 'Нет совпадений',
  'sidebar.foot.line1': 'Только локально · вся обработка выполняется в вашем браузере.',
  'sidebar.foot.line2': 'Сделано Pratiyush.',
  'topbar.theme.aria': 'Тема',
  'topbar.github.aria': 'Репозиторий GitHub',
  'tool.placeholder.title': 'Инструмент ещё не реализован',
  'tool.placeholder.body': 'Логика инструмента доступна; слой отрисовки ожидает.',
  'footer.privacy': 'Конфиденциальность',
  'footer.disclaimer': 'Отказ от ответственности',
  'footer.license': 'Лицензия',
  'footer.security': 'Безопасность',
  'footer.repo': 'GitHub',
  'error.404.title': 'Потерялся в мастерской',
  'error.404.body':
    'Нет инструмента с именем "{id}". Возможно, переименован, снят с производства, или ссылка свернула не туда. Главная знает дорогу обратно.',
  'error.unknown':
    'Что-то сломалось. Причина не до конца ясна даже нам. Обычно помогает перезагрузка.',
  'error.copy.failed':
    'Буфер обмена отказал. Скорее всего, разрешения — проверьте настройки браузера и попробуйте ещё раз.',
  'error.parse.failed':
    'Это выглядит не совсем правильно. Проверьте лишние символы или неверный формат и попробуйте снова.',
  'error.back.home': '← Вернуться на главную',
  'tools.base64.mode.aria': 'Кодировать или декодировать',
  'tools.base64.mode.encode': 'Кодировать',
  'tools.base64.mode.decode': 'Декодировать',
  'tools.base64.urlsafe.label': 'URL-безопасный вариант (-_, без padding)',
  'tools.base64.urlsafe.aria': 'Использовать URL-безопасный алфавит base64',
  'tools.base64.input.label': 'Ввод',
  'tools.base64.input.aria': 'Ввод конвертера base64',
  'tools.base64.input.placeholder':
    'Введите или вставьте — UTF-8, эмодзи, сегменты JWT. Всё чисто проходит туда и обратно.',
  'tools.base64.output.label': 'Вывод',
  'tools.base64.output.aria': 'Вывод конвертера base64',
  'tools.base64.swap': 'Поменять ⇄',
  'tools.base64.copy': 'Копировать',
  'tools.base64.lengths': '{in} символов ввод · {out} символов вывод',
};

const tr: Translations = {
  'site.brand': 'Geliştirici Araçları',
  'site.tagline': 'Küçük geliştirici araçlarından oluşan bir tezgâh. Yalnızca yerel.',
  'site.copyright': 'Telif Hakkı © 2026 Pratiyush Kumar. AGPL-3.0 lisansıyla lisanslanmıştır.',
  'site.author': 'Pratiyush tarafından yapıldı.',
  'nav.home': 'Ana Sayfa',
  'home.hero.title': 'Tarayıcınızda 100 geliştirici aracı.',
  'home.hero.subtitle':
    'Küçük geliştirici araçlarından oluşan bir tezgâh. Yalnızca yerel — hiçbir şey tarayıcınızdan çıkmaz. Her aracın paylaşılabilir bir URL’ye derin bağlantısı vardır.',
  'home.empty':
    'Henüz araç yok. İlki yakında geliyor. İlk aracı eklemek için `pnpm new-tool <slug> --category <NN>` çalıştırın.',
  'sidebar.search.placeholder': 'Araçlarda ara…',
  'sidebar.search.aria': 'Araçlarda ara',
  'sidebar.empty': 'Henüz araç yok',
  'sidebar.empty.search': 'Eşleşme yok',
  'sidebar.foot.line1': 'Yalnızca yerel · tüm işlemler tarayıcınızda gerçekleşir.',
  'sidebar.foot.line2': 'Pratiyush tarafından yapıldı.',
  'topbar.theme.aria': 'Tema',
  'topbar.github.aria': 'GitHub deposu',
  'tool.placeholder.title': 'Araç henüz uygulanmadı',
  'tool.placeholder.body': 'Araç mantığı mevcut; oluşturma katmanı bekliyor.',
  'footer.privacy': 'Gizlilik',
  'footer.disclaimer': 'Sorumluluk Reddi',
  'footer.license': 'Lisans',
  'footer.security': 'Güvenlik',
  'footer.repo': 'GitHub',
  'error.404.title': 'Atölyede kaybolduk',
  'error.404.body':
    '"{id}" adında bir araç yok. Yeniden adlandırılmış, emekliye ayrılmış veya bağlantı sapıtmış olabilir. Ana sayfa geri dönüş yolunu biliyor.',
  'error.unknown':
    'Bir şey kırıldı. Sebep tam olarak bize de net değil. Sayfayı yeniden yüklemek genelde işe yarar.',
  'error.copy.failed':
    'Pano hayır dedi. Muhtemelen izin meselesi — tarayıcı ayarlarını kontrol edip yeniden dene.',
  'error.parse.failed':
    'Bu pek doğru görünmüyor. Garip karakter veya yanlış biçim var mı bak, yeniden dene.',
  'error.back.home': '← Ana sayfaya dön',
  'tools.base64.mode.aria': 'Kodla veya çöz',
  'tools.base64.mode.encode': 'Kodla',
  'tools.base64.mode.decode': 'Çöz',
  'tools.base64.urlsafe.label': 'URL-güvenli varyant (-_, padding yok)',
  'tools.base64.urlsafe.aria': 'URL-güvenli base64 alfabesini kullan',
  'tools.base64.input.label': 'Girdi',
  'tools.base64.input.aria': 'Base64 dönüştürücü girdi',
  'tools.base64.input.placeholder':
    'Yaz veya yapıştır — UTF-8, emoji, JWT segmentleri. Hepsi temiz şekilde gidip geliyor.',
  'tools.base64.output.label': 'Çıktı',
  'tools.base64.output.aria': 'Base64 dönüştürücü çıktı',
  'tools.base64.swap': 'Değiştir ⇄',
  'tools.base64.copy': 'Kopyala',
  'tools.base64.lengths': '{in} karakter girdi · {out} karakter çıktı',
};

const ja: Translations = {
  'site.brand': '開発者ツール',
  'site.tagline': '小さな開発者ツールのワークベンチ。ローカルのみ。',
  'site.copyright': 'Copyright © 2026 Pratiyush Kumar. AGPL-3.0 ライセンスの下で公開。',
  'site.author': 'Pratiyush が制作。',
  'nav.home': 'ホーム',
  'home.hero.title': 'ブラウザで動く 100 個の開発者ツール。',
  'home.hero.subtitle':
    '小さな開発者ツールのワークベンチ。ローカルのみ — ブラウザから何も送信されません。各ツールには共有可能な URL へのディープリンクがあります。',
  'home.empty':
    'まだツールはありません。最初のものはもうすぐ公開されます。最初のツールを追加するには `pnpm new-tool <slug> --category <NN>` を実行してください。',
  'sidebar.search.placeholder': 'ツールを検索…',
  'sidebar.search.aria': 'ツールを検索',
  'sidebar.empty': 'まだツールはありません',
  'sidebar.empty.search': '一致するものはありません',
  'sidebar.foot.line1': 'ローカルのみ · すべての処理はブラウザ内で行われます。',
  'sidebar.foot.line2': 'Pratiyush が制作。',
  'topbar.theme.aria': 'テーマ',
  'topbar.github.aria': 'GitHub リポジトリ',
  'tool.placeholder.title': 'ツールはまだ実装されていません',
  'tool.placeholder.body': 'ツールロジックは利用可能；レンダリング層は保留中。',
  'footer.privacy': 'プライバシー',
  'footer.disclaimer': '免責事項',
  'footer.license': 'ライセンス',
  'footer.security': 'セキュリティ',
  'footer.repo': 'GitHub',
  'error.404.title': '工房で迷子',
  'error.404.body':
    '"{id}" というツールはありません。名前が変わったか、引退したか、リンクが寄り道したのかも。ホームが戻り道を知っています。',
  'error.unknown':
    '何かが壊れました。原因は私たちにもよく分かりません。再読み込みでだいたい直ります。',
  'error.copy.failed':
    'クリップボードに拒否されました。たぶん権限の問題です — ブラウザの設定を確認して、もう一度試してください。',
  'error.parse.failed':
    '何かが違うようです。余分な文字や形式の誤りがないか確認して、もう一度試してください。',
  'error.back.home': '← ホームに戻る',
  'tools.base64.mode.aria': 'エンコードまたはデコード',
  'tools.base64.mode.encode': 'エンコード',
  'tools.base64.mode.decode': 'デコード',
  'tools.base64.urlsafe.label': 'URL安全バリアント (-_, パディングなし)',
  'tools.base64.urlsafe.aria': 'URL安全な base64 アルファベットを使用',
  'tools.base64.input.label': '入力',
  'tools.base64.input.aria': 'Base64 コンバータ入力',
  'tools.base64.input.placeholder':
    '入力または貼り付け — UTF-8、絵文字、JWT セグメント。すべてクリーンに往復します。',
  'tools.base64.output.label': '出力',
  'tools.base64.output.aria': 'Base64 コンバータ出力',
  'tools.base64.swap': '入れ替え ⇄',
  'tools.base64.copy': 'コピー',
  'tools.base64.lengths': '入力 {in} 文字 · 出力 {out} 文字',
};

const zh: Translations = {
  'site.brand': '开发者工具',
  'site.tagline': '小型开发者实用工具的工作台。仅本地。',
  'site.copyright': '版权所有 © 2026 Pratiyush Kumar。基于 AGPL-3.0 许可。',
  'site.author': '由 Pratiyush 制作。',
  'nav.home': '主页',
  'home.hero.title': '在你的浏览器中，100 个开发者工具。',
  'home.hero.subtitle':
    '小型开发者实用工具的工作台。仅本地 — 没有任何内容离开你的浏览器。每个工具都有可分享的深度链接 URL。',
  'home.empty':
    '还没有工具。第一个即将推出。运行 `pnpm new-tool <slug> --category <NN>` 添加第一个工具。',
  'sidebar.search.placeholder': '搜索工具…',
  'sidebar.search.aria': '搜索工具',
  'sidebar.empty': '还没有工具',
  'sidebar.empty.search': '没有匹配项',
  'sidebar.foot.line1': '仅本地 · 所有处理都在你的浏览器中进行。',
  'sidebar.foot.line2': '由 Pratiyush 制作。',
  'topbar.theme.aria': '主题',
  'topbar.github.aria': 'GitHub 仓库',
  'tool.placeholder.title': '工具尚未实现',
  'tool.placeholder.body': '工具逻辑可用；渲染层待实现。',
  'footer.privacy': '隐私',
  'footer.disclaimer': '免责声明',
  'footer.license': '许可证',
  'footer.security': '安全',
  'footer.repo': 'GitHub',
  'error.404.title': '在工作室里迷路了',
  'error.404.body':
    '没有叫 "{id}" 的工具。可能改名了、退役了，或者链接走错了路。主页知道回家的路。',
  'error.unknown': '出了点问题。原因连我们也不太清楚。重新加载通常有用。',
  'error.copy.failed': '剪贴板拒绝了。八成是权限问题 — 检查一下浏览器设置，再试一次。',
  'error.parse.failed': '看起来不太对。检查一下多余的字符或错误格式，再试一次。',
  'error.back.home': '← 返回主页',
  'tools.base64.mode.aria': '编码或解码',
  'tools.base64.mode.encode': '编码',
  'tools.base64.mode.decode': '解码',
  'tools.base64.urlsafe.label': 'URL 安全变体 (-_, 无填充)',
  'tools.base64.urlsafe.aria': '使用 URL 安全的 base64 字母表',
  'tools.base64.input.label': '输入',
  'tools.base64.input.aria': 'Base64 转换器输入',
  'tools.base64.input.placeholder': '输入或粘贴 — UTF-8、表情符号、JWT 段。全都干净地往返。',
  'tools.base64.output.label': '输出',
  'tools.base64.output.aria': 'Base64 转换器输出',
  'tools.base64.swap': '交换 ⇄',
  'tools.base64.copy': '复制',
  'tools.base64.lengths': '输入 {in} 字符 · 输出 {out} 字符',
};

const ko: Translations = {
  'site.brand': '개발자 도구',
  'site.tagline': '작은 개발자 유틸리티의 작업대. 로컬 전용.',
  'site.copyright': '저작권 © 2026 Pratiyush Kumar. AGPL-3.0 라이선스에 따름.',
  'site.author': 'Pratiyush 제작.',
  'nav.home': '홈',
  'home.hero.title': '브라우저에서 100개의 개발자 도구.',
  'home.hero.subtitle':
    '작은 개발자 유틸리티의 작업대. 로컬 전용 — 브라우저에서 아무것도 나가지 않습니다. 각 도구는 공유 가능한 URL로 딥 링크됩니다.',
  'home.empty':
    '아직 도구가 없습니다. 곧 첫 번째 도구가 출시됩니다. 첫 번째 도구를 추가하려면 `pnpm new-tool <slug> --category <NN>`을 실행하세요.',
  'sidebar.search.placeholder': '도구 검색…',
  'sidebar.search.aria': '도구 검색',
  'sidebar.empty': '아직 도구가 없습니다',
  'sidebar.empty.search': '일치하는 항목 없음',
  'sidebar.foot.line1': '로컬 전용 · 모든 처리는 브라우저에서 실행됩니다.',
  'sidebar.foot.line2': 'Pratiyush 제작.',
  'topbar.theme.aria': '테마',
  'topbar.github.aria': 'GitHub 리포지토리',
  'tool.placeholder.title': '도구가 아직 구현되지 않았습니다',
  'tool.placeholder.body': '도구 로직 사용 가능; 렌더링 계층 대기 중.',
  'footer.privacy': '개인정보 보호',
  'footer.disclaimer': '면책 조항',
  'footer.license': '라이선스',
  'footer.security': '보안',
  'footer.repo': 'GitHub',
  'error.404.title': '작업장에서 길을 잃음',
  'error.404.body':
    '"{id}"라는 도구가 없습니다. 이름이 바뀌었거나 은퇴했거나, 링크가 길을 잘못 들었을지도. 홈이 돌아가는 길을 압니다.',
  'error.unknown': '무언가 깨졌습니다. 원인은 우리도 잘 모릅니다. 새로 고침하면 보통 해결됩니다.',
  'error.copy.failed':
    '클립보드가 거부했습니다. 권한 문제일 가능성이 높습니다 — 브라우저 설정을 확인하고 다시 시도하세요.',
  'error.parse.failed':
    '뭔가 어긋난 것 같습니다. 이상한 문자나 잘못된 형식을 확인하고 다시 시도하세요.',
  'error.back.home': '← 홈으로 돌아가기',
  'tools.base64.mode.aria': '인코딩 또는 디코딩',
  'tools.base64.mode.encode': '인코딩',
  'tools.base64.mode.decode': '디코딩',
  'tools.base64.urlsafe.label': 'URL 안전 변형 (-_, 패딩 없음)',
  'tools.base64.urlsafe.aria': 'URL 안전 base64 알파벳 사용',
  'tools.base64.input.label': '입력',
  'tools.base64.input.aria': 'Base64 변환기 입력',
  'tools.base64.input.placeholder':
    '입력하거나 붙여넣으세요 — UTF-8, 이모지, JWT 세그먼트. 모두 깔끔하게 왕복합니다.',
  'tools.base64.output.label': '출력',
  'tools.base64.output.aria': 'Base64 변환기 출력',
  'tools.base64.swap': '교환 ⇄',
  'tools.base64.copy': '복사',
  'tools.base64.lengths': '입력 {in}자 · 출력 {out}자',
};

const hi: Translations = {
  'site.brand': 'डेवलपर टूल्स',
  'site.tagline': 'छोटे डेवलपर उपयोगिताओं का एक वर्कबेंच। केवल स्थानीय।',
  'site.copyright': 'कॉपीराइट © 2026 Pratiyush Kumar। AGPL-3.0 के तहत लाइसेंस प्राप्त।',
  'site.author': 'Pratiyush द्वारा बनाया गया।',
  'nav.home': 'होम',
  'home.hero.title': 'आपके ब्राउज़र में 100 डेवलपर टूल्स।',
  'home.hero.subtitle':
    'छोटे डेवलपर उपयोगिताओं का एक वर्कबेंच। केवल स्थानीय — आपके ब्राउज़र से कुछ भी बाहर नहीं जाता। हर टूल एक साझा करने योग्य URL के लिए डीप-लिंक प्रदान करता है।',
  'home.empty':
    'अभी तक कोई टूल नहीं। पहला जल्द आ रहा है। पहला जोड़ने के लिए `pnpm new-tool <slug> --category <NN>` चलाएँ।',
  'sidebar.search.placeholder': 'टूल खोजें…',
  'sidebar.search.aria': 'टूल खोजें',
  'sidebar.empty': 'अभी तक कोई टूल नहीं',
  'sidebar.empty.search': 'कोई मिलान नहीं',
  'sidebar.foot.line1': 'केवल स्थानीय · सारा प्रोसेसिंग आपके ब्राउज़र में होती है।',
  'sidebar.foot.line2': 'Pratiyush द्वारा बनाया गया।',
  'topbar.theme.aria': 'थीम',
  'topbar.github.aria': 'GitHub रिपॉजिटरी',
  'tool.placeholder.title': 'टूल अभी तक लागू नहीं किया गया',
  'tool.placeholder.body': 'टूल लॉजिक उपलब्ध; रेंडर लेयर लंबित।',
  'footer.privacy': 'गोपनीयता',
  'footer.disclaimer': 'अस्वीकरण',
  'footer.license': 'लाइसेंस',
  'footer.security': 'सुरक्षा',
  'footer.repo': 'GitHub',
  'error.404.title': 'वर्कशॉप में खो गए',
  'error.404.body':
    '"{id}" नाम का कोई टूल नहीं है। शायद नाम बदला, हटाया गया, या लिंक रास्ता भूल गया। होम पेज वापस का रास्ता जानता है।',
  'error.unknown':
    'कुछ टूट गया। वजह हमें भी पूरी तरह स्पष्ट नहीं है। रीलोड करना अक्सर मदद करता है।',
  'error.copy.failed':
    'क्लिपबोर्ड ने मना कर दिया। शायद अनुमति की बात है — ब्राउज़र देखें और फिर से कोशिश करें।',
  'error.parse.failed':
    'यह पूरी तरह सही नहीं लग रहा। फालतू वर्ण या गलत फॉर्मेट देखें और फिर कोशिश करें।',
  'error.back.home': '← होम पर वापस',
  'tools.base64.mode.aria': 'एनकोड या डीकोड',
  'tools.base64.mode.encode': 'एनकोड',
  'tools.base64.mode.decode': 'डीकोड',
  'tools.base64.urlsafe.label': 'URL-सुरक्षित प्रकार (-_, बिना पैडिंग)',
  'tools.base64.urlsafe.aria': 'URL-सुरक्षित base64 वर्णमाला का उपयोग करें',
  'tools.base64.input.label': 'इनपुट',
  'tools.base64.input.aria': 'Base64 कनवर्टर इनपुट',
  'tools.base64.input.placeholder':
    'टाइप करें या पेस्ट करें — UTF-8, इमोजी, JWT सेगमेंट। सब साफ-सुथरे राउंड-ट्रिप करते हैं।',
  'tools.base64.output.label': 'आउटपुट',
  'tools.base64.output.aria': 'Base64 कनवर्टर आउटपुट',
  'tools.base64.swap': 'स्वैप ⇄',
  'tools.base64.copy': 'कॉपी',
  'tools.base64.lengths': 'इनपुट {in} वर्ण · आउटपुट {out} वर्ण',
};

const ar: Translations = {
  'site.brand': 'أدوات المطورين',
  'site.tagline': 'منضدة عمل لأدوات المطورين الصغيرة. محلية فقط.',
  'site.copyright': 'حقوق النشر © 2026 Pratiyush Kumar. مرخصة بموجب AGPL-3.0.',
  'site.author': 'صنع بواسطة Pratiyush.',
  'nav.home': 'الرئيسية',
  'home.hero.title': '100 أداة للمطورين، في متصفحك.',
  'home.hero.subtitle':
    'منضدة عمل لأدوات المطورين الصغيرة. محلية فقط — لا شيء يغادر متصفحك. كل أداة تحتوي على رابط عميق إلى عنوان URL قابل للمشاركة.',
  'home.empty':
    'لا توجد أدوات بعد. الأولى قادمة قريبًا. شغّل `pnpm new-tool <slug> --category <NN>` لإضافة الأولى.',
  'sidebar.search.placeholder': 'البحث في الأدوات…',
  'sidebar.search.aria': 'البحث في الأدوات',
  'sidebar.empty': 'لا توجد أدوات بعد',
  'sidebar.empty.search': 'لا توجد نتائج',
  'sidebar.foot.line1': 'محلية فقط · تجري جميع المعالجة في متصفحك.',
  'sidebar.foot.line2': 'صنع بواسطة Pratiyush.',
  'topbar.theme.aria': 'السمة',
  'topbar.github.aria': 'مستودع GitHub',
  'tool.placeholder.title': 'الأداة لم تُنفّذ بعد',
  'tool.placeholder.body': 'منطق الأداة متاح؛ طبقة العرض في الانتظار.',
  'footer.privacy': 'الخصوصية',
  'footer.disclaimer': 'إخلاء المسؤولية',
  'footer.license': 'الترخيص',
  'footer.security': 'الأمان',
  'footer.repo': 'GitHub',
  'error.404.title': 'تائه في الورشة',
  'error.404.body':
    'لا توجد أداة بالاسم "{id}". ربما تغيّر اسمها، أو تقاعدت، أو ضل الرابط طريقه. الصفحة الرئيسية تعرف طريق العودة.',
  'error.unknown': 'شيء ما تعطّل. السبب ليس واضحًا تمامًا حتى لنا. إعادة التحميل تفي بالغرض عادةً.',
  'error.copy.failed':
    'الحافظة رفضت. على الأرجح مسألة أذونات — تحقق من إعدادات المتصفح وحاول مرة أخرى.',
  'error.parse.failed': 'هذا لا يبدو صحيحًا تمامًا. تحقق من حروف زائدة أو تنسيق خاطئ وحاول مجددًا.',
  'error.back.home': '← العودة إلى الرئيسية',
  'tools.base64.mode.aria': 'ترميز أو فك ترميز',
  'tools.base64.mode.encode': 'ترميز',
  'tools.base64.mode.decode': 'فك ترميز',
  'tools.base64.urlsafe.label': 'المتغير الآمن للروابط (-_، بدون حشو)',
  'tools.base64.urlsafe.aria': 'استخدم الأبجدية base64 الآمنة للروابط',
  'tools.base64.input.label': 'الإدخال',
  'tools.base64.input.aria': 'إدخال محول base64',
  'tools.base64.input.placeholder':
    'اكتب أو الصق — UTF-8، الإيموجي، أجزاء JWT. كلها تذهب وتعود نظيفة.',
  'tools.base64.output.label': 'الإخراج',
  'tools.base64.output.aria': 'إخراج محول base64',
  'tools.base64.swap': 'تبديل ⇄',
  'tools.base64.copy': 'نسخ',
  'tools.base64.lengths': '{in} حرف إدخال · {out} حرف إخراج',
};

export const ALL_TRANSLATIONS: Record<string, Translations> = {
  en,
  es,
  fr,
  de,
  pt,
  it,
  nl,
  pl,
  ru,
  tr,
  ja,
  zh,
  ko,
  hi,
  ar,
};

export const LOCALE_ORDER: readonly string[] = Object.keys(ALL_TRANSLATIONS);
