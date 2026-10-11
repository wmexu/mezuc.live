export type Language = "en" | "ru" | "es" | "fi";

export interface Translations {
  // Navigation & TopBar
  searchPlaceholder: string;
  quality: string;
  importAudio: string;
  pureSound: string;
  streamingPlatform: string;
  sessionFlow: string;
  sessionPaused: string;
  settings: string;
  flow: string;
  search: string;
  library: string;
  canvas: string;

  // Settings Modal
  settingsTitle: string;
  appearance: string;
  theme: string;
  darkTheme: string;
  lightTheme: string;
  fixedAccentColor: string;
  accentPresets: string;
  customColor: string;
  resetDefaultColor: string;
  noTheme: string;
  contactMe: string;
  language: string;
  close: string;
  username: string;
  enterUsername: string;
  editUsername: string;
  saveUsername: string;

  // Notifications
  notifAddedFavorite: string;
  notifRemovedFavorite: string;
  notifShuffleOn: string;
  notifShuffleOff: string;
  notifRepeatPlaylist: string;
  notifRepeatSong: string;
  notifRepeatOff: string;
  notifThemeDark: string;
  notifThemeLight: string;
  notifWaveAccent: string;
  notifLanguage: string;
  notifQuality: string;

  // Filter Tabs
  all: string;
  ambient: string;
  minimal: string;
  techno: string;

  // Section Headers
  startHere: string;
  showAll: string;
  featuredMaster: string;
  featuredMasterDesc: string;
  dailyMixPrefix: string;
  curatedForYou: string;
  mixesCount: string;
  keepListening: string;
  recentlyPlayed: string;
  sessionArchive: string;
  tracksCount: string;
  artistRole: string;
  soundArchive: string;
  searchAndCurate: string;

  // Actions & Buttons
  playMaster: string;
  pauseMaster: string;
  openAlbum: string;
  backToCatalog: string;
  album: string;

  // Table Columns
  colNumber: string;
  colTitle: string;
  colAlbum: string;
  colQuality: string;
  colDuration: string;

  // Player & Controls
  masterVolume: string;
  mute: string;
  unmute: string;
  addToQueue: string;
  queue: string;
  favorites: string;
  clearQueue: string;
  focusMode: string;
  emptyQueue: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    searchPlaceholder: "Search tracks, artists, albums...",
    quality: "Quality",
    importAudio: "Import",
    pureSound: "Pure Monochrome Sound",
    streamingPlatform: "Streaming Platform",
    sessionFlow: "Session Flow",
    sessionPaused: "Session Paused",
    settings: "Settings",
    flow: "Flow",
    search: "Search",
    library: "Library",
    canvas: "Canvas",

    settingsTitle: "Settings & Personalization",
    appearance: "Appearance & Theme",
    theme: "Theme Mode",
    darkTheme: "Dark",
    lightTheme: "Light",
    fixedAccentColor: "Accent Wave Color",
    accentPresets: "Presets",
    customColor: "Custom Palette",
    resetDefaultColor: "Reset to Track Colors",
    noTheme: "No Theme",
    contactMe: "Contact Me",
    language: "Language",
    close: "Close",
    username: "Username",
    enterUsername: "Enter your username...",
    editUsername: "Edit username",
    saveUsername: "Save",

    notifAddedFavorite: "Added to Favorites",
    notifRemovedFavorite: "Removed from Favorites",
    notifShuffleOn: "Shuffle Enabled",
    notifShuffleOff: "Shuffle Disabled",
    notifRepeatPlaylist: "Repeat: Playlist",
    notifRepeatSong: "Repeat: Song",
    notifRepeatOff: "Repeat: Off",
    notifThemeDark: "Theme: Dark Mode",
    notifThemeLight: "Theme: Light Mode",
    notifWaveAccent: "Wave Accent Updated",
    notifLanguage: "Language: ",
    notifQuality: "Audio Quality: ",

    all: "All",
    ambient: "Ambient",
    minimal: "Minimal",
    techno: "Techno",

    startHere: "Start Here",
    showAll: "Show all",
    featuredMaster: "Featured Master",
    featuredMasterDesc: "Discover artist cuts in pure 96kHz monochromatic audio with natural spatial imaging.",
    dailyMixPrefix: "Daily Mix",
    curatedForYou: "Curated for you",
    mixesCount: "3 mixes",
    keepListening: "Keep Listening",
    recentlyPlayed: "Recently Played",
    sessionArchive: "Session Archive",
    tracksCount: "tracks",
    artistRole: "Artist",
    soundArchive: "Sound Archive",
    searchAndCurate: "Search & Curate",

    playMaster: "Play Master",
    pauseMaster: "Pause Master",
    openAlbum: "Open Album",
    backToCatalog: "Back to Flow / Catalog",
    album: "Album",

    colNumber: "#",
    colTitle: "Title",
    colAlbum: "Album",
    colQuality: "Quality",
    colDuration: "Duration",

    masterVolume: "Master Volume",
    mute: "Mute",
    unmute: "Unmute",
    addToQueue: "Add to queue",
    queue: "Queue",
    favorites: "Favorites",
    clearQueue: "Clear queue",
    focusMode: "muzec.live",
    emptyQueue: "Queue is empty",
  },

  ru: {
    searchPlaceholder: "Поиск треков, авторов, альбомов...",
    quality: "Качество",
    importAudio: "Импорт",
    pureSound: "Чистый монохромный звук",
    streamingPlatform: "Стриминговая платформа",
    sessionFlow: "Сессия Flow",
    sessionPaused: "Сессия приостановлена",
    settings: "Настройки",
    flow: "Flow",
    search: "Поиск",
    library: "Медиатека",
    canvas: "Холст",

    settingsTitle: "Настройки и персонализация",
    appearance: "Внешний вид и тема",
    theme: "Режим темы",
    darkTheme: "Темная",
    lightTheme: "Светлая",
    fixedAccentColor: "Акцентный цвет волн",
    accentPresets: "Пресеты",
    customColor: "Палитра цвета",
    resetDefaultColor: "Сбросить к цвету трека",
    noTheme: "Без темы",
    contactMe: "Связаться со мной",
    language: "Язык интерфейса",
    close: "Закрыть",
    username: "Имя пользователя",
    enterUsername: "Введите имя пользователя...",
    editUsername: "Изменить имя",
    saveUsername: "Сохранить",

    notifAddedFavorite: "Добавлено в избранное",
    notifRemovedFavorite: "Удалено из избранного",
    notifShuffleOn: "Перемешивание включено",
    notifShuffleOff: "Перемешивание выключено",
    notifRepeatPlaylist: "Повтор: Плейлист",
    notifRepeatSong: "Повтор: Трек",
    notifRepeatOff: "Повтор: Выключен",
    notifThemeDark: "Тема: Темная",
    notifThemeLight: "Тема: Светлая",
    notifWaveAccent: "Цвет волн обновлен",
    notifLanguage: "Язык: ",
    notifQuality: "Качество звука: ",

    all: "Все",
    ambient: "Эмбиент",
    minimal: "Минимал",
    techno: "Техно",

    startHere: "С чего начать",
    showAll: "Показать все",
    featuredMaster: "Мастер-релиз",
    featuredMasterDesc: "Открой для себя треки от исполнителей в чистом 96kHz монохромном звучании с натуральным пространственным разрешением.",
    dailyMixPrefix: "Микс дня",
    curatedForYou: "Только для тебя",
    mixesCount: "3 микса",
    keepListening: "Слушаем дальше?",
    recentlyPlayed: "Недавние",
    sessionArchive: "Архив сессий",
    tracksCount: "треков",
    artistRole: "Исполнитель",
    soundArchive: "Звуковой архив",
    searchAndCurate: "Поиск и селекция",

    playMaster: "Play Master",
    pauseMaster: "Пауза",
    openAlbum: "Открыть альбом",
    backToCatalog: "Назад к Flow / Каталогу",
    album: "Альбом",

    colNumber: "#",
    colTitle: "Название",
    colAlbum: "Альбом",
    colQuality: "Качество",
    colDuration: "Длительность",

    masterVolume: "Громкость мастера",
    mute: "Без звука",
    unmute: "Включить звук",
    addToQueue: "В очередь",
    queue: "Очередь",
    favorites: "Избранное",
    clearQueue: "Очистить очередь",
    focusMode: "muzec.live",
    emptyQueue: "Очередь пуста",
  },

  es: {
    searchPlaceholder: "Buscar pistas, artistas, álbumes...",
    quality: "Calidad",
    importAudio: "Importar",
    pureSound: "Sonido Monocromo Puro",
    streamingPlatform: "Plataforma de streaming",
    sessionFlow: "Sesión Flow",
    sessionPaused: "Sesión pausada",
    settings: "Ajustes",
    flow: "Flow",
    search: "Buscar",
    library: "Biblioteca",
    canvas: "Lienzo",

    settingsTitle: "Ajustes y Personalización",
    appearance: "Apariencia y Tema",
    theme: "Modo de tema",
    darkTheme: "Oscuro",
    lightTheme: "Claro",
    fixedAccentColor: "Color de onda de acento",
    accentPresets: "Preajustes",
    customColor: "Paleta personalizada",
    resetDefaultColor: "Restablecer a colores de pista",
    noTheme: "Sin tema",
    contactMe: "Contáctame",
    language: "Idioma",
    close: "Cerrar",
    username: "Nombre de usuario",
    enterUsername: "Introduce tu nombre de usuario...",
    editUsername: "Editar nombre",
    saveUsername: "Guardar",

    notifAddedFavorite: "Añadido a favoritos",
    notifRemovedFavorite: "Eliminado de favoritos",
    notifShuffleOn: "Aleatorio activado",
    notifShuffleOff: "Aleatorio desactivado",
    notifRepeatPlaylist: "Repetir: Lista",
    notifRepeatSong: "Repetir: Pista",
    notifRepeatOff: "Repetir: Desactivado",
    notifThemeDark: "Tema: Oscuro",
    notifThemeLight: "Tema: Claro",
    notifWaveAccent: "Color de onda actualizado",
    notifLanguage: "Idioma: ",
    notifQuality: "Calidad de audio: ",

    all: "Todo",
    ambient: "Ambient",
    minimal: "Minimal",
    techno: "Techno",

    startHere: "Empezar aquí",
    showAll: "Mostrar todo",
    featuredMaster: "Master Destacado",
    featuredMasterDesc: "Descubre pistas de artistas en audio monocromo puro a 96kHz con una imagen espacial natural.",
    dailyMixPrefix: "Mix diario",
    curatedForYou: "Para ti",
    mixesCount: "3 mezclas",
    keepListening: "¿Seguir escuchando?",
    recentlyPlayed: "Recientes",
    sessionArchive: "Archivo de sesión",
    tracksCount: "pistas",
    artistRole: "Artista",
    soundArchive: "Archivo de sonido",
    searchAndCurate: "Buscar y Curar",

    playMaster: "Reproducir Master",
    pauseMaster: "Pausa",
    openAlbum: "Abrir Álbum",
    backToCatalog: "Volver a Flow / Catálogo",
    album: "Álbum",

    colNumber: "#",
    colTitle: "Título",
    colAlbum: "Álbum",
    colQuality: "Calidad",
    colDuration: "Duración",

    masterVolume: "Volumen maestro",
    mute: "Silenciar",
    unmute: "Activar sonido",
    addToQueue: "Añadir a la cola",
    queue: "Cola",
    favorites: "Favoritos",
    clearQueue: "Vaciar cola",
    focusMode: "muzec.live",
    emptyQueue: "La cola está vacía",
  },

  fi: {
    searchPlaceholder: "Hae kappaleita, esittäjiä, albumeita...",
    quality: "Äänenlaatu",
    importAudio: "Tuo tiedosto",
    pureSound: "Puhdas Monokromaattinen Ääni",
    streamingPlatform: "Suoratoistoalusta",
    sessionFlow: "Flow-istunto",
    sessionPaused: "Istunto keskeytetty",
    settings: "Asetukset",
    flow: "Flow",
    search: "Haku",
    library: "Kirjasto",
    canvas: "Kangas",

    settingsTitle: "Asetukset ja Mukauttaminen",
    appearance: "Ulkoasu ja Teema",
    theme: "Teematila",
    darkTheme: "Tumma",
    lightTheme: "Vaalea",
    fixedAccentColor: "Aallon korostusväri",
    accentPresets: "Esiasetukset",
    customColor: "Mukautettu väri",
    resetDefaultColor: "Palauta kappaleen värit",
    noTheme: "Ei teemaa",
    contactMe: "Ota yhteyttä",
    language: "Kieli",
    close: "Sulje",
    username: "Käyttäjänimi",
    enterUsername: "Syötä käyttäjänimi...",
    editUsername: "Muokkaa nimeä",
    saveUsername: "Tallenna",

    notifAddedFavorite: "Lisätty suosikkeihin",
    notifRemovedFavorite: "Poistettu suosikeista",
    notifShuffleOn: "Sekoitus käytössä",
    notifShuffleOff: "Sekoitus pois päältä",
    notifRepeatPlaylist: "Toisto: Soittolista",
    notifRepeatSong: "Toisto: Kappale",
    notifRepeatOff: "Toisto: Ei käytössä",
    notifThemeDark: "Teema: Tumma",
    notifThemeLight: "Teema: Vaalea",
    notifWaveAccent: "Aallon väri päivitetty",
    notifLanguage: "Kieli: ",
    notifQuality: "Äänenlaatu: ",

    all: "Kaikki",
    ambient: "Ambient",
    minimal: "Minimal",
    techno: "Techno",

    startHere: "Aloita tästä",
    showAll: "Näytä kaikki",
    featuredMaster: "Esittelyssä Master",
    featuredMasterDesc: "Löydä artistien kappaleet puhtaana 96kHz monokromaattisena äänenä luonnollisella tilaresoluutiolla.",
    dailyMixPrefix: "Päivän miksaus",
    curatedForYou: "Vain sinulle",
    mixesCount: "3 miksausta",
    keepListening: "Jatka kuuntelua",
    recentlyPlayed: "Äskettäiset",
    sessionArchive: "Istuntoarkisto",
    tracksCount: "kappaletta",
    artistRole: "Esittäjä",
    soundArchive: "Ääniarkisto",
    searchAndCurate: "Haku ja Kuratointi",

    playMaster: "Toista Master",
    pauseMaster: "Keskeytä",
    openAlbum: "Avaa albumi",
    backToCatalog: "Takaisin Flow / Luetteloon",
    album: "Albumi",

    colNumber: "#",
    colTitle: "Kappale",
    colAlbum: "Albumi",
    colQuality: "Laatu",
    colDuration: "Kesto",

    masterVolume: "Pää-äänenvoimakkuus",
    mute: "Mykistä",
    unmute: "Poista mykistys",
    addToQueue: "Lisää jonoon",
    queue: "Jono",
    favorites: "Suosikit",
    clearQueue: "Tyhjennä jono",
    focusMode: "muzec.live",
    emptyQueue: "Jono on tyhjä",
  },
};

export const getTranslation = (lang: Language): Translations => {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
};
