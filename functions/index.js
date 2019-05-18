
const functions = require('firebase-functions');

const {
  dialogflow, BasicCard, Suggestions, Image, SimpleResponse
} = require("actions-on-google");


// Instantiate the Dialogflow client.
const app = dialogflow({ debug: true });


// Handlers go here..
app.intent("Hello World",  conv => {
  conv.ask(`<speak>Hello world <audio src="https://speech-server-ruhacks-2019.appspot.com/api/sound/ru-RU/blyat"></audio></speak>`)
});

app.intent("practice_select", (conv, {'language': lang}) => {
  conv.data.lang = langs[lang];
  conv.data.language = lang;
  conv.ask(`Sure, let's practice ${lang}. \n`);
  conv.ask(`What level would you like to practice`);
  conv.ask(new Suggestions(["Beginner", "Elementary", "Intermediate", "Upper Intermediate", "Advanced", "Proficient"]));

});

app.intent("level_select", (conv, {'difficulty': lev}) => {
  lev--;
  conv.data.lev = lev;
  conv.ask(`Alright, we'll practice ${levels[lev]} ${conv.data.language}.\n`);
});


app.intent("play", (conv) => {
  const score = conv.data.right;
  conv.ask("Well done!");
  conv.ask(new BasicCard({
    text: `You could understand ${conv.data.right}/${conv.data.total} words in ${conv.data.language} at ${levels[conv.data.lev]}
    Why not try ${levels[++conv.data.lev]}
    `, //
    subtitle: 'you scored perfect',
    title: 'Well done!',
    image: new Image({
      url: 'https://upload.wikimedia.org/wikipedia/en/b/ba/Flag_of_Germany.svg',
      alt: 'Image alternate text',
    }),
    display: 'CROPPED',
  }));
});

const langs =  {
  "Afar": "aa",
  "Abkhazian": "ab",
  "Avestan": "ae",
  "Afrikaans": "af",
  "Akan": "ak",
  "Amharic": "am",
  "Aragonese": "an",
  "Arabic": "ar",
  "Assamese": "as",
  "Avaric": "av",
  "Aymara": "ay",
  "Azerbaijani": "az",
  "Bashkir": "ba",
  "Belarusian": "be",
  "Bulgarian": "bg",
  "Bihari languages": "bh",
  "Bislama": "bi",
  "Bambara": "bm",
  "Bengali": "bn",
  "Tibetan": "bo",
  "Breton": "br",
  "Bosnian": "bs",
  "Catalan; Valencian": "ca",
  "Chechen": "ce",
  "Chamorro": "ch",
  "Corsican": "co",
  "Cree": "cr",
  "Czech": "cs",
  "Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic": "cu",
  "Chuvash": "cv",
  "Welsh": "cy",
  "Danish": "da",
  "German": "de",
  "Divehi; Dhivehi; Maldivian": "dv",
  "Dzongkha": "dz",
  "Ewe": "ee",
  "Greek, Modern (1453-)": "el",
  "English": "en",
  "Esperanto": "eo",
  "Spanish; Castilian": "es",
  "Estonian": "et",
  "Basque": "eu",
  "Persian": "fa",
  "Fulah": "ff",
  "Finnish": "fi",
  "Fijian": "fj",
  "Faroese": "fo",
  "French": "fr",
  "Western Frisian": "fy",
  "Irish": "ga",
  "Gaelic; Scottish Gaelic": "gd",
  "Galician": "gl",
  "Guarani": "gn",
  "Gujarati": "gu",
  "Manx": "gv",
  "Hausa": "ha",
  "Hebrew": "he",
  "Hindi": "hi",
  "Hiri Motu": "ho",
  "Croatian": "hr",
  "Haitian; Haitian Creole": "ht",
  "Hungarian": "hu",
  "Armenian": "hy",
  "Herero": "hz",
  "Interlingua (International Auxiliary Language Association)": "ia",
  "Indonesian": "id",
  "Interlingue; Occidental": "ie",
  "Igbo": "ig",
  "Sichuan Yi; Nuosu": "ii",
  "Inupiaq": "ik",
  "Ido": "io",
  "Icelandic": "is",
  "Italian": "it",
  "Inuktitut": "iu",
  "Japanese": "ja",
  "Javanese": "jv",
  "Georgian": "ka",
  "Kongo": "kg",
  "Kikuyu; Gikuyu": "ki",
  "Kuanyama; Kwanyama": "kj",
  "Kazakh": "kk",
  "Kalaallisut; Greenlandic": "kl",
  "Central Khmer": "km",
  "Kannada": "kn",
  "Korean": "ko",
  "Kanuri": "kr",
  "Kashmiri": "ks",
  "Kurdish": "ku",
  "Komi": "kv",
  "Cornish": "kw",
  "Kirghiz; Kyrgyz": "ky",
  "Latin": "la",
  "Luxembourgish; Letzeburgesch": "lb",
  "Ganda": "lg",
  "Limburgan; Limburger; Limburgish": "li",
  "Lingala": "ln",
  "Lao": "lo",
  "Lithuanian": "lt",
  "Luba-Katanga": "lu",
  "Latvian": "lv",
  "Malagasy": "mg",
  "Marshallese": "mh",
  "Maori": "mi",
  "Macedonian": "mk",
  "Malayalam": "ml",
  "Mongolian": "mn",
  "Marathi": "mr",
  "Malay": "ms",
  "Maltese": "mt",
  "Burmese": "my",
  "Nauru": "na",
  "BokmÃ¥l, Norwegian; Norwegian BokmÃ¥l": "nb",
  "Ndebele, North; North Ndebele": "nd",
  "Nepali": "ne",
  "Ndonga": "ng",
  "Dutch; Flemish": "nl",
  "Norwegian Nynorsk; Nynorsk, Norwegian": "nn",
  "Norwegian": "no",
  "Ndebele, South; South Ndebele": "nr",
  "Navajo; Navaho": "nv",
  "Chichewa; Chewa; Nyanja": "ny",
  "Occitan (post 1500); ProvenÃ§al": "oc",
  "Ojibwa": "oj",
  "Oromo": "om",
  "Oriya": "or",
  "Ossetian; Ossetic": "os",
  "Panjabi; Punjabi": "pa",
  "Pali": "pi",
  "Polish": "pl",
  "Pushto; Pashto": "ps",
  "Portuguese": "pt",
  "Quechua": "qu",
  "Romansh": "rm",
  "Rundi": "rn",
  "Romanian; Moldavian; Moldovan": "ro",
  "Russian": "ru",
  "Kinyarwanda": "rw",
  "Sanskrit": "sa",
  "Sardinian": "sc",
  "Sindhi": "sd",
  "Northern Sami": "se",
  "Sango": "sg",
  "Sinhala; Sinhalese": "si",
  "Slovak": "sk",
  "Slovenian": "sl",
  "Samoan": "sm",
  "Shona": "sn",
  "Somali": "so",
  "Albanian": "sq",
  "Serbian": "sr",
  "Swati": "ss",
  "Sotho, Southern": "st",
  "Sundanese": "su",
  "Swedish": "sv",
  "Swahili": "sw",
  "Tamil": "ta",
  "Telugu": "te",
  "Tajik": "tg",
  "Thai": "th",
  "Tigrinya": "ti",
  "Turkmen": "tk",
  "Tagalog": "tl",
  "Tswana": "tn",
  "Tonga": "to",
  "Turkish": "tr",
  "Tsonga": "ts",
  "Tatar": "tt",
  "Twi": "tw",
  "Tahitian": "ty",
  "Uighur; Uyghur": "ug",
  "Ukrainian": "uk",
  "Urdu": "ur",
  "Uzbek": "uz",
  "Venda": "ve",
  "Vietnamese": "vi",
  "VolapÃ¼k": "vo",
  "Walloon": "wa",
  "Wolof": "wo",
  "Xhosa": "xh",
  "Yiddish": "yi",
  "Yoruba": "yo",
  "Zhuang; Chuang": "za",
  "Chinese": "zh",
  "Zulu": "zu"
}
const levels = ["A1, Beginner", "A2, Elementary", "B1, Intermediate", "B2, Upper Intermediate", "C1, Advanced", "C2, Proficient"];


exports.test = functions.https.onRequest(app);