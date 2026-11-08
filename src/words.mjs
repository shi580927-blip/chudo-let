// ЧУДОЛЁТ — редакционно отобранный тематический словарь для буквенных заданий.
// word: правильная форма в именительном падеже; icon: узнаваемый предмет;
// syllables: заранее выверенная разбивка для задания «Слоговый конструктор».
const BASE_WORD_BANK=Object.freeze({
  "clouds": [
    {
      "word": "ПИСЬМО",
      "icon": "✉️",
      "syllables": [
        "ПИСЬ",
        "МО"
      ]
    },
    {
      "word": "ПОСЫЛКА",
      "icon": "📦",
      "syllables": [
        "ПО",
        "СЫЛ",
        "КА"
      ]
    },
    {
      "word": "РАДУГА",
      "icon": "🌈",
      "syllables": [
        "РА",
        "ДУ",
        "ГА"
      ]
    },
    {
      "word": "ЗВЕЗДА",
      "icon": "⭐",
      "syllables": [
        "ЗВЕЗ",
        "ДА"
      ]
    },
    {
      "word": "ОБЛАКО",
      "icon": "☁️",
      "syllables": [
        "ОБ",
        "ЛА",
        "КО"
      ]
    },
    {
      "word": "СОЛНЦЕ",
      "icon": "☀️",
      "syllables": [
        "СОЛН",
        "ЦЕ"
      ]
    },
    {
      "word": "МОЛНИЯ",
      "icon": "⚡",
      "syllables": [
        "МОЛ",
        "НИ",
        "Я"
      ]
    },
    {
      "word": "КОМПАС",
      "icon": "🧭",
      "syllables": [
        "КОМ",
        "ПАС"
      ]
    },
    {
      "word": "ЗВОНОК",
      "icon": "🔔",
      "syllables": [
        "ЗВО",
        "НОК"
      ]
    },
    {
      "word": "КЛЮЧ",
      "icon": "🗝️",
      "syllables": [
        "КЛЮЧ"
      ]
    },
    {
      "word": "ЛУНА",
      "icon": "🌙",
      "syllables": [
        "ЛУ",
        "НА"
      ]
    },
    {
      "word": "ЗМЕЙ",
      "icon": "🪁",
      "syllables": [
        "ЗМЕЙ"
      ]
    }
  ],
  "forest": [
    {
      "word": "ЛИСА",
      "icon": "🦊",
      "syllables": [
        "ЛИ",
        "СА"
      ]
    },
    {
      "word": "ГРИБ",
      "icon": "🍄",
      "syllables": [
        "ГРИБ"
      ]
    },
    {
      "word": "БЕЛКА",
      "icon": "🐿️",
      "syllables": [
        "БЕЛ",
        "КА"
      ]
    },
    {
      "word": "МЕДВЕДЬ",
      "icon": "🐻",
      "syllables": [
        "МЕД",
        "ВЕДЬ"
      ]
    },
    {
      "word": "СОВА",
      "icon": "🦉",
      "syllables": [
        "СО",
        "ВА"
      ]
    },
    {
      "word": "БАБОЧКА",
      "icon": "🦋",
      "syllables": [
        "БА",
        "БОЧ",
        "КА"
      ]
    },
    {
      "word": "ЗАЯЦ",
      "icon": "🐇",
      "syllables": [
        "ЗА",
        "ЯЦ"
      ]
    },
    {
      "word": "ЯБЛОКО",
      "icon": "🍎",
      "syllables": [
        "ЯБ",
        "ЛО",
        "КО"
      ]
    },
    {
      "word": "ГРУША",
      "icon": "🍐",
      "syllables": [
        "ГРУ",
        "ША"
      ]
    },
    {
      "word": "МОРКОВЬ",
      "icon": "🥕",
      "syllables": [
        "МОР",
        "КОВЬ"
      ]
    },
    {
      "word": "ЯГОДА",
      "icon": "🍓",
      "syllables": [
        "Я",
        "ГО",
        "ДА"
      ]
    }
  ],
  "ocean": [
    {
      "word": "РЫБА",
      "icon": "🐟",
      "syllables": [
        "РЫ",
        "БА"
      ]
    },
    {
      "word": "АКУЛА",
      "icon": "🦈",
      "syllables": [
        "А",
        "КУ",
        "ЛА"
      ]
    },
    {
      "word": "КРАБ",
      "icon": "🦀",
      "syllables": [
        "КРАБ"
      ]
    },
    {
      "word": "ОСЬМИНОГ",
      "icon": "🐙",
      "syllables": [
        "ОСЬ",
        "МИ",
        "НОГ"
      ]
    },
    {
      "word": "КРЕВЕТКА",
      "icon": "🦐",
      "syllables": [
        "КРЕ",
        "ВЕТ",
        "КА"
      ]
    },
    {
      "word": "ЯКОРЬ",
      "icon": "⚓",
      "syllables": [
        "Я",
        "КОРЬ"
      ]
    },
    {
      "word": "КОМПАС",
      "icon": "🧭",
      "syllables": [
        "КОМ",
        "ПАС"
      ]
    },
    {
      "word": "ОСТРОВ",
      "icon": "🏝️",
      "syllables": [
        "О",
        "СТРОВ"
      ]
    },
    {
      "word": "РАКУШКА",
      "icon": "🐚",
      "syllables": [
        "РА",
        "КУШ",
        "КА"
      ]
    },
    {
      "word": "КОРАЛЛ",
      "icon": "🪸",
      "syllables": [
        "КО",
        "РАЛЛ"
      ]
    },
    {
      "word": "АЛМАЗ",
      "icon": "💎",
      "syllables": [
        "АЛ",
        "МАЗ"
      ]
    }
  ],
  "space": [
    {
      "word": "РАКЕТА",
      "icon": "🚀",
      "syllables": [
        "РА",
        "КЕ",
        "ТА"
      ]
    },
    {
      "word": "ЛУНА",
      "icon": "🌙",
      "syllables": [
        "ЛУ",
        "НА"
      ]
    },
    {
      "word": "ЗВЕЗДА",
      "icon": "⭐",
      "syllables": [
        "ЗВЕЗ",
        "ДА"
      ]
    },
    {
      "word": "СОЛНЦЕ",
      "icon": "☀️",
      "syllables": [
        "СОЛН",
        "ЦЕ"
      ]
    },
    {
      "word": "ЗЕМЛЯ",
      "icon": "🌎",
      "syllables": [
        "ЗЕМ",
        "ЛЯ"
      ]
    },
    {
      "word": "КОМЕТА",
      "icon": "☄️",
      "syllables": [
        "КО",
        "МЕ",
        "ТА"
      ]
    },
    {
      "word": "СПУТНИК",
      "icon": "🛰️",
      "syllables": [
        "СПУТ",
        "НИК"
      ]
    },
    {
      "word": "ТЕЛЕСКОП",
      "icon": "🔭",
      "syllables": [
        "ТЕ",
        "ЛЕ",
        "СКОП"
      ]
    },
    {
      "word": "ПЛАНЕТА",
      "icon": "🪐",
      "syllables": [
        "ПЛА",
        "НЕ",
        "ТА"
      ]
    },
    {
      "word": "ТАРЕЛКА",
      "icon": "🛸",
      "syllables": [
        "ТА",
        "РЕЛ",
        "КА"
      ]
    }
  ],
  "pirate": [
    {
      "word": "ПИРАТ",
      "icon": "🏴‍☠️",
      "syllables": [
        "ПИ",
        "РАТ"
      ]
    },
    {
      "word": "ПОПУГАЙ",
      "icon": "🦜",
      "syllables": [
        "ПО",
        "ПУ",
        "ГАЙ"
      ]
    },
    {
      "word": "ОБЕЗЬЯНА",
      "icon": "🐒",
      "syllables": [
        "О",
        "БЕЗЬ",
        "Я",
        "НА"
      ]
    },
    {
      "word": "КРАБ",
      "icon": "🦀",
      "syllables": [
        "КРАБ"
      ]
    },
    {
      "word": "АКУЛА",
      "icon": "🦈",
      "syllables": [
        "А",
        "КУ",
        "ЛА"
      ]
    },
    {
      "word": "ЯКОРЬ",
      "icon": "⚓",
      "syllables": [
        "Я",
        "КОРЬ"
      ]
    },
    {
      "word": "КАРТА",
      "icon": "🗺️",
      "syllables": [
        "КАР",
        "ТА"
      ]
    },
    {
      "word": "КЛЮЧ",
      "icon": "🗝️",
      "syllables": [
        "КЛЮЧ"
      ]
    },
    {
      "word": "КОМПАС",
      "icon": "🧭",
      "syllables": [
        "КОМ",
        "ПАС"
      ]
    },
    {
      "word": "ЧЕРЕПАХА",
      "icon": "🐢",
      "syllables": [
        "ЧЕ",
        "РЕ",
        "ПА",
        "ХА"
      ]
    },
    {
      "word": "ОСЬМИНОГ",
      "icon": "🐙",
      "syllables": [
        "ОСЬ",
        "МИ",
        "НОГ"
      ]
    },
    {
      "word": "МОНЕТА",
      "icon": "🪙",
      "syllables": [
        "МО",
        "НЕ",
        "ТА"
      ]
    }
  ],
  "dino": [
    {
      "word": "ДИНОЗАВР",
      "icon": "🦕",
      "syllables": [
        "ДИ",
        "НО",
        "ЗАВР"
      ]
    },
    {
      "word": "ЯЩЕРИЦА",
      "icon": "🦎",
      "syllables": [
        "Я",
        "ЩЕ",
        "РИ",
        "ЦА"
      ]
    },
    {
      "word": "ЯЙЦО",
      "icon": "🥚",
      "syllables": [
        "ЯЙ",
        "ЦО"
      ]
    },
    {
      "word": "ЧЕРЕПАХА",
      "icon": "🐢",
      "syllables": [
        "ЧЕ",
        "РЕ",
        "ПА",
        "ХА"
      ]
    },
    {
      "word": "КРОКОДИЛ",
      "icon": "🐊",
      "syllables": [
        "КРО",
        "КО",
        "ДИЛ"
      ]
    },
    {
      "word": "ПАЛЬМА",
      "icon": "🌴",
      "syllables": [
        "ПАЛЬ",
        "МА"
      ]
    },
    {
      "word": "КАКТУС",
      "icon": "🌵",
      "syllables": [
        "КАК",
        "ТУС"
      ]
    },
    {
      "word": "ВУЛКАН",
      "icon": "🌋",
      "syllables": [
        "ВУЛ",
        "КАН"
      ]
    },
    {
      "word": "КАМЕНЬ",
      "icon": "🪨",
      "syllables": [
        "КА",
        "МЕНЬ"
      ]
    },
    {
      "word": "ЛИСТ",
      "icon": "🌿",
      "syllables": [
        "ЛИСТ"
      ]
    }
  ]
});
// Тематические слова и однозначные слоговые разбиения для комплектов 20/20.
const WORD_EXTRAS={"clouds":[{"word":"ПОЧТА","icon":"📮","syllables":["ПОЧ","ТА"]},{"word":"ШАРИК","icon":"🎈","syllables":["ША","РИК"]},{"word":"ВЕТЕР","icon":"💨","syllables":["ВЕ","ТЕР"]},{"word":"КАПЛЯ","icon":"💧","syllables":["КАП","ЛЯ"]},{"word":"ТУЧКА","icon":"🌥️","syllables":["ТУЧ","КА"]},{"word":"МЕТЕЛЬ","icon":"🌨️","syllables":["МЕ","ТЕЛЬ"]},{"word":"ЗОНТИК","icon":"☂️","syllables":["ЗОН","ТИК"]},{"word":"ПТИЦА","icon":"🐦","syllables":["ПТИ","ЦА"]},{"word":"ПЕРО","icon":"🪶","syllables":["ПЕ","РО"]},{"word":"КРЫЛО","icon":"🪽","syllables":["КРЫ","ЛО"]},{"word":"ЛАМПА","icon":"💡","syllables":["ЛАМ","ПА"]},{"word":"БИРКА","icon":"🏷️","syllables":["БИР","КА"]},{"word":"КНИГА","icon":"📖","syllables":["КНИ","ГА"]},{"word":"СУМКА","icon":"👜","syllables":["СУМ","КА"]},{"word":"БАНТИК","icon":"🎀","syllables":["БАН","ТИК"]},{"word":"СВЕЧА","icon":"🕯️","syllables":["СВЕ","ЧА"]}],"forest":[{"word":"ЁЖИК","icon":"🦔","syllables":["Ё","ЖИК"]},{"word":"ПЧЕЛА","icon":"🐝","syllables":["ПЧЕ","ЛА"]},{"word":"ЖУЧОК","icon":"🪲","syllables":["ЖУ","ЧОК"]},{"word":"ТРАВА","icon":"🌿","syllables":["ТРА","ВА"]},{"word":"КЛЕВЕР","icon":"☘️","syllables":["КЛЕ","ВЕР"]},{"word":"ОРЕХ","icon":"🌰","syllables":["О","РЕХ"]},{"word":"СОСНА","icon":"🌲","syllables":["СО","СНА"]},{"word":"РОЗА","icon":"🌹","syllables":["РО","ЗА"]},{"word":"ТЮЛЬПАН","icon":"🌷","syllables":["ТЮЛЬ","ПАН"]},{"word":"ТЫКВА","icon":"🎃","syllables":["ТЫК","ВА"]},{"word":"ЖАБА","icon":"🐸","syllables":["ЖА","БА"]},{"word":"УЛИТКА","icon":"🐌","syllables":["У","ЛИТ","КА"]},{"word":"КУСТИК","icon":"🌳","syllables":["КУС","ТИК"]},{"word":"МЫШКА","icon":"🐭","syllables":["МЫШ","КА"]},{"word":"ОЛЕНЬ","icon":"🦌","syllables":["О","ЛЕНЬ"]},{"word":"РОСТОК","icon":"🌱","syllables":["РОС","ТОК"]},{"word":"ПОЛЕНО","icon":"🪵","syllables":["ПО","ЛЕ","НО"]}],"ocean":[{"word":"ВОЛНА","icon":"🌊","syllables":["ВОЛ","НА"]},{"word":"ЛОДКА","icon":"🚣","syllables":["ЛОД","КА"]},{"word":"ЧАЙКА","icon":"🐦","syllables":["ЧАЙ","КА"]},{"word":"МЕДУЗА","icon":"🪼","syllables":["МЕ","ДУ","ЗА"]},{"word":"МАСКА","icon":"🥽","syllables":["МАС","КА"]},{"word":"ПАРУС","icon":"⛵","syllables":["ПА","РУС"]},{"word":"МОРЯК","icon":"🧑‍✈️","syllables":["МО","РЯК"]},{"word":"ПЕСОК","icon":"🏖️","syllables":["ПЕ","СОК"]},{"word":"КАМЕНЬ","icon":"🪨","syllables":["КА","МЕНЬ"]},{"word":"КАРТА","icon":"🗺️","syllables":["КАР","ТА"]},{"word":"СКАЛА","icon":"🗻","syllables":["СКА","ЛА"]},{"word":"РЫБКА","icon":"🐠","syllables":["РЫБ","КА"]},{"word":"УСТРИЦА","icon":"🦪","syllables":["УСТ","РИ","ЦА"]},{"word":"СЕТКА","icon":"🥅","syllables":["СЕТ","КА"]},{"word":"ДЕЛЬФИН","icon":"🐬","syllables":["ДЕЛЬ","ФИН"]},{"word":"ПИНГВИН","icon":"🐧","syllables":["ПИН","ГВИН"]},{"word":"ТЮЛЕНЬ","icon":"🦭","syllables":["ТЮ","ЛЕНЬ"]},{"word":"КОРАБЛЬ","icon":"🚢","syllables":["КО","РАБЛЬ"]}],"space":[{"word":"КОСМОС","icon":"🌌","syllables":["КОС","МОС"]},{"word":"РОБОТ","icon":"🤖","syllables":["РО","БОТ"]},{"word":"РАДИО","icon":"📻","syllables":["РА","ДИ","О"]},{"word":"СИГНАЛ","icon":"📶","syllables":["СИГ","НАЛ"]},{"word":"ВЫШКА","icon":"📡","syllables":["ВЫШ","КА"]},{"word":"ЛУЧИК","icon":"✨","syllables":["ЛУ","ЧИК"]},{"word":"МЕТЕОР","icon":"🌠","syllables":["МЕ","ТЕ","ОР"]},{"word":"ТУМАН","icon":"🌫️","syllables":["ТУ","МАН"]},{"word":"КРАТЕР","icon":"🕳️","syllables":["КРА","ТЕР"]},{"word":"ЛИНЗА","icon":"🔎","syllables":["ЛИН","ЗА"]},{"word":"АТЛАС","icon":"📖","syllables":["АТ","ЛАС"]},{"word":"КАРТА","icon":"🗺️","syllables":["КАР","ТА"]},{"word":"КНОПКА","icon":"🔘","syllables":["КНОП","КА"]},{"word":"ЭКРАН","icon":"🖥️","syllables":["ЭК","РАН"]},{"word":"РАНЕЦ","icon":"🎒","syllables":["РА","НЕЦ"]},{"word":"ИСКРА","icon":"🔥","syllables":["ИС","КРА"]}],"pirate":[{"word":"ЛОДКА","icon":"🚣","syllables":["ЛОД","КА"]},{"word":"БОЧКА","icon":"🛢️","syllables":["БОЧ","КА"]},{"word":"ОСТРОВ","icon":"🏝️","syllables":["О","СТРОВ"]},{"word":"ШЛЯПА","icon":"🎩","syllables":["ШЛЯ","ПА"]},{"word":"ПЕЩЕРА","icon":"🕳️","syllables":["ПЕ","ЩЕ","РА"]},{"word":"РЫБА","icon":"🐟","syllables":["РЫ","БА"]},{"word":"МОРЯК","icon":"🧑‍✈️","syllables":["МО","РЯК"]},{"word":"ПАРУС","icon":"⛵","syllables":["ПА","РУС"]},{"word":"САПОГ","icon":"🥾","syllables":["СА","ПОГ"]},{"word":"БЕРЕГ","icon":"🏖️","syllables":["БЕ","РЕГ"]},{"word":"ЧАЙКА","icon":"🐦","syllables":["ЧАЙ","КА"]},{"word":"СЕТКА","icon":"🥅","syllables":["СЕТ","КА"]},{"word":"ПАЛЬМА","icon":"🌴","syllables":["ПАЛЬ","МА"]},{"word":"ВОЛНА","icon":"🌊","syllables":["ВОЛ","НА"]},{"word":"КОСТЁР","icon":"🔥","syllables":["КО","СТЁР"]},{"word":"РАКУШКА","icon":"🐚","syllables":["РА","КУШ","КА"]},{"word":"ФОНАРЬ","icon":"🏮","syllables":["ФО","НАРЬ"]}],"dino":[{"word":"ЛАПКА","icon":"🐾","syllables":["ЛАП","КА"]},{"word":"ДОЛИНА","icon":"🏞️","syllables":["ДО","ЛИ","НА"]},{"word":"ТРАВА","icon":"🌱","syllables":["ТРА","ВА"]},{"word":"ЯГОДА","icon":"🍓","syllables":["Я","ГО","ДА"]},{"word":"ГНЕЗДО","icon":"🪺","syllables":["ГНЕЗ","ДО"]},{"word":"ПТИЦА","icon":"🐦","syllables":["ПТИ","ЦА"]},{"word":"ЖУЧОК","icon":"🪲","syllables":["ЖУ","ЧОК"]},{"word":"СОЛНЦЕ","icon":"☀️","syllables":["СОЛН","ЦЕ"]},{"word":"ДОЖДИК","icon":"🌦️","syllables":["ДОЖ","ДИК"]},{"word":"ПЕСОК","icon":"🏖️","syllables":["ПЕ","СОК"]},{"word":"КОРЕНЬ","icon":"🪵","syllables":["КО","РЕНЬ"]},{"word":"КУСТИК","icon":"🌳","syllables":["КУС","ТИК"]},{"word":"СЛЕДЫ","icon":"👣","syllables":["СЛЕ","ДЫ"]},{"word":"ПЕЩЕРА","icon":"🕳️","syllables":["ПЕ","ЩЕ","РА"]},{"word":"КОСТИ","icon":"🦴","syllables":["КО","СТИ"]},{"word":"ЖАБА","icon":"🐸","syllables":["ЖА","БА"]},{"word":"ЗЕМЛЯ","icon":"🌎","syllables":["ЗЕМ","ЛЯ"]},{"word":"ЁЛОЧКА","icon":"🌲","syllables":["Ё","ЛОЧ","КА"]},{"word":"СКАЛА","icon":"🗻","syllables":["СКА","ЛА"]},{"word":"ОРЕХ","icon":"🌰","syllables":["О","РЕХ"]},{"word":"РОМАШКА","icon":"🌼","syllables":["РО","МАШ","КА"]}]};
export const WORD_BANK=Object.freeze(Object.fromEntries(Object.entries(BASE_WORD_BANK).map(([theme,items])=>[theme,Object.freeze([...items,...(WORD_EXTRAS[theme]??[])])])));
export function allowedWords(theme,minLength=4,maxLength=10){
 const pool=WORD_BANK[theme]??WORD_BANK.clouds;
 return pool.filter(item=>item.word.length>=minLength&&item.word.length<=maxLength);
}
