/**
 * I18nManager — Gestiona la internacionalització de la interfície.
 * Singleton que proporciona traduccions per a CA, ES i EN.
 * Les aventures NO es tradueixen — cada una té un idioma fix.
 */

const TRANSLATIONS = {
  ca: {
    // Títol
    page_title: 'Aventures Textuals Retro',
    title_subtitle: 'Motor d\'aventures textuals estil anys 80',
    title_prompt: 'Prem qualsevol tecla',
    changelog_title: 'Historial de versions',
    changelog_close: 'Tancar',

    // Menú
    menu_title: 'MENÚ PRINCIPAL',
    menu_choose: 'Tria una aventura',
    menu_no_adventures: 'Cap aventura disponible',
    menu_filter_all: 'Totes',
    menu_scenes: ({ n }) => `${n} escenes`,
    menu_endings: ({ total, good, bad }) => `${total} finals (${good} ★ / ${bad} ☠)`,
    menu_author_anonymous: 'Anònim',
    menu_submit_btn: 'Envia\'ns la teva aventura',
    menu_submit_title: 'Envia\'ns la teva aventura!',
    menu_submit_intro: 'Tens una idea per a una aventura? Ens encantaria rebre-la!',
    menu_submit_how: 'Com fer-ho:',
    menu_submit_step1: 'Envia un correu a',
    menu_submit_step2: 'Adjunta un document amb els textos dels nodes i les accions',
    menu_submit_step3: 'No cal format JSON, nosaltres ens encarreguem de la part tècnica',
    menu_submit_email_btn: 'Enviar correu',
    menu_submit_close: 'Tancar',

    // Filtre d'idioma
    lang_ca: 'CA',
    lang_es: 'ES',
    lang_en: 'EN',

    // Dificultat
    difficulty_easy: 'Fàcil',
    difficulty_hard: 'Difícil',

    // Opcions
    settings_title: 'OPCIONS',
    settings_back: 'Tornar',
    settings_theme: 'Tema',
    settings_theme_dark: 'Fosc',
    settings_theme_light: 'Clar',
    settings_music: 'Música',
    settings_sfx: 'Efectes sonors',
    settings_typewriter: 'Efecte escriptura',
    settings_timer: 'Temporitzador',
    settings_language: 'Idioma',
    settings_font_size: 'Mida de lletra',
    settings_font_family: 'Tipografia',
    settings_font_retro: 'Retro 8-bit',
    settings_font_accessible: 'Llegible',

    // Joc
    game_victory: '★ VICTÒRIA! ★',
    game_over: '☠ GAME OVER ☠',
    game_restart_good: 'Tornar a jugar',
    game_restart_bad: 'Torna a intentar-ho',
    game_menu_btn: 'Tornar al menú',
    game_mute_btn: 'Silenciar música',
    game_unmute_btn: 'Activar música',
    game_settings_btn: 'Opcions',
    game_menu_tooltip: 'Menú principal',
    game_deaths_label: ({ d }) => `Morts: ${d}`,
    game_deaths_tooltip: 'Intents fallits',

    // Missatges de mort
    death_summary_zero: 'Has superat l\'aventura sense morir ni una sola vegada! Diga-li al teu professor/a que et posi un assoliment excel·lent en comprensió lectora! O potser és que ja has jugat mil vegades i te\'n recordes de memòria...',
    death_summary_few: ({ d }) => `Només ${d} mort${d > 1 ? 's' : ''}! Tens molt bona comprensió lectora, tot i que algun detall se t'ha escapat. Res que una segona lectura no arregli!`,
    death_summary_some: ({ d }) => `${d} morts. No està malament, però potser hauries de llegir els textos amb una mica més d'atenció. Els detalls importen!`,
    death_summary_many: ({ d }) => `${d} morts! Ui, que fort. Segur que llegeixes els textos sencers o vas directament als botons? Els detalls amagats estan AL TEXT, no als botons!`,
    death_summary_extreme: ({ d }) => `${d} morts! Vols dir que no has de repetir curs? T'has llegit algun text? Potser cal felicitar-te, perquè s'ha d'esmerçar força per aconseguir morir de tantes formes possibles!`,

    // Timer
    timer_expired: 'Mare meva, apurant el temps sempre... què feies mentre tenies el text al davant, mirar el mòbil?',
    timer_fast: 'Velocitat llamp! Has acabat amb temps de sobra.',
    timer_ok: 'Just a temps, però t\'ho has pres amb calma.',
    timer_close: 'Per els pèls! Un minut més i no ho expliques.',

    // End screen
    end_victory: 'VICTÒRIA!',
    end_game_over: 'GAME OVER',
    end_restart_good: 'Tornar a jugar',
    end_restart_bad: 'Torna a intentar-ho, perdedor',
    end_menu: 'Tornar al menú',

    // Errors
    error_loading_adventure: ({ msg }) => `Error carregant l'aventura: ${msg}`
  },

  es: {
    page_title: 'Aventuras Textuales Retro',
    title_subtitle: 'Motor de aventuras textuales estilo años 80',
    title_prompt: 'Pulsa cualquier tecla',
    changelog_title: 'Historial de versiones',
    changelog_close: 'Cerrar',

    menu_title: 'MENÚ PRINCIPAL',
    menu_choose: 'Elige una aventura',
    menu_no_adventures: 'No hay aventuras disponibles',
    menu_filter_all: 'Todas',
    menu_scenes: ({ n }) => `${n} escenas`,
    menu_endings: ({ total, good, bad }) => `${total} finales (${good} ★ / ${bad} ☠)`,
    menu_author_anonymous: 'Anónimo',
    menu_submit_btn: 'Envíanos tu aventura',
    menu_submit_title: '¡Envíanos tu aventura!',
    menu_submit_intro: '¿Tienes una idea para una aventura? ¡Nos encantaría recibirla!',
    menu_submit_how: 'Cómo hacerlo:',
    menu_submit_step1: 'Envía un correo a',
    menu_submit_step2: 'Adjunta un documento con los textos de los nodos y las acciones',
    menu_submit_step3: 'No hace falta formato JSON, nosotros nos encargamos de la parte técnica',
    menu_submit_email_btn: 'Enviar correo',
    menu_submit_close: 'Cerrar',

    lang_ca: 'CA',
    lang_es: 'ES',
    lang_en: 'EN',

    difficulty_easy: 'Fácil',
    difficulty_hard: 'Difícil',

    settings_title: 'OPCIONES',
    settings_back: 'Volver',
    settings_theme: 'Tema',
    settings_theme_dark: 'Oscuro',
    settings_theme_light: 'Claro',
    settings_music: 'Música',
    settings_sfx: 'Efectos de sonido',
    settings_typewriter: 'Efecto escritura',
    settings_timer: 'Temporizador',
    settings_language: 'Idioma',
    settings_font_size: 'Tamaño de letra',
    settings_font_family: 'Tipografía',
    settings_font_retro: 'Retro 8-bit',
    settings_font_accessible: 'Legible',

    game_victory: '★ ¡VICTORIA! ★',
    game_over: '☠ GAME OVER ☠',
    game_restart_good: 'Volver a jugar',
    game_restart_bad: 'Inténtalo de nuevo',
    game_menu_btn: 'Volver al menú',
    game_mute_btn: 'Silenciar música',
    game_unmute_btn: 'Activar música',
    game_settings_btn: 'Opciones',
    game_menu_tooltip: 'Menú principal',
    game_deaths_label: ({ d }) => `Muertes: ${d}`,
    game_deaths_tooltip: 'Intentos fallidos',

    death_summary_zero: '¡Has superado la aventura sin morir ni una sola vez! Dile a tu profe que te ponga un sobresaliente en comprensión lectora. ¿O es que ya has jugado mil veces y te lo sabes de memoria?',
    death_summary_few: ({ d }) => `¡Solo ${d} muerte${d > 1 ? 's' : ''}! Tienes muy buena comprensión lectora, aunque algún detalle se te ha escapado. ¡Nada que una segunda lectura no arregle!`,
    death_summary_some: ({ d }) => `${d} muertes. No está mal, pero quizá deberías leer los textos con un poco más de atención. ¡Los detalles importan!`,
    death_summary_many: ({ d }) => `¡${d} muertes! Uy, qué fuerte. ¿Seguro que lees los textos enteros o vas directamente a los botones? Los detalles ocultos están EN EL TEXTO, ¡no en los botones!`,
    death_summary_extreme: ({ d }) => `¡${d} muertes! ¿Seguro que no tienes que repetir curso? ¿Te has leído algún texto? Quizá hay que felicitarte, porque hay que esforzarse mucho para conseguir morir de tantas formas posibles.`,

    timer_expired: 'Madre mía, siempre apurando el tiempo... ¿qué hacías mientras tenías el texto delante, mirar el móvil?',
    timer_fast: '¡Velocidad relámpago! Has acabado con tiempo de sobra.',
    timer_ok: 'Justo a tiempo, pero te lo has tomado con calma.',
    timer_close: '¡Por los pelos! Un minuto más y no lo cuentas.',

    end_victory: '¡VICTORIA!',
    end_game_over: 'GAME OVER',
    end_restart_good: 'Volver a jugar',
    end_restart_bad: 'Inténtalo de nuevo, perdedor',
    end_menu: 'Volver al menú',

    error_loading_adventure: ({ msg }) => `Error cargando la aventura: ${msg}`
  },

  en: {
    page_title: 'Retro Text Adventures',
    title_subtitle: '80s-style text adventure engine',
    title_prompt: 'Press any key',
    changelog_title: 'Version history',
    changelog_close: 'Close',

    menu_title: 'MAIN MENU',
    menu_choose: 'Choose an adventure',
    menu_no_adventures: 'No adventures available',
    menu_filter_all: 'All',
    menu_scenes: ({ n }) => `${n} scenes`,
    menu_endings: ({ total, good, bad }) => `${total} endings (${good} ★ / ${bad} ☠)`,
    menu_author_anonymous: 'Anonymous',
    menu_submit_btn: 'Submit your adventure',
    menu_submit_title: 'Submit your adventure!',
    menu_submit_intro: 'Got an idea for an adventure? We\'d love to receive it!',
    menu_submit_how: 'How to do it:',
    menu_submit_step1: 'Send an email to',
    menu_submit_step2: 'Attach a document with the node texts and actions',
    menu_submit_step3: 'No JSON format needed, we\'ll handle the technical part',
    menu_submit_email_btn: 'Send email',
    menu_submit_close: 'Close',

    lang_ca: 'CA',
    lang_es: 'ES',
    lang_en: 'EN',

    difficulty_easy: 'Easy',
    difficulty_hard: 'Hard',

    menu_title: 'MAIN MENU',

    settings_title: 'SETTINGS',
    settings_back: 'Back',
    settings_theme: 'Theme',
    settings_theme_dark: 'Dark',
    settings_theme_light: 'Light',
    settings_music: 'Music',
    settings_sfx: 'Sound effects',
    settings_typewriter: 'Typewriter effect',
    settings_timer: 'Timer',
    settings_language: 'Language',
    settings_font_size: 'Font size',
    settings_font_family: 'Font',
    settings_font_retro: 'Retro 8-bit',
    settings_font_accessible: 'Readable',

    game_victory: '★ VICTORY! ★',
    game_over: '☠ GAME OVER ☠',
    game_restart_good: 'Play again',
    game_restart_bad: 'Try again',
    game_menu_btn: 'Back to menu',
    game_mute_btn: 'Mute music',
    game_unmute_btn: 'Unmute music',
    game_settings_btn: 'Settings',
    game_menu_tooltip: 'Main menu',
    game_deaths_label: ({ d }) => `Deaths: ${d}`,
    game_deaths_tooltip: 'Failed attempts',

    death_summary_zero: 'You completed the adventure without dying once! Tell your teacher to give you top marks in reading comprehension! Or maybe you\'ve just played a thousand times and know it by heart...',
    death_summary_few: ({ d }) => `Only ${d} death${d > 1 ? 's' : ''}! You have great reading comprehension, even though some details slipped by. Nothing a second read won't fix!`,
    death_summary_some: ({ d }) => `${d} deaths. Not bad, but maybe you should read the texts a bit more carefully. Details matter!`,
    death_summary_many: ({ d }) => `${d} deaths! Wow, that's rough. Are you sure you read the full texts or do you just go straight to the buttons? The hidden details are IN THE TEXT, not the buttons!`,
    death_summary_extreme: ({ d }) => `${d} deaths! Are you sure you don't need to repeat a grade? Did you read any of the texts? Maybe we should congratulate you, because it takes real effort to die in so many different ways!`,

    timer_expired: 'Always cutting it close with time... what were you doing while the text was right in front of you, checking your phone?',
    timer_fast: 'Lightning speed! You finished with plenty of time to spare.',
    timer_ok: 'Just in time, but you sure took it easy.',
    timer_close: 'By a hair! One more minute and you wouldn\'t have made it.',

    end_victory: 'VICTORY!',
    end_game_over: 'GAME OVER',
    end_restart_good: 'Play again',
    end_restart_bad: 'Try again, loser',
    end_menu: 'Back to menu',

    error_loading_adventure: ({ msg }) => `Error loading adventure: ${msg}`
  }
};

class I18nManager {
  constructor() {
    this._lang = 'ca';
    this._settings = null;
  }

  /**
   * Inicialitza amb el SettingsManager per llegir/escriure la preferència d'idioma.
   * @param {SettingsManager} settingsManager
   */
  init(settingsManager) {
    this._settings = settingsManager;
    this._lang = settingsManager.get('language') || 'ca';
  }

  /**
   * Retorna l'idioma actiu.
   * @returns {string}
   */
  get lang() {
    return this._lang;
  }

  /**
   * Canvia l'idioma actiu i el persisteix.
   * @param {string} lang — 'ca', 'es' o 'en'
   */
  setLanguage(lang) {
    if (!TRANSLATIONS[lang]) return;
    this._lang = lang;
    if (this._settings) {
      this._settings.set('language', lang);
    }
  }

  /**
   * Retorna la traducció per a una clau, amb paràmetres opcionals.
   * Fallback: idioma sol·licitat → català → clau crua.
   * @param {string} key
   * @param {object} [params]
   * @returns {string}
   */
  t(key, params) {
    // Intentar idioma actiu
    let val = TRANSLATIONS[this._lang]?.[key];
    // Fallback a català
    if (val === undefined) {
      val = TRANSLATIONS.ca?.[key];
    }
    // Fallback a clau crua
    if (val === undefined) {
      return key;
    }
    // Si és funció, cridar amb paràmetres
    if (typeof val === 'function') {
      return val(params || {});
    }
    return val;
  }
}

// Singleton
const i18n = new I18nManager();
export default i18n;
