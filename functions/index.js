const functions = require('firebase-functions');
const words = require('./words/random.js');
const fetch = require('node-fetch');

const {
    dialogflow, BasicCard, Suggestions, Image, SimpleResponse, List
} = require("actions-on-google");


// Instantiate the Dialogflow client.
const app = dialogflow({debug: true});


// Handlers go here..
app.intent("Hello World", conv => {
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
    conv.data.total = 0;
    conv.ask(`Alright, we'll practice ${levels[lev]} ${conv.data.language}.\n
          Are you ready to start training?`);
});

app.intent("level yes", async (conv) => {
    conv.data.right = 0;
    const pair = await getRandomWord(conv.data.lev, conv.data.lang);
    const url = getURL(conv.data.lang, pair.word, conv.data.language);
    conv.data.lastWord = pair.word;

    conv.ask(new SimpleResponse({
        text: `What does ${pair.trans} mean`,
        speech: `<speak>What does <audio src="${url}"></audio>mean?</speak>`,
    }));
    conv.data.total++;
});

app.intent("level no", (conv) => {
    conv.close(`Oh, ok. See you later then!`);
});


app.intent("ask word", async (conv, {"any": guess}) => {

    if ((guess).toLowerCase() === conv.data.lastWord) {
        conv.data.right++;

        conv.ask('That\'s correct!\n');
    } else {

        conv.ask(`Sorry, you said ${guess}, but the correct answer is ${conv.data.lastWord}.\n`);
    }

    if (conv.data.total < 3) {
        const pair = await getRandomWord(conv.data.lev, conv.data.lang);
        const url = getURL(conv.data.lang, pair.word, conv.data.language);
        conv.data.lastWord = pair.word;
        conv.ask(new SimpleResponse({
            text: `What does ${pair.trans} mean?`,
            speech: `<speak>Now, what does <audio src="${url}"></audio>mean?</speak>`,
        }));

        conv.data.total++;
    } else if (conv.data.total === 3) {
        const resp = generateBlurb(conv.data.right, conv.data.total, conv.data.lev, conv.data.language, conv.data.lang);

        let languages;
        try {
            languages = JSON.parse(conv.user.storage.languages);
        }catch (e) {
            languages = []
        }

        let langData;
        try {
            langData = JSON.parse(conv.user.storage.langData);
        }catch (e) {
            langData = {}
        }


        if(!languages.includes(conv.data.language)) languages.push(conv.data.language);
        if(langData === undefined) langData = {};
        if(resp.passed && (langData[conv.data.language] < conv.data.lev ||
            langData[conv.data.language] === undefined
        )){
            langData[conv.data.language] = conv.data.lev;
        }

        conv.user.storage.languages = JSON.stringify(languages);
        conv.user.storage.langData = JSON.stringify(langData);

        conv.ask(resp.subtitle);
        conv.close(new BasicCard({
            text: resp.text,
            subtitle: resp.subtitle,
            title: resp.title,
            image: new Image({
                url: resp.url,
                alt: 'Image alternate text',
            }),
            display: 'CROPPED',
        }));
    }
});

function getURL(lang, word, language){
    let url;
    if(wavenet[language] !== undefined) {
        url = `https://speech-server-ruhacks-2019.appspot.com/api/sound/trans/en-US/${lang}/${word}/${wavenet[language]}`;
    } else{
        url = `https://speech-server-ruhacks-2019.appspot.com/api/sound/trans/en-US/${lang}/${word}`;
    }
    console.log(wavenet[language]);
    console.log(url);
    return url;
}


async function getRandomWord(level, lang) {
    const word = words(level);
    const transRequest = await fetch(`https://speech-server-ruhacks-2019.appspot.com/api/trans/en-US/${lang}/${word}`);
    const trans = await transRequest.json();
    const transText = trans.TranslatedText;

    return {"word": word, "trans": transText};
}

app.intent("stats", (conv) => {
    let languages;
    try {
        languages = JSON.parse(conv.user.storage.languages);
    }catch (e) {
        languages = []
    }

    let langData;
    try {
        langData = JSON.parse(conv.user.storage.langData);
    }catch (e) {
        langData = {}
    }

    if(languages.length < 2){
        conv.ask("Practice more languages to get stats!");
        return
    }

    const resp = generateLanguages(languages,
      langData);
    conv.ask('Here are your stats');

    conv.ask(new List({
          title: 'Your Language Statistics',
          items: resp,
      }
    ));
});


function generateLanguages(languages, langData) {
    const items = {};

    languages.forEach(language => {
        items[language] = {
            title: language,
            description: levels[langData[language]],
            image: new Image({
                url: getFlag(langs[language]),
                alt: 'Image alternate text',
            }),
        }
    });

    return items;
}

function getFlag(lang) {
    let url = "http://www.printableflags.net/wp-content/uploads/2017/04/flag-globe-kcmkrp8xi-GhSZQu.jpg";

    switch (lang) {
        case "en":
            url = "https://i.redd.it/68cdrlhal0hz.png";
            break;
        case "de":
            url = "https://i.imgur.com/l66r6qD.png";
            break;
        case "ru":
            url = "https://i.imgur.com/o17VdrS.png";
            break;
        case "ko":
            url = "https://i.imgur.com/9XXSOLm.png";
            break;
        case "jp":
            url = "https://i.imgur.com/S9FGjLY.png";
            break;
        case "cn":
            url = "https://i.imgur.com/lRRyqhP.png";
            break;
        case "hi":
            url = "https://i.imgur.com/2lkA5Vf.png";
            break;
        case "fr":
            url = "https://i.imgur.com/kZS5Vur.png";
            break;
    }
    return url;
}

function generateBlurb(score, total, level, language, lang) {
    const response = {};
    const mark = score / total;
    response.passed = false;

    response.text = `You could understand ${score}/${total} words in ${language} at ${levels[level]}.`;


    if (mark === 1) {
        response.title = `Flawless!`;
        response.subtitle = `You got a perfect score, congratulations!`;
        response.text = `You could understand ${score}/${total} words in ${language} at ${levels[level]}.`;
        response.passed = true;

        if (level < 5) response.text += ` You have mastered ${language}: ${levels[level]}! You should give ${levels[++level]} a shot!`
        else response.text += `You have achieved highest level in ${language}`

    } else if (mark > 0.85) {
        response.title = `Excellent!`;
        response.subtitle = `You got near perfect! Keep up the great work!`;

        if (level < 5) response.text += ` Perhaps also try ${levels[++level]}`

    } else if (mark > 0.7) {
        response.title = `Pretty good!`;
        response.subtitle = `You got most of the words, but you need a bit more practice.`;
    } else if (mark > 0.35) {
        response.title = `On track!`;
        response.subtitle = `You are getting familiar with the vocabulary, but you need to practice more.`;
    } else {
        response.title = `Long way ahead`;
        response.subtitle = `You missed most words, but practice makes perfect.`;

        if (level > 1) response.text += ` Perhaps try ${levels[--level]}`
    }


    response.url = getFlag(lang);

    return response;
}

const wavenet = {
    "German": "de-DE-Wavenet-A",
    "French": "fr-FR-Wavenet-A",
    "Portuguese": "pt-PT-Wavenet-A",
    "Russian": "ru-RU-Wavenet-A",
    "Korean": "ko-KR-Wavenet-B",
    "English": "en-US-Wavenet-A",
    "Japanese": "ja-JP-Wavenet-A",
}

const langs = {
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