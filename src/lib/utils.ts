// Add the new languages to the translations
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Language } from '@/contexts/LanguageContext';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TranslationDictionary {
  [key: string]: {
    en: string;
    sw: string;
    ksl: string;
    br: string;
  };
}

const translations: TranslationDictionary = {
  "Home": {
    en: "Home",
    sw: "Nyumbani",
    ksl: "Home", // Would be replaced with actual KSL translation
    br: "⠓⠕⠍⠑", // Braille representation
  },
  "Search...": {
    en: "Search...",
    sw: "Tafuta...",
    ksl: "Search...", // Would be replaced with actual KSL translation
    br: "⠎⠑⠁⠗⠉⠓...", // Braille representation
  },
  "Legislative Tracker": {
    en: "Legislative Tracker",
    sw: "Mfumo wa Kufuatilia Sheria",
    ksl: "Legislative Tracker", // Would be replaced with actual KSL translation
    br: "⠇⠑⠛⠊⠎⠇⠁⠞⠊⠧⠑ ⠞⠗⠁⠉⠅⠑⠗", // Braille representation
  },
  "Resource Hub": {
    en: "Resource Hub",
    sw: "Kitovu cha Rasilimali",
    ksl: "Resource Hub", // Would be replaced with actual KSL translation
    br: "⠗⠑⠎⠕⠥⠗⠉⠑ ⠓⠥⠃", // Braille representation
  },
  "Community": {
    en: "Community",
    sw: "Jumuiya",
    ksl: "Community", // Would be replaced with actual KSL translation
    br: "⠉⠕⠍⠍⠥⠝⠊⠞⠽", // Braille representation
  },
  "Volunteer": {
    en: "Volunteer",
    sw: "Kujitolea",
    ksl: "Volunteer", // Would be replaced with actual KSL translation
    br: "⠧⠕⠇⠥⠝⠞⠑⠑⠗", // Braille representation
  },
  "More Options": {
    en: "More Options",
    sw: "Chaguo Zaidi",
    ksl: "More Options", // Would be replaced with actual KSL translation
    br: "⠍⠕⠗⠑ ⠕⠏⠞⠊⠕⠝⠎", // Braille representation
  },
  "Upload Resource": {
    en: "Upload Resource",
    sw: "Pakia Rasilimali",
    ksl: "Upload Resource", // Would be replaced with actual KSL translation
    br: "⠥⠏⠇⠕⠁⠙ ⠗⠑⠎⠕⠥⠗⠉⠑", // Braille representation
  },
  "Change Language": {
    en: "Change Language",
    sw: "Badilisha Lugha",
    ksl: "Change Language", // Would be replaced with actual KSL translation
    br: "⠉⠓⠁⠝⠛⠑ ⠇⠁⠝⠛⠥⠁⠛⠑", // Braille representation
  },
  "Toggle Theme": {
    en: "Toggle Theme",
    sw: "Badilisha Mandhari",
    ksl: "Toggle Theme", // Would be replaced with actual KSL translation
    br: "⠞⠕⠛⠛⠇⠑ ⠞⠓⠑⠍⠑", // Braille representation
  },
  "Settings": {
    en: "Settings",
    sw: "Mipangilio",
    ksl: "Settings", // Would be replaced with actual KSL translation
    br: "⠎⠑⠞⠞⠊⠝⠛⠎", // Braille representation
  },
  "Theme": {
    en: "Theme",
    sw: "Mandhari",
    ksl: "Theme", // Would be replaced with actual KSL translation
    br: "⠞⠓⠑⠍⠑", // Braille representation
  },
  "Languages": {
    en: "Languages",
    sw: "Lugha",
    ksl: "Languages", // Would be replaced with actual KSL translation
    br: "⠇⠁⠝⠛⠥⠁⠛⠑⠎", // Braille representation
  },
  "English": {
    en: "English",
    sw: "Kiingereza",
    ksl: "English", // Would be replaced with actual KSL translation
    br: "⠑⠝⠛⠇⠊⠎⠓", // Braille representation
  },
  "Swahili": {
    en: "Swahili",
    sw: "Kiswahili",
    ksl: "Swahili", // Would be replaced with actual KSL translation
    br: "⠎⠺⠁⠓⠊⠇⠊", // Braille representation
  },
  "Kenya Sign Language": {
    en: "Kenya Sign Language",
    sw: "Lugha ya Ishara ya Kenya",
    ksl: "Kenya Sign Language", // Would be replaced with actual KSL translation
    br: "⠅⠑⠝⠽⠁ ⠎⠊⠛⠝ ⠇⠁⠝⠛⠥⠁⠛⠑", // Braille representation
  },
  "Braille": {
    en: "Braille",
    sw: "Breli",
    ksl: "Braille", // Would be replaced with actual KSL translation
    br: "⠃⠗⠁⠊⠇⠇⠑", // Braille representation
  },
  "Notifications": {
    en: "Notifications",
    sw: "Arifa",
    ksl: "Notifications", // Would be replaced with actual KSL translation
    br: "⠝⠕⠞⠊⠋⠊⠉⠁⠞⠊⠕⠝⠎", // Braille representation
  },
  "Write to Developer": {
    en: "Write to Developer",
    sw: "Andikia Mtaalamu wa Programu",
    ksl: "Write to Developer", // Would be replaced with actual KSL translation
    br: "⠺⠗⠊⠞⠑ ⠞⠕ ⠙⠑⠧⠑⠇⠕⠏⠑⠗", // Braille representation
  },
  "Resources": {
    en: "Resources",
    sw: "Rasilimali",
    ksl: "Resources", // Would be replaced with actual KSL translation
    br: "⠗⠑⠎⠕⠥⠗⠉⠑⠎", // Braille representation
  },
  "Account": {
    en: "Account",
    sw: "Akaunti",
    ksl: "Account", // Would be replaced with actual KSL translation
    br: "⠁⠉⠉⠕⠥⠝⠞", // Braille representation
  },
  "Privacy": {
    en: "Privacy",
    sw: "Faragha",
    ksl: "Privacy", // Would be replaced with actual KSL translation
    br: "⠏⠗⠊⠧⠁⠉⠽", // Braille representation
  },
  "Dark Mode": {
    en: "Dark Mode",
    sw: "Hali ya Giza",
    ksl: "Dark Mode", // Would be replaced with actual KSL translation
    br: "⠙⠁⠗⠅ ⠍⠕⠙⠑", // Braille representation
  },
};

export function translate(text: string, language: Language): string {
  if (!translations[text]) {
    return text;
  }

  return translations[text][language] || text;
}
