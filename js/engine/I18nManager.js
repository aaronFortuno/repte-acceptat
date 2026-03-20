/**
 * I18nManager — Gestiona la internacionalització de la interfície.
 * Singleton que proporciona traduccions per a CA, ES, EN, EU i GL.
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
    menu_cta_text: 'Tens una idea? Crea la teva pròpia aventura amb l\'editor visual o envia\'ns-la per correu!',
    menu_cta_editor: 'Obrir editor visual',
    menu_cta_email: 'Enviar per correu',
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
    lang_eu: 'EU',
    lang_gl: 'GL',

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
    error_loading_adventure: ({ msg }) => `Error carregant l'aventura: ${msg}`,

    // Editor
    editor_back: 'Tornar',
    editor_new: 'Nou',
    editor_open: 'Obrir',
    editor_import: 'Importar',
    editor_save: 'Guardar',
    editor_export: 'Exportar',
    editor_validate: 'Validar',
    editor_test: 'Provar',
    editor_title_placeholder: 'Títol de l\'aventura',
    editor_confirm_unsaved: 'Tens canvis sense guardar. Continuar?',
    editor_confirm_new: 'Crear nou projecte? Els canvis actuals es perdran.',
    editor_no_projects: 'Cap projecte guardat',
    editor_autosave_available: 'Autoguardat disponible',
    editor_load_autosave: 'Recuperar autoguardat',
    editor_saved: 'Projecte guardat',
    editor_exported: 'Aventura exportada',
    editor_validation_title: 'Validació',
    editor_ctx_create_node: 'Crear node',
    editor_ctx_set_start: 'Marcar com a inici',
    editor_ctx_toggle_ending: 'Canviar final',
    editor_ctx_delete: 'Eliminar',
    editor_metadata: 'Metadades',
    editor_metadata_title: 'Títol',
    editor_metadata_author: 'Autor',
    editor_metadata_desc: 'Descripció',
    editor_metadata_difficulty: 'Dificultat',
    editor_metadata_language: 'Idioma',
    editor_create_adventure: 'Crear aventura',
    editor_errors_found: 'Errors trobats. Corregeix abans de provar.',
    editor_ending_good: 'Final bo',
    editor_ending_bad: 'Final dolent'
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
    menu_cta_text: '¿Tienes una idea? ¡Crea tu propia aventura con el editor visual o envíanosla por correo!',
    menu_cta_editor: 'Abrir editor visual',
    menu_cta_email: 'Enviar por correo',
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
    lang_eu: 'EU',
    lang_gl: 'GL',

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

    error_loading_adventure: ({ msg }) => `Error cargando la aventura: ${msg}`,

    // Editor
    editor_back: 'Volver',
    editor_new: 'Nuevo',
    editor_open: 'Abrir',
    editor_import: 'Importar',
    editor_save: 'Guardar',
    editor_export: 'Exportar',
    editor_validate: 'Validar',
    editor_test: 'Probar',
    editor_title_placeholder: 'Título de la aventura',
    editor_confirm_unsaved: 'Tienes cambios sin guardar. ¿Continuar?',
    editor_confirm_new: '¿Crear nuevo proyecto? Los cambios actuales se perderán.',
    editor_no_projects: 'Ningún proyecto guardado',
    editor_autosave_available: 'Autoguardado disponible',
    editor_load_autosave: 'Recuperar autoguardado',
    editor_saved: 'Proyecto guardado',
    editor_exported: 'Aventura exportada',
    editor_validation_title: 'Validación',
    editor_ctx_create_node: 'Crear nodo',
    editor_ctx_set_start: 'Marcar como inicio',
    editor_ctx_toggle_ending: 'Cambiar final',
    editor_ctx_delete: 'Eliminar',
    editor_metadata: 'Metadatos',
    editor_metadata_title: 'Título',
    editor_metadata_author: 'Autor',
    editor_metadata_desc: 'Descripción',
    editor_metadata_difficulty: 'Dificultad',
    editor_metadata_language: 'Idioma',
    editor_create_adventure: 'Crear aventura',
    editor_errors_found: 'Errores encontrados. Corrige antes de probar.',
    editor_ending_good: 'Final bueno',
    editor_ending_bad: 'Final malo'
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
    menu_cta_text: 'Got an idea? Create your own adventure with the visual editor or send it to us by email!',
    menu_cta_editor: 'Open visual editor',
    menu_cta_email: 'Send by email',
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
    lang_eu: 'EU',
    lang_gl: 'GL',

    difficulty_easy: 'Easy',
    difficulty_hard: 'Hard',

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

    error_loading_adventure: ({ msg }) => `Error loading adventure: ${msg}`,

    // Editor
    editor_back: 'Back',
    editor_new: 'New',
    editor_open: 'Open',
    editor_import: 'Import',
    editor_save: 'Save',
    editor_export: 'Export',
    editor_validate: 'Validate',
    editor_test: 'Test',
    editor_title_placeholder: 'Adventure title',
    editor_confirm_unsaved: 'You have unsaved changes. Continue?',
    editor_confirm_new: 'Create new project? Current changes will be lost.',
    editor_no_projects: 'No saved projects',
    editor_autosave_available: 'Autosave available',
    editor_load_autosave: 'Recover autosave',
    editor_saved: 'Project saved',
    editor_exported: 'Adventure exported',
    editor_validation_title: 'Validation',
    editor_ctx_create_node: 'Create node',
    editor_ctx_set_start: 'Set as start',
    editor_ctx_toggle_ending: 'Toggle ending',
    editor_ctx_delete: 'Delete',
    editor_metadata: 'Metadata',
    editor_metadata_title: 'Title',
    editor_metadata_author: 'Author',
    editor_metadata_desc: 'Description',
    editor_metadata_difficulty: 'Difficulty',
    editor_metadata_language: 'Language',
    editor_create_adventure: 'Create adventure',
    editor_errors_found: 'Errors found. Fix before testing.',
    editor_ending_good: 'Good ending',
    editor_ending_bad: 'Bad ending'
  },

  eu: {
    page_title: 'Testu-abenturak Retro',
    title_subtitle: '80ko hamarkadako testu-abenturen motorea',
    title_prompt: 'Sakatu edozein tekla',
    changelog_title: 'Bertsio-historia',
    changelog_close: 'Itxi',

    menu_title: 'MENU NAGUSIA',
    menu_choose: 'Aukeratu abentura bat',
    menu_no_adventures: 'Ez dago abenturarik eskuragarri',
    menu_filter_all: 'Denak',
    menu_scenes: ({ n }) => `${n} eszena`,
    menu_endings: ({ total, good, bad }) => `${total} amaiera (${good} ★ / ${bad} ☠)`,
    menu_author_anonymous: 'Anonimoa',
    menu_cta_text: 'Ideia bat duzu? Sortu zure abentura editore bisualarekin edo bidali iezaguzu posta elektronikoz!',
    menu_cta_editor: 'Editore bisuala ireki',
    menu_cta_email: 'Postaz bidali',
    menu_submit_btn: 'Bidali zure abentura',
    menu_submit_title: 'Bidali zure abentura!',
    menu_submit_intro: 'Abentura baten ideia duzu? Jasatea gustatuko litzaiguke!',
    menu_submit_how: 'Nola egin:',
    menu_submit_step1: 'Bidali mezu elektroniko bat hona:',
    menu_submit_step2: 'Erantsi nodoen testuak eta ekintzak dituen dokumentu bat',
    menu_submit_step3: 'Ez da JSON formatuaren beharrik, guk alde teknikoa kudeatzen dugu',
    menu_submit_email_btn: 'Mezua bidali',
    menu_submit_close: 'Itxi',

    lang_ca: 'CA',
    lang_es: 'ES',
    lang_en: 'EN',
    lang_eu: 'EU',
    lang_gl: 'GL',

    difficulty_easy: 'Erraza',
    difficulty_hard: 'Zaila',

    settings_title: 'AUKERAK',
    settings_back: 'Itzuli',
    settings_theme: 'Gaia',
    settings_theme_dark: 'Iluna',
    settings_theme_light: 'Argia',
    settings_music: 'Musika',
    settings_sfx: 'Soinu-efektuak',
    settings_typewriter: 'Idazketa-efektua',
    settings_timer: 'Kronometroa',
    settings_language: 'Hizkuntza',
    settings_font_size: 'Letra-tamaina',
    settings_font_family: 'Tipografia',
    settings_font_retro: 'Retro 8-bit',
    settings_font_accessible: 'Irakurgarria',

    game_victory: '★ GARAIPENA! ★',
    game_over: '☠ GAME OVER ☠',
    game_restart_good: 'Berriro jolastu',
    game_restart_bad: 'Saiatu berriro',
    game_menu_btn: 'Menura itzuli',
    game_mute_btn: 'Musika isilarazi',
    game_unmute_btn: 'Musika aktibatu',
    game_settings_btn: 'Aukerak',
    game_menu_tooltip: 'Menu nagusia',
    game_deaths_label: ({ d }) => `Heriotzak: ${d}`,
    game_deaths_tooltip: 'Saiakera hutsak',

    death_summary_zero: 'Abentura gainditu duzu behin ere hil gabe! Esan zure irakasleari irakurmenean bikain jartzeko! Edo agian mila aldiz jokatu duzu eta buruz dakizu...',
    death_summary_few: ({ d }) => `${d} heriotza bakarrik! Irakurmen ona duzu, nahiz eta xehetasunen bat ihes egin dizun. Bigarren irakurketa batek konponduko du!`,
    death_summary_some: ({ d }) => `${d} heriotza. Ez dago gaizki, baina agian testuak arreta handiagoz irakurri beharko zenituzke. Xehetasunek garrantzia dute!`,
    death_summary_many: ({ d }) => `${d} heriotza! Ene bada. Ziur testuak osorik irakurtzen dituzula edo zuzenean botoietara joaten zara? Ezkutuko xehetasunak TESTUAN daude, ez botoietan!`,
    death_summary_extreme: ({ d }) => `${d} heriotza! Ziur kurtso bat errepikatu behar ez duzula? Testurik irakurri duzu? Agian zoriondu behar zaitugu, esfortzu handia eskatzen baitu hainbeste modutan hiltzea!`,

    timer_expired: 'Ene bada, beti denbora agortu beharrean... zer egiten zenuen testua aurrean zenuen bitartean, mugikorra begiratu?',
    timer_fast: 'Tximista-abiadura! Denbora asko sobran bukatu duzu.',
    timer_ok: 'Garaiz, baina lasai hartu duzu.',
    timer_close: 'Ilezain! Minutu bat gehiago eta ez zenuen lortuko.',

    end_victory: 'GARAIPENA!',
    end_game_over: 'GAME OVER',
    end_restart_good: 'Berriro jolastu',
    end_restart_bad: 'Saiatu berriro, galtzaile',
    end_menu: 'Menura itzuli',

    error_loading_adventure: ({ msg }) => `Errorea abentura kargatzean: ${msg}`,

    // Editor
    editor_back: 'Atzera',
    editor_new: 'Berria',
    editor_open: 'Ireki',
    editor_import: 'Inportatu',
    editor_save: 'Gorde',
    editor_export: 'Esportatu',
    editor_validate: 'Balioztatu',
    editor_test: 'Probatu',
    editor_title_placeholder: 'Abenturaren izenburua',
    editor_confirm_unsaved: 'Gorde gabeko aldaketak dituzu. Jarraitu?',
    editor_confirm_new: 'Proiektu berria sortu? Oraingo aldaketak galduko dira.',
    editor_no_projects: 'Ez dago gordetako proiekturik',
    editor_autosave_available: 'Automatikoki gordeta eskuragarri',
    editor_load_autosave: 'Automatikoki gordeta berreskuratu',
    editor_saved: 'Proiektua gordeta',
    editor_exported: 'Abentura esportatuta',
    editor_validation_title: 'Baliozkotzea',
    editor_ctx_create_node: 'Nodoa sortu',
    editor_ctx_set_start: 'Hasiera gisa markatu',
    editor_ctx_toggle_ending: 'Amaiera aldatu',
    editor_ctx_delete: 'Ezabatu',
    editor_metadata: 'Metadatuak',
    editor_metadata_title: 'Izenburua',
    editor_metadata_author: 'Egilea',
    editor_metadata_desc: 'Deskribapena',
    editor_metadata_difficulty: 'Zailtasuna',
    editor_metadata_language: 'Hizkuntza',
    editor_create_adventure: 'Abentura sortu',
    editor_errors_found: 'Erroreak aurkitu dira. Zuzendu probatu aurretik.',
    editor_ending_good: 'Amaiera ona',
    editor_ending_bad: 'Amaiera txarra'
  },

  gl: {
    page_title: 'Aventuras Textuais Retro',
    title_subtitle: 'Motor de aventuras textuais estilo anos 80',
    title_prompt: 'Preme calquera tecla',
    changelog_title: 'Historial de versións',
    changelog_close: 'Pechar',

    menu_title: 'MENÚ PRINCIPAL',
    menu_choose: 'Escolle unha aventura',
    menu_no_adventures: 'Non hai aventuras dispoñibles',
    menu_filter_all: 'Todas',
    menu_scenes: ({ n }) => `${n} escenas`,
    menu_endings: ({ total, good, bad }) => `${total} finais (${good} ★ / ${bad} ☠)`,
    menu_author_anonymous: 'Anónimo',
    menu_cta_text: 'Tes unha idea? Crea a túa propia aventura co editor visual ou envíanola por correo!',
    menu_cta_editor: 'Abrir editor visual',
    menu_cta_email: 'Enviar por correo',
    menu_submit_btn: 'Envíanos a túa aventura',
    menu_submit_title: 'Envíanos a túa aventura!',
    menu_submit_intro: 'Tes unha idea para unha aventura? Encantaríanos recibila!',
    menu_submit_how: 'Como facelo:',
    menu_submit_step1: 'Envía un correo a',
    menu_submit_step2: 'Adxunta un documento cos textos dos nodos e as accións',
    menu_submit_step3: 'Non fai falta formato JSON, nós encargámonos da parte técnica',
    menu_submit_email_btn: 'Enviar correo',
    menu_submit_close: 'Pechar',

    lang_ca: 'CA',
    lang_es: 'ES',
    lang_en: 'EN',
    lang_eu: 'EU',
    lang_gl: 'GL',

    difficulty_easy: 'Fácil',
    difficulty_hard: 'Difícil',

    settings_title: 'OPCIÓNS',
    settings_back: 'Volver',
    settings_theme: 'Tema',
    settings_theme_dark: 'Escuro',
    settings_theme_light: 'Claro',
    settings_music: 'Música',
    settings_sfx: 'Efectos de son',
    settings_typewriter: 'Efecto escritura',
    settings_timer: 'Temporizador',
    settings_language: 'Lingua',
    settings_font_size: 'Tamaño de letra',
    settings_font_family: 'Tipografía',
    settings_font_retro: 'Retro 8-bit',
    settings_font_accessible: 'Lexible',

    game_victory: '★ VITORIA! ★',
    game_over: '☠ GAME OVER ☠',
    game_restart_good: 'Volver xogar',
    game_restart_bad: 'Téntao de novo',
    game_menu_btn: 'Volver ao menú',
    game_mute_btn: 'Silenciar música',
    game_unmute_btn: 'Activar música',
    game_settings_btn: 'Opcións',
    game_menu_tooltip: 'Menú principal',
    game_deaths_label: ({ d }) => `Mortes: ${d}`,
    game_deaths_tooltip: 'Intentos fallidos',

    death_summary_zero: 'Superaches a aventura sen morrer nin unha soa vez! Dille ao teu profe que che poña un sobresaínte en comprensión lectora! Ou se cadra xa xogaches mil veces e sábelo de memoria...',
    death_summary_few: ({ d }) => `Só ${d} morte${d > 1 ? 's' : ''}! Tes moi boa comprensión lectora, aínda que algún detalle se che escapou. Nada que unha segunda lectura non arranxe!`,
    death_summary_some: ({ d }) => `${d} mortes. Non está mal, pero se cadra deberías ler os textos cun pouco máis de atención. Os detalles importan!`,
    death_summary_many: ({ d }) => `${d} mortes! Vaites. Seguro que les os textos enteiros ou vas directamente aos botóns? Os detalles agochados están NO TEXTO, non nos botóns!`,
    death_summary_extreme: ({ d }) => `${d} mortes! Seguro que non tes que repetir curso? Liches algún texto? Se cadra hai que felicitarte, porque hai que esforzarse moito para conseguir morrer de tantas formas posibles!`,

    timer_expired: 'Miña nai, sempre apurando o tempo... que facías mentres tiñas o texto diante, mirar o móbil?',
    timer_fast: 'Velocidade relámpago! Acabaches con tempo de sobra.',
    timer_ok: 'Xusto a tempo, pero tomáchelo con calma.',
    timer_close: 'Polos pelos! Un minuto máis e non o contas.',

    end_victory: 'VITORIA!',
    end_game_over: 'GAME OVER',
    end_restart_good: 'Volver xogar',
    end_restart_bad: 'Téntao de novo, perdedor',
    end_menu: 'Volver ao menú',

    error_loading_adventure: ({ msg }) => `Erro cargando a aventura: ${msg}`,

    // Editor
    editor_back: 'Volver',
    editor_new: 'Novo',
    editor_open: 'Abrir',
    editor_import: 'Importar',
    editor_save: 'Gardar',
    editor_export: 'Exportar',
    editor_validate: 'Validar',
    editor_test: 'Probar',
    editor_title_placeholder: 'Título da aventura',
    editor_confirm_unsaved: 'Tes cambios sen gardar. Continuar?',
    editor_confirm_new: 'Crear novo proxecto? Os cambios actuais perderanse.',
    editor_no_projects: 'Ningún proxecto gardado',
    editor_autosave_available: 'Autogardado dispoñible',
    editor_load_autosave: 'Recuperar autogardado',
    editor_saved: 'Proxecto gardado',
    editor_exported: 'Aventura exportada',
    editor_validation_title: 'Validación',
    editor_ctx_create_node: 'Crear nodo',
    editor_ctx_set_start: 'Marcar como inicio',
    editor_ctx_toggle_ending: 'Cambiar final',
    editor_ctx_delete: 'Eliminar',
    editor_metadata: 'Metadatos',
    editor_metadata_title: 'Título',
    editor_metadata_author: 'Autor',
    editor_metadata_desc: 'Descrición',
    editor_metadata_difficulty: 'Dificultade',
    editor_metadata_language: 'Idioma',
    editor_create_adventure: 'Crear aventura',
    editor_errors_found: 'Erros atopados. Corrixe antes de probar.',
    editor_ending_good: 'Final bo',
    editor_ending_bad: 'Final malo'
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
   * @param {string} lang — 'ca', 'es', 'en', 'eu' o 'gl'
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
