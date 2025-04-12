
import { Language } from '@/contexts/LanguageContext';

// Translation dictionary
type TranslationDict = {
  [key: string]: {
    en: string;
    sw: string;
  };
};

const translations: TranslationDict = {
  // Navigation
  'Home': { en: 'Home', sw: 'Nyumbani' },
  'Legislative Tracker': { en: 'Legislative Tracker', sw: 'Kifuatiliaji cha Sheria' },
  'Resource Hub': { en: 'Resource Hub', sw: 'Kituo cha Rasilimali' },
  'Community': { en: 'Community', sw: 'Jamii' },
  'Volunteer': { en: 'Volunteer', sw: 'Kujitolea' },
  'Search...': { en: 'Search...', sw: 'Tafuta...' },
  'Upload Resource': { en: 'Upload Resource', sw: 'Pakia Rasilimali' },
  'Notifications': { en: 'Notifications', sw: 'Arifa' },
  
  // Footer
  'About Us': { en: 'About Us', sw: 'Kuhusu Sisi' },
  'Our Mission': { en: 'Our Mission', sw: 'Dhamira Yetu' },
  'Team': { en: 'Team', sw: 'Timu' },
  'Partners': { en: 'Partners', sw: 'Washirika' },
  'Get Involved': { en: 'Get Involved', sw: 'Shiriki' },
  'Donate': { en: 'Donate', sw: 'Changia' },
  'Volunteer Opportunities': { en: 'Volunteer Opportunities', sw: 'Fursa za Kujitolea' },
  'Events': { en: 'Events', sw: 'Matukio' },
  'Resources': { en: 'Resources', sw: 'Rasilimali' },
  'Guides': { en: 'Guides', sw: 'Mwongozo' },
  'Constitution': { en: 'Constitution', sw: 'Katiba' },
  'Documents': { en: 'Documents', sw: 'Nyaraka' },
  'Videos': { en: 'Videos', sw: 'Video' },
  'Contact': { en: 'Contact', sw: 'Wasiliana' },
  'Email Us': { en: 'Email Us', sw: 'Tuma Barua' },
  'Call': { en: 'Call', sw: 'Piga Simu' },
  'Address': { en: 'Address', sw: 'Anwani' },
  
  // Common buttons and actions
  'Learn More': { en: 'Learn More', sw: 'Jifunze Zaidi' },
  'Submit': { en: 'Submit', sw: 'Wasilisha' },
  'Cancel': { en: 'Cancel', sw: 'Ghairi' },
  'Back': { en: 'Back', sw: 'Rudi' },
  'Next': { en: 'Next', sw: 'Endelea' },
  'Sign In': { en: 'Sign In', sw: 'Ingia' },
  'Sign Up': { en: 'Sign Up', sw: 'Jisajili' },
  'Log Out': { en: 'Log Out', sw: 'Toka' },
  'English': { en: 'English', sw: 'Kiingereza' },
  'Swahili': { en: 'Swahili', sw: 'Kiswahili' },
  
  // Add more translations as needed
};

// Translation function
export function t(key: string, language: Language): string {
  // If the key exists in our translations dictionary
  if (key in translations) {
    return translations[key][language];
  }
  
  // Fallback to the original text if no translation is found
  return key;
}
