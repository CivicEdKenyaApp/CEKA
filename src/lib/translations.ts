import { Language } from "@/contexts/LanguageContext";

// Define translations for commonly used texts
export const translations: Record<string, Record<Language, string>> = {
  // General & App Intro
  "Empowering Citizens through": {
    en: "Empowering Citizens through",
    sw: "Kuwawezesha Wananchi kupitia",
    ksl: "Empowering Citizens through",
    br: "⠑⠍⠏⠕⠺⠑⠗⠊⠝⠛ ⠉⠊⠞⠊⠵⠑⠝⠎ ⠞⠓⠗⠕⠥⠛⠓"
  },
  "Civic Education": {
    en: "Civic Education",
    sw: "Elimu ya Uraia",
    ksl: "Civic Education",
    br: "⠉⠊⠧⠊⠉ ⠑⠙⠥⠉⠁⠞⠊⠕⠝"
  },
  "Access civic knowledge, track legislation, and participate in building a better Kenya.": {
    en: "Access civic knowledge, track legislation, and participate in building a better Kenya.",
    sw: "Pata maarifa ya uraia, fuatilia sheria, na shiriki katika kujenga Kenya bora.",
    ksl: "Access civic knowledge, track legislation, and participate in building a better Kenya.",
    br: "⠁⠉⠉⠑⠎⠎ ⠉⠊⠧⠊⠉ ⠅⠝⠕⠺⠇⠑⠙⠛⠑⠂ ⠞⠗⠁⠉⠅ ⠇⠑⠛⠊⠎⠇⠁⠞⠊⠕⠝⠂ ⠁⠝⠙ ⠏⠁⠗⠞⠊⠉⠊⠏⠁⠞⠑ ⠊⠝ ⠃⠥⠊⠇⠙⠊⠝⠛ ⠁ ⠃⠑⠞⠞⠑⠗ ⠅⠑⠝⠽⠁⠲"
  },
  "Welcome to CEKA": {
    en: "Welcome to CEKA",
    sw: "Karibu CEKA",
    ksl: "Welcome to CEKA",
    br: "⠺⠑⠇⠉⠕⠍⠑ ⠞⠕ ⠉⠑⠅⠁"
  },
  "Welcome to CEKA 🇰🇪": {
    en: "Welcome to CEKA 🇰🇪",
    sw: "Karibu CEKA 🇰🇪",
    ksl: "Welcome to CEKA 🇰🇪",
    br: "⠺⠑⠇⠉⠕⠍⠑ ⠞⠕ ⠉⠑⠅⠁ 🇰🇪"
  },
  "Join our community of active citizens": {
    en: "Join our community of active citizens",
    sw: "Jiunge na jumuiya yetu ya raia wanaoshiriki",
    ksl: "Join our community of active citizens",
    br: "⠚⠕⠊⠝ ⠕⠥⠗ ⠉⠕⠍⠍⠥⠝⠊⠞⠽ ⠕⠋ ⠁⠉⠞⠊⠧⠑ ⠉⠊⠞⠊⠵⠑⠝⠎"
  },

  // Kenyanized Discourse (2027 Engine)
  "Bunge Square": { en: "Bunge Square", sw: "Uwanja wa Bunge", ksl: "Bunge Square" },
  "Discussion on national issues": { en: "Discussion on national issues", sw: "Majadiliano ya kitaifa", ksl: "Discussion on national issues" },
  "Policy Watch 2024-2027": { en: "Policy Watch 2024-2027", sw: "Uangalizi wa Sera 2024-2027", ksl: "Policy Watch" },
  "Monitoring constitutional implementation": { en: "Monitoring constitutional implementation", sw: "Kufuatilia utekelezaji wa katiba", ksl: "Monitoring constitution" },
  "Mashinani Dialogue": { en: "Mashinani Dialogue", sw: "Mazungumzo ya Mashinani", ksl: "Mashinani Dialogue" },
  "County and devolved government watch": { en: "County and devolved government watch", sw: "Uangalizi wa serikali za kaunti", ksl: "County watch" },
  "Youth Pulse": { en: "Youth Pulse", sw: "Mapigo ya Vijana", ksl: "Youth Pulse" },
  "Involvement of young citizens": { en: "Involvement of young citizens", sw: "Ushiriki wa vijana", ksl: "Youth involvement" },

  // General UI Strings
  "Loading...": { en: "Loading...", sw: "Inapakia...", ksl: "Loading...", br: "⠇⠕⠁⠙⠊⠝⠛⠲⠲⠲" },
  "Search...": { en: "Search...", sw: "Tafuta...", ksl: "Search...", br: "⠎⠑⠁⠗⠉⠓⠲⠲⠲" },
  "Learn More": { en: "Learn More", sw: "Jifunze Zaidi", ksl: "Learn More", br: "⠇⠑⠁⠗⠝ ⠍⠕⠗⠑" },
  "View All": { en: "View All", sw: "Tazama Zote", ksl: "View All", br: "⠧⠊⠑⠺ ⠁⠇⠇" },
  "Download": { en: "Download", sw: "Pakua", ksl: "Download", br: "⠙⠕⠺⠝⠇⠕⠁⠙" },
  "Submit": { en: "Submit", sw: "Wasilisha", ksl: "Submit", br: "⠎⠥⠃⠍⠊⠞" },
  "Cancel": { en: "Cancel", sw: "Ghairi", ksl: "Cancel", br: "⠉⠁⠝⠉⠑⠇" },
  "Save": { en: "Save", sw: "Hifadhi", ksl: "Save", br: "⠎⠁⠧⠑" },
  "Delete": { en: "Delete", sw: "Futa", ksl: "Delete", br: "⠙⠑⠇⠑⠞⠑" },
  "Edit": { en: "Edit", sw: "Hariri", ksl: "Edit", br: "⠑⠙⠊⠞" },
  "Close": { en: "Close", sw: "Funga", ksl: "Close", br: "⠉⠇⠕⠎⠑" },
  "Back": { en: "Back", sw: "Rudi", ksl: "Back", br: "⠃⠁⠉⠅" },
  "Next": { en: "Next", sw: "Endelea", ksl: "Next", br: "⠝⠑⠭⠞" },
  "Success": { en: "Success", sw: "Imefaulu", ksl: "Success", br: "⠎⠥⠉⠉⠑⠎⠎" },
  "Error": { en: "Error", sw: "Hitilafu", ksl: "Error", br: "⠑⠗⠗⠕⠗" },

  // Navigation
  "Home": { en: "Home", sw: "Nyumbani", ksl: "Home", br: "⠓⠕⠍⠑" },
  "Resources": { en: "Resources", sw: "Rasilimali", ksl: "Resources", br: "⠗⠑⠎⠕⠥⠗⠉⠑⠎" },
  "Community": { en: "Community", sw: "Uwanja wa Jamii", ksl: "Community", br: "⠉⠕⠍⠍⠥⠝⠊⠞⠽" },
  "Notifications": { en: "Notifications", sw: "Arifa", ksl: "Notifications", br: "⠝⠕⠞⠊⠋⠊⠉⠁⠞⠊⠕⠝⠎" },
  "Profile": { en: "Profile", sw: "Wasifu", ksl: "Profile", br: "⠏⠗⠕⠋⠊⠇⠑" },
  "Blog": { en: "Blog", sw: "Msimamo", ksl: "Blog", br: "⠃⠇⠕⠛" },
  "Calendar": { en: "Calendar", sw: "Kalenda", ksl: "Calendar", br: "⠉⠁⠇⠑⠝⠙⠁⠗" },
  "Tools": { en: "Tools", sw: "Zana", ksl: "Tools", br: "⠞⠕⠕⠇⠎" },

  // Legislative Detail
  "Legislative Tracker": { en: "Legislative Tracker", sw: "Kifuatiliaji cha Sheria", ksl: "Legislative Tracker" },
  "Stay informed about bills and legislative changes in Kenya": {
    en: "Stay informed about bills and legislative changes in Kenya",
    sw: "Pata taarifa kuhusu miswada na mabadiliko ya kisheria nchini Kenya",
    ksl: "Stay informed about bills"
  },
  "Follow Bill": { en: "Follow Bill", sw: "Fuatilia Mswada", ksl: "Follow Bill" },
  "Following": { en: "Following", sw: "Unalifuata", ksl: "Following" },

  // Auth
  "Sign In": { en: "Sign In", sw: "Ingia", ksl: "Sign In", br: "⠎⠊⠛⠝ ⠊⠝" },
  "Sign Up": { en: "Sign Up", sw: "Jisajili", ksl: "Sign Up", br: "⠎⠊⠛⠝ ⠥⠏" },
  "Sign Out": { en: "Sign Out", sw: "Toka", ksl: "Sign Out", br: "⠎⠊⠛⠝ ⠕⠥⠥⠞" },

  // Misc 2027 Election Special
  "Election Integrity": { en: "Election Integrity", sw: "Uadilifu wa Uchaguzi", ksl: "Election Integrity" },
  "Voter Education": { en: "Voter Education", sw: "Elimu ya Mpiga Kura", ksl: "Voter Education" },
  "My Vote My Power": { en: "My Vote My Power", sw: "Kura Yangu Nguvu Yangu", ksl: "My Vote My Power" }
};

export type TranslationKey = keyof typeof translations;

export function translate(text: string, language: Language): string {
  if (translations[text] && translations[text][language]) {
    return translations[text][language];
  }
  // Simplified fallback logic for partial matches
  const key = Object.keys(translations).find(k => k.toLowerCase() === text.toLowerCase());
  if (key && translations[key][language]) {
    return translations[key][language];
  }
  return text;
}
