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
  "Welcome to Citizen Engagement": {
    en: "Welcome to Citizen Engagement",
    sw: "Karibu kwenye Ushiriki wa Raia",
    ksl: "Welcome to Citizen Engagement",
    br: "⠺⠑⠇⠉⠕⠍⠑ ⠞⠕ ⠉⠊⠞⠊⠵⠑⠝ ⠑⠝⠛⠁⠛⠑⠍⠑⠝⠞"
  },
  "Join our community of active citizens": {
    en: "Join our community of active citizens",
    sw: "Jiunge na jumuiya yetu ya raia wanaoshiriki",
    ksl: "Join our community of active citizens",
    br: "⠚⠕⠊⠝ ⠕⠥⠗ ⠉⠕⠍⠍⠥⠝⠊⠞⠽ ⠕⠋ ⠁⠉⠞⠊⠧⠑ ⠉⠊⠞⠊⠵⠑⠝⠎"
  },

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
  "Previous": { en: "Previous", sw: "Iliyotangulia", ksl: "Previous", br: "⠏⠗⠑⠧⠊⠕⠥⠎" },
  "Yes": { en: "Yes", sw: "Ndio", ksl: "Yes", br: "⠽⠑⠎" },
  "No": { en: "No", sw: "La", ksl: "No", br: "⠝⠕" },
  "Success": { en: "Success", sw: "Imefaulu", ksl: "Success", br: "⠎⠥⠉⠉⠑⠎⠎" },
  "Success!": { en: "Success!", sw: "Imefaulu!", ksl: "Success!", br: "⠎⠥⠉⠉⠑⠎⠎⠖" },
  "Error": { en: "Error", sw: "Hitilafu", ksl: "Error", br: "⠑⠗⠗⠕⠗" },
  "Warning": { en: "Warning", sw: "Onyo", ksl: "Warning", br: "⠺⠁⠗⠝⠊⠝⠛" },
  "Info": { en: "Info", sw: "Habari", ksl: "Info", br: "⠊⠝⠋⠕" },
  "Or": { en: "Or", sw: "Au", ksl: "Or", br: "⠕⠗" },

  // Navigation
  "Home": { en: "Home", sw: "Nyumbani", ksl: "Home", br: "⠓⠕⠍⠑" },
  "Resources": { en: "Resources", sw: "Rasilimali", ksl: "Resources", br: "⠗⠑⠎⠕⠥⠗⠉⠑⠎" },
  "Community": { en: "Community", sw: "Jamii", ksl: "Community", br: "⠉⠕⠍⠍⠥⠝⠊⠞⠽" },
  "Notifications": { en: "Notifications", sw: "Arifa", ksl: "Notifications", br: "⠝⠕⠞⠊⠋⠊⠉⠁⠞⠊⠕⠝⠎" },
  "Profile": { en: "Profile", sw: "Wasifu", ksl: "Profile", br: "⠏⠗⠕⠋⠊⠇⠑" },
  "Blog": { en: "Blog", sw: "Blog", ksl: "Blog", br: "⠃⠇⠕⠛" },
  "Calendar": { en: "Calendar", sw: "Kalenda", ksl: "Calendar", br: "⠉⠁⠇⠑⠝⠙⠁⠗" },
  "Tools": { en: "Tools", sw: "Zana", ksl: "Tools", br: "⠞⠕⠕⠇⠎" },

  // Features & Sections
  "Legislative Tracker": { en: "Legislative Tracker", sw: "Kifuatiliaji cha Sheria", ksl: "Legislative Tracker", br: "⠇⠑⠛⠊⠎⠇⠁⠞⠊⠧⠑ ⠞⠗⠁⠉⠅⠑⠗" },
  "Resource Hub": { en: "Resource Hub", sw: "Kituo cha Rasilimali", ksl: "Resource Hub", br: "⠗⠑⠎⠕⠥⠗⠉⠑ ⠥⠃" },
  "Volunteer": { en: "Volunteer", sw: "Kujitolea", ksl: "Volunteer", br: "⠧⠕⠇⠥⠝⠞⠑⠑⠗" },
  "Explore Resources": { en: "Explore Resources", sw: "Chunguza Rasilimali", ksl: "Explore Resources", br: "⠑⠭⠏⠇⠕⠗⠑ ⠗⠑⠎⠕⠥⠗⠉⠑⠎" },
  "Track Legislation": { en: "Track Legislation", sw: "Fuatilia Sheria", ksl: "Track Legislation", br: "⠞⠗⠁⠉⠅ ⠇⠑⠛⠊⠎⠇⠁⠞⠊⠕⠝" },
  "Educational Resources": { en: "Educational Resources", sw: "Rasilimali za Elimu", ksl: "Educational Resources", br: "⠑⠙⠥⠉⠁⠞⠊⠕⠝⠁⠇ ⠗⠑⠎⠕⠥⠗⠉⠑⠎" },
  "Join Us": { en: "Join Us", sw: "Jiunge Nasi", ksl: "Join Us", br: "⠚⠕⠊⠝ ⠥⠎" },

  // Educational Content
  "Learn about governance, rights, and civic processes.": {
    en: "Learn about governance, rights, and civic processes.",
    sw: "Jifunze kuhusu utawala, haki, na michakato ya uraia.",
    ksl: "Learn about governance, rights, and civic processes.",
    br: "⠇⠑⠁⠗⠝ ⠁⠃⠕⠥⠞ ⠛⠕⠧⠑⠗⠝⠁⠝⠉⠑⠂ ⠗⠊⠛⠓⠞⠎⠂ ⠁⠝⠙ ⠉⠊⠧⠊⠉ ⠏⠗⠕⠉⠑⠎⠎⠑⠎⠲"
  },
  "Connect and discuss civic matters with other citizens.": {
    en: "Connect and discuss civic matters with other citizens.",
    sw: "Unganisha na ujadili masuala ya kiraia na raia wengine.",
    ksl: "Connect and discuss civic matters with other citizens.",
    br: "⠉⠕⠝⠝⠑⠉⠞ ⠁⠝⠙ ⠙⠊⠎⠉⠥⠎⠎ ⠉⠊⠧⠊⠉ ⠍⠁⠞⠞⠑⠗⠎ ⠺⠊⠞⠓ ⠕⠞⠓⠑⠗ ⠉⠊⠞⠊⠵⠑⠝⠎⠲"
  },
  "Stay informed about bills and legal changes.": {
    en: "Stay informed about bills and legal changes.",
    sw: "Kuwa na taarifa kuhusu miswada na mabadiliko ya kisheria.",
    ksl: "Stay informed about bills and legal changes.",
    br: "⠎⠞⠁⠽ ⠊⠝⠋⠕⠗⠍⠑⠙ ⠁⠃⠕⠥⠞ ⠃⠊⠇⠇⠎ ⠁⠝⠙ ⠇⠑⠛⠁⠇ ⠉⠓⠁⠝⠛⠑⠎⠲"
  },
  "Find opportunities to make a difference.": {
    en: "Find opportunities to make a difference.",
    sw: "Pata fursa za kuleta mabadiliko.",
    ksl: "Find opportunities to make a difference.",
    br: "⠋⠊⠝⠙ ⠕⠏⠏⠕⠗⠞⠥⠝⠊⠞⠊⠑⠎ ⠞⠕ ⠍⠁⠅⠑ ⠁ ⠙⠊⠋⠋⠑⠗⠑⠝⠉⠑⠲"
  },
  "Explore Key Resources": {
    en: "Explore Key Resources",
    sw: "Chunguza Rasilimali Muhimu",
    ksl: "Explore Key Resources",
    br: "⠑⠭⠏⠇⠕⠗⠑ ⠅⠑⠽ ⠗⠑⠎⠕⠥⠗⠉⠑⠎"
  },
  "Learn about governance, civic rights, and public participation": {
    en: "Learn about governance, civic rights, and public participation",
    sw: "Jifunze kuhusu utawala, haki za kiraia, na ushiriki wa umma",
    ksl: "Learn about governance, civic rights, and public participation",
    br: "⠇⠑⠁⠗⠝ ⠁⠃⠕⠥⠞ ⠛⠕⠧⠑⠗⠝⠁⠝⠉⠑⠂ ⠉⠊⠧⠊⠉ ⠗⠊⠛⠓⠞⠎⠂ ⠁⠝⠙ ⠏⠥⠃⠇⠊⠉ ⠏⠁⠗⠞⠊⠉⠊⠏⠁⠞⠊⠕⠝"
  },

  // Specific Keys
  "constitution": { en: "Constitution", sw: "Katiba", ksl: "Constitution", br: "⠉⠕⠝⠎⠞⠊⠞⠥⠞⠊⠕⠝" },
  "lawmaking": { en: "Lawmaking", sw: "Utengenezaji wa Sheria", ksl: "Lawmaking", br: "⠇⠁⠺⠍⠁⠅⠊⠝⠛" },
  "rights": { en: "Rights", sw: "Haki", ksl: "Rights", br: "⠗⠊⠛⠓⠞⠎" },
  "A comprehensive guide to the Kenyan Constitution": {
    en: "A comprehensive guide to the Kenyan Constitution",
    sw: "Mwongozo kamili wa Katiba ya Kenya",
    ksl: "A comprehensive guide to the Kenyan Constitution",
    br: "⠁ ⠉⠕⠍⠏⠗⠑⠓⠑⠝⠎⠊⠧⠑ ⠛⠥⠊⠙⠑ ⠞⠕ ⠞⠓⠑ ⠅⠑⠝⠽⠁⠝ ⠉⠕⠝⠎⠞⠊⠞⠥⠞⠊⠕⠝"
  },
  "Understanding the Constitution of Kenya": {
    en: "Understanding the Constitution of Kenya",
    sw: "Kuelewa Katiba ya Kenya",
    ksl: "Understanding the Constitution of Kenya",
    br: "⠥⠝⠙⠑⠗⠎⠞⠁⠝⠙⠊⠝⠛ ⠞⠓⠑ ⠉⠕⠝⠎⠞⠊⠞⠥⠞⠊⠕⠝ ⠕⠋ ⠅⠑⠝⠽⠁"
  },
  "A comprehensive guide to the Kenyan Constitution and its key provisions.": {
    en: "A comprehensive guide to the Kenyan Constitution and its key provisions.",
    sw: "Mwongozo kamili wa Katiba ya Kenya na masharti yake muhimu.",
    ksl: "A comprehensive guide to the Kenyan Constitution and its key provisions.",
    br: "⠁ ⠉⠕⠍⠏⠗⠑⠓⠑⠝⠎⠊⠧⠑ ⠛⠥⠊⠙⠑ ⠞⠕ ⠞⠓⠑ ⠅⠑⠝⠽⠁⠝ ⠉⠕⠝⠎⠞⠊⠞⠥⠞⠊⠕⠝ ⠁⠝⠙ ⠊⠞⠎ ⠅⠑⠽ ⠏⠗⠕⠧⠊⠎⠊⠕⠝⠎⠲"
  },
  "How laws are made in Kenya": {
    en: "How laws are made in Kenya",
    sw: "Jinsi sheria zinavyotengenezwa nchini Kenya",
    ksl: "How laws are made in Kenya",
    br: "⠓⠕⠺ ⠇⠁⠺⠎ ⠁⠗⠑ ⠍⠁⠙⠑ ⠊⠝ ⠅⠑⠝⠽⠁"
  },
  "How Laws Are Made in Kenya": {
    en: "How Laws Are Made in Kenya",
    sw: "Jinsi Sheria Zinavyoundwa nchini Kenya",
    ksl: "How Laws Are Made in Kenya",
    br: "⠓⠕⠺ ⠇⠁⠺⠎ ⠁⠗⠑ ⠍⠁⠙⠑ ⠊⠝ ⠅⠑⠝⠽⠁"
  },
  "Visual explanation of the legislative process from bill proposal to enactment.": {
    en: "Visual explanation of the legislative process from bill proposal to enactment.",
    sw: "Maelezo ya kuona ya mchakato wa kutunga sheria kutoka pendekezo la mswada hadi kuundwa.",
    ksl: "Visual explanation of the legislative process from bill proposal to enactment.",
    br: "⠧⠊⠎⠥⠁⠇ ⠑⠭⠏⠇⠁⠝⠁⠞⠊⠕⠝ ⠕⠋ ⠞⠓⠑ ⠇⠑⠛⠊⠎⠇⠁⠞⠊⠧⠑ ⠏⠗⠕⠉⠑⠎⠎ ⠋⠗⠕⠍ ⠃⠊⠇⠇ ⠏⠗⠕⠏⠕⠎⠁⠇ ⠞⠕ ⠑⠝⠁⠉⠞⠍⠑⠝⠞⠲"
  },
  "Your rights as a Kenyan citizen": {
    en: "Your rights as a Kenyan citizen",
    sw: "Haki zako kama raia wa Kenya",
    ksl: "Your rights as a Kenyan citizen",
    br: "⠽⠕⠥⠗ ⠗⠊⠛⠓⠞⠎ ⠁⠎ ⠁ ⠅⠑⠝⠽⠁⠝ ⠉⠊⠞⠊⠵⠑⠝"
  },
  "Your Rights as a Kenyan Citizen": {
    en: "Your Rights as a Kenyan Citizen",
    sw: "Haki Zako kama Mwananchi wa Kenya",
    ksl: "Your Rights as a Kenyan Citizen",
    br: "⠽⠕⠥⠗ ⠗⠊⠛⠓⠞⠎ ⠁⠎ ⠁ ⠅⠑⠝⠽⠁⠝ ⠉⠊⠞⠊⠵⠑⠝"
  },
  "Visual representation of fundamental rights guaranteed by the Constitution.": {
    en: "Visual representation of fundamental rights guaranteed by the Constitution.",
    sw: "Uwakilishi wa kuona wa haki za msingi zinazodhaminiwa na Katiba.",
    ksl: "Visual representation of fundamental rights guaranteed by the Constitution.",
    br: "⠧⠊⠎⠥⠁⠇ ⠗⠑⠏⠗⠑⠎⠑⠝⠞⠁⠞⠊⠕⠝ ⠕⠋ ⠋⠥⠝⠙⠁⠍⠑⠝⠞⠁⠇ ⠗⠊⠛⠓⠞⠎ ⠛⠥⠁⠗⠁⠝⠞⠑⠑⠙ ⠃⠽ ⠞⠓⠑ ⠉⠕⠝⠎⠞⠊⠞⠥⠞⠊⠕⠝⠲"
  },
  "View PDF": { en: "View PDF", sw: "Angalia PDF", ksl: "View PDF", br: "⠧⠊⠑⠺ ⠏⠙⠋" },
  "View Video": { en: "View Video", sw: "Angalia Video", ksl: "View Video", br: "⠧⠊⠑⠺ ⠧⠊⠙⠑⠕" },
  "View Infographic": { en: "View Infographic", sw: "Angalia Infographic", ksl: "View Infographic", br: "⠧⠊⠑⠺ ⠊⠝⠋⠕⠛⠗⠁⠏⠓⠊⠉" },
  "PDF": { en: "PDF", sw: "PDF", ksl: "PDF", br: "⠏⠙⠋" },
  "Video": { en: "Video", sw: "Video", ksl: "Video", br: "⠧⠊⠙⠑⠕" },
  "Infographic": { en: "Infographic", sw: "Infografiki", ksl: "Infographic", br: "⠊⠝⠋⠕⠛⠗⠁⠏⠓⠊⠉" },

  // Resource Library
  "Resource Library": { en: "Resource Library", sw: "Maktaba ya Rasilimali", ksl: "Resource Library", br: "⠗⠑⠎⠕⠥⠗⠉⠑ ⠇⠊⠃⠗⠁⠗⠽" },
  "Download Selected Resources": {
    en: "Download Selected Resources",
    sw: "Pakua Rasilimali Zilizochaguliwa",
    ksl: "Download Selected Resources",
    br: "⠙⠕⠺⠝⠇⠕⠁⠙ ⠎⠑⠇⠑⠉⠞⠑⠙ ⠗⠑⠎⠕⠥⠗⠉⠑⠎"
  },
  "Browse all resources": { en: "Browse all resources", sw: "Vinjari rasilimali zote", ksl: "Browse all resources", br: "⠃⠗⠕⠺⠎⠑ ⠁⠇⠇ ⠗⠑⠎⠕⠥⠗⠉⠑⠎" },
  "Upload Resource": { en: "Upload Resource", sw: "Pakia Rasilimali", ksl: "Upload Resource", br: "⠥⠏⠇⠕⠁⠙ ⠗⠑⠎⠕⠥⠗⠉⠑" },
  "All Resources": { en: "All Resources", sw: "Rasilimali Zote", ksl: "All Resources", br: "⠁⠇⠇ ⠗⠑⠎⠕⠥⠗⠉⠑⠎" },
  "Documents": { en: "Documents", sw: "Nyaraka", ksl: "Documents", br: "⠙⠕⠉⠥⠍⠑⠝⠞⠎" },
  "Videos": { en: "Videos", sw: "Video", ksl: "Videos", br: "⠧⠊⠙⠑⠕⠎" },
  "Infographics": { en: "Infographics", sw: "Infografiki", ksl: "Infographics", br: "⠊⠝⠋⠕⠛⠗⠁⠏⠓⠊⠉⠎" },
  "Audio": { en: "Audio", sw: "Sauti", ksl: "Audio", br: "⠁⠥⠙⠊⠕" },
  "Filter": { en: "Filter", sw: "Chuja", ksl: "Filter", br: "⠋⠊⠇⠞⠑⠗" },
  "Sort By": { en: "Sort By", sw: "Panga Kwa", ksl: "Sort By", br: "⠎⠕⠗⠞ ⠃⠽" },
  "Most Recent": { en: "Most Recent", sw: "Za Hivi Karibuni", ksl: "Most Recent", br: "⠍⠕⠎⠞ ⠗⠑⠉⠑⠝⠞" },
  "Most Popular": { en: "Most Popular", sw: "Maarufu Zaidi", ksl: "Most Popular", br: "⠍⠕⠎⠞ ⠏⠕⠏⠥⠇⠁⠗" },
  "Title (A-Z)": { en: "Title (A-Z)", sw: "Kichwa (A-Z)", ksl: "Title (A-Z)", br: "⠞⠊⠞⠇⠑ (⠁-⠵)" },
  "Filter by Category": { en: "Filter by Category", sw: "Chuja kwa Kitengo", ksl: "Filter by Category", br: "⠋⠊⠇⠞⠑⠗ ⠃⠽ ⠉⠁⠞⠑⠛⠕⠗⠽" },
  "View Details": { en: "View Details", sw: "Angalia Maelezo", ksl: "View Details", br: "⠧⠊⠑⠺ ⠙⠑⠞⠁⠊⠇⠎" },

  // Auth & Account
  "Sign In": { en: "Sign In", sw: "Ingia", ksl: "Sign In", br: "⠎⠊⠛⠝ ⠊⠝" },
  "Sign Up": { en: "Sign Up", sw: "Jisajili", ksl: "Sign Up", br: "⠎⠊⠛⠝ ⠥⠏" },
  "Sign Out": { en: "Sign Out", sw: "Toka", ksl: "Sign Out", br: "⠎⠊⠛⠝ ⠕⠥⠞" },
  "Email": { en: "Email", sw: "Barua pepe", ksl: "Email", br: "⠑⠍⠁⠊⠇" },
  "Password": { en: "Password", sw: "Nenosiri", ksl: "Password", br: "⠏⠁⠎⠎⠺⠕⠗⠙" },
  "Confirm Password": { en: "Confirm Password", sw: "Thibitisha Nenosiri", ksl: "Confirm Password", br: "⠉⠕⠝⠋⠊⠗⠍ ⠏⠁⠎⠎⠺⠕⠗⠙" },
  "Forgot Password?": { en: "Forgot Password?", sw: "Umesahau Nenosiri?", ksl: "Forgot Password?", br: "⠋⠕⠗⠛⠕⠞ ⠏⠁⠎⠎⠺⠕⠗⠙?" },
  "Reset Password": { en: "Reset Password", sw: "Weka upya Nenosiri", ksl: "Reset Password", br: "⠗⠑⠎⠑⠞ ⠏⠁⠎⠎⠺⠕⠗⠙" },
  "Full Name": { en: "Full Name", sw: "Jina Kamili", ksl: "Full Name", br: "⠋⠥⠇⠇ ⠝⠁⠍⠑" },
  "Username": { en: "Username", sw: "Jina la Mtumiaji", ksl: "Username", br: "⠥⠎⠑⠗⠝⠁⠍⠑" },
  "Continue with Google": { en: "Continue with Google", sw: "Endelea na Google", ksl: "Continue with Google", br: "⠉⠕⠝⠞⠊⠝⠥⠑ ⠺⠊⠞⠓ ⠛⠕⠕⠛⠇⠑" },
  "Continue with Twitter": { en: "Continue with Twitter", sw: "Endelea na Twitter", ksl: "Continue with Twitter", br: "⠉⠕⠝⠞⠊⠝⠥⠑ ⠺⠊⠞⠓ ⠞⠺⠊⠞⠞⠑⠗" },
  "Signing in...": { en: "Signing in...", sw: "Unaingia...", ksl: "Signing in...", br: "⠎⠊⠛⠝⠊⠝⠛ ⠊⠝⠲⠲⠲" },
  "Creating account...": { en: "Creating account...", sw: "Unatengeneza akaunti...", ksl: "Creating account...", br: "⠉⠗⠑⠁⠞⠊⠝⠛ ⠁⠉⠉⠕⠥⠝⠞⠲⠲⠲" },
  "Create Account": { en: "Create Account", sw: "Tengeneza Akaunti", ksl: "Create Account", br: "⠉⠗⠑⠁⠞⠑ ⠁⠉⠉⠕⠥⠝⠞" },
  "Skip for now": { en: "Skip for now", sw: "Ruka kwa sasa", ksl: "Skip for now", br: "⠎⠅⠊⠏ ⠋⠕⠗ ⠝⠕⠺" },
  "Sign in to save your progress and access civic tools.": {
    en: "Sign in to save your progress and access civic tools.",
    sw: "Ingia ili kuhifadhi maendeleo yako na kufikia zana za kiraia.",
    ksl: "Sign in to save your progress and access civic tools.",
    br: "⠎⠊⠛⠝ ⠊⠝ ⠞⠕ ⠎⠁⠧⠑ ⠽⠕⠥⠗ ⠏⠗⠕⠛⠗⠑⠎⠎ ⠁⠝⠙ ⠁⠉⠉⠑⠎⠎ ⠉⠊⠧⠊⠉ ⠞⠕⠕⠇⠎⠲"
  },
  "Check your email for the confirmation link.": {
    en: "Check your email for the confirmation link.",
    sw: "Angalia barua pepe yako kwa kiungo cha uthibitisho.",
    ksl: "Check your email for the confirmation link.",
    br: "⠉⠓⠑⠉⠅ ⠽⠕⠥⠗ ⠑⠍⠁⠊⠇ ⠋⠕⠗ ⠞⠓⠑ ⠉⠕⠝⠋⠊⠗⠍⠁⠞⠊⠕⠝ ⠇⠊⠝⠅⠲"
  },
  "Error signing up": { en: "Error signing up", sw: "Hitilafu katika kujisajili", ksl: "Error signing up", br: "⠑⠗⠗⠕⠗ ⠎⠊⠛⠝⠊⠝⠛ ⠥⠏" },
  "Error signing in": { en: "Error signing in", sw: "Hitilafu katika kuingia", ksl: "Error signing in", br: "⠑⠗⠗⠕⠗ ⠎⠊⠛⠝⠊⠝⠛ ⠊⠝" },

  // App Exit & Mobile
  "Tap again to exit app": { en: "Tap again to exit app", sw: "Gusa tena kutoka kwenye programu", ksl: "Tap again to exit app", br: "⠞⠁⠏ ⠁⠛⠁⠊⠝ ⠞⠕ ⠑⠭⠊⠞ ⠁⠏⠏" },
  "Double tap to close the application": { en: "Double tap to close the application", sw: "Gusa mara mbili kufunga programu", ksl: "Double tap to close the application", br: "⠙⠕⠥⠃⠇⠑ ⠞⠁⠏ ⠞⠕ ⠉⠇⠕⠎⠑ ⠞⠓⠑ ⠁⠏⠏⠇⠊⠉⠁⠞⠊⠕⠝" },
  "Exiting app": { en: "Exiting app", sw: "Kutoka kwenye programu", ksl: "Exiting app", br: "⠑⠭⠊⠞⠊⠝⠛ ⠁⠏⠏" },
  "App would close now": { en: "App would close now", sw: "Programu ingefungwa sasa", ksl: "App would close now", br: "⠁⠏⠏ ⠺⠕⠥⠇⠙ ⠉⠇⠕⠎⠑ ⠝⠕⠺" },

  // Theme & Language Controls
  "Theme": { en: "Theme", sw: "Mandhari", ksl: "Theme", br: "⠞⠓⠑⠍⠑" },
  "Dark Mode": { en: "Dark Mode", sw: "Hali ya Giza", ksl: "Dark Mode", br: "⠙⠁⠗⠅ ⠍⠕⠙⠑" },
  "Toggle Theme": { en: "Toggle Theme", sw: "Badilisha Mandhari", ksl: "Toggle Theme", br: "⠞⠕⠛⠛⠇⠑ ⠞⠓⠑⠍⠑" },
  "Languages": { en: "Languages", sw: "Lugha", ksl: "Languages", br: "⠇⠁⠝⠛⠥⠁⠛⠑⠎" },
  "Change Language": { en: "Change Language", sw: "Badilisha Lugha", ksl: "Change Language", br: "⠉⠓⠁⠝⠛⠑ ⠇⠁⠝⠛⠥⠁⠛⠑" },
  "English": { en: "English", sw: "Kiingereza", ksl: "English", br: "⠑⠝⠛⠇⠊⠎⠓" },
  "Swahili": { en: "Swahili", sw: "Kiswahili", ksl: "Swahili", br: "⠎⠺⠁⠓⠊⠇⠊" },
  "Kenyan Sign Language": { en: "Kenyan Sign Language", sw: "Lugha ya Ishara ya Kenya", ksl: "Kenyan Sign Language", br: "⠅⠑⠝⠽⠁ ⠎⠊⠛⠝ ⠇⠁⠝⠛⠥⠁⠛⠑" },
  "Braille": { en: "Braille", sw: "Breli", ksl: "Braille", br: "⠃⠗⠁⠊⠇⠇⠑" },

  // Legislative Tracker Detail
  "Bills": { en: "Bills", sw: "Miswada", ksl: "Bills", br: "⠃⠊⠇⠇⠎" },
  "Acts": { en: "Acts", sw: "Sheria", ksl: "Acts", br: "⠁⠉⠞⠎" },
  "Policies": { en: "Policies", sw: "Sera", ksl: "Policies", br: "⠏⠕⠇⠊⠉⠊⠑⠎" },
  "Status": { en: "Status", sw: "Hali", ksl: "Status", br: "⠎⠞⠁⠞⠥⠎" },
  "Date": { en: "Date", sw: "Tarehe", ksl: "Date", br: "⠙⠁⠞⠑" },
  "Category": { en: "Category", sw: "Kategoria", ksl: "Category", br: "⠉⠁⠞⠑⠛⠕⠗⠽" },
  "Sponsor": { en: "Sponsor", sw: "Mdhamini", ksl: "Sponsor", br: "⠎⠏⠕⠝⠎⠕⠗" },
  "First Reading": { en: "First Reading", sw: "Kusomwa kwa Kwanza", ksl: "First Reading", br: "⠋⠊⠗⠎⠞ ⠗⠑⠁⠙⠊⠝⠛" },
  "Second Reading": { en: "Second Reading", sw: "Kusomwa kwa Pili", ksl: "Second Reading", br: "⠎⠑⠉⠕⠝⠙ ⠗⠑⠁⠙⠊⠝⠛" },
  "Committee Stage": { en: "Committee Stage", sw: "Hatua ya Kamati", ksl: "Committee Stage", br: "⠉⠕⠍⠍⠊⠞⠞⠑⠑ ⠎⠞⠁⠛⠑" },
  "Third Reading": { en: "Third Reading", sw: "Kusomwa kwa Tatu", ksl: "Third Reading", br: "⠞⠓⠊⠗⠙ ⠗⠑⠁⠙⠊⠝⠛" },
  "Presidential Assent": { en: "Presidential Assent", sw: "Idhini ya Rais", ksl: "Presidential Assent", br: "⠏⠗⠑⠎⠊⠙⠑⠝⠞⠊⠁⠇ ⠁⠎⠎⠑⠝⠞" },
  "Enacted": { en: "Enacted", sw: "Imetungwa", ksl: "Enacted", br: "⠑⠝⠁⠉⠞⠑⠙" },

  // Community Portal
  "Discussions": { en: "Discussions", sw: "Majadiliano", ksl: "Discussions", br: "⠙⠊⠎⠉⠥⠎⠎⠊⠕⠝⠎" },
  "Events": { en: "Events", sw: "Matukio", ksl: "Events", br: "⠑⠧⠑⠝⠞⠎" },
  "Campaigns": { en: "Campaigns", sw: "Kampeni", ksl: "Campaigns", br: "⠉⠁⠍⠏⠁⠊⠛⠝⠎" },
  "Start a Discussion": { en: "Start a Discussion", sw: "Anzisha Majadiliano", ksl: "Start a Discussion", br: "⠎⠞⠁⠗⠞ ⠁ ⠙⠊⠎⠉⠥⠎⠎⠊⠕⠝" },
  "Create Event": { en: "Create Event", sw: "Unda Tukio", ksl: "Create Event", br: "⠉⠗⠑⠁⠞⠑ ⠑⠧⠑⠝⠞" },
  "Join Campaign": { en: "Join Campaign", sw: "Jiunge na Kampeni", ksl: "Join Campaign", br: "⠚⠕⠊⠝ ⠉⠁⠍⠏⠁⠊⠛⠝" },

  // Volunteer Detail
  "Opportunities": { en: "Opportunities", sw: "Fursa", ksl: "Opportunities", br: "⠕⠏⠏⠕⠗⠞⠥⠝⠊⠞⠊⠑⠎" },
  "Apply": { en: "Apply", sw: "Omba", ksl: "Apply", br: "⠁⠏⠏⠇⠽" },
  "Location": { en: "Location", sw: "Eneo", ksl: "Location", br: "⠇⠕⠉⠁⠞⠊⠕⠝" },
  "Duration": { en: "Duration", sw: "Muda", ksl: "Duration", br: "⠙⠥⠗⠁⠞⠊⠕⠝" },
  "Skills Required": { en: "Skills Required", sw: "Ujuzi Unaohitajika", ksl: "Skills Required", br: "⠎⠅⠊⠇⠇⠎ ⠗⠑⠟⠥⠊⠗⠑⠙" },

  // User Profile & Settings Detail
  "Account Settings": { en: "Account Settings", sw: "Mipangilio ya Akaunti", ksl: "Account Settings", br: "⠁⠉⠉⠕⠥⠝⠞ ⠎⠑⠞⠞⠊⠝⠛⠎" },
  "My Contributions": { en: "My Contributions", sw: "Michango Yangu", ksl: "My Contributions", br: "⠍⠽ ⠉⠕⠝⠞⠗⠊⠃⠥⠞⠊⠕⠝⠎" },
  "Saved Resources": { en: "Saved Resources", sw: "Rasilimali Zilizohifadhiwa", ksl: "Saved Resources", br: "⠎⠁⠧⠑⠙ ⠗⠑⠎⠕⠥⠗⠉⠑⠎" },
  "Volunteer History": { en: "Volunteer History", sw: "Historia ya Kujitolea", ksl: "Volunteer History", br: "⠧⠕⠇⠥⠝⠞⠑⠑⠗ ⠓⠊⠎⠞⠕⠗⠽" },
  "Notifications Settings": { en: "Notifications Settings", sw: "Mipangilio ya Arifa", ksl: "Notifications Settings", br: "⠝⠕⠞⠊⠋⠊⠉⠁⠞⠊⠕⠝⠎ ⠎⠑⠞⠞⠊⠝⠛⠎" },

  // Tools Descriptions
  "Nasaka IEBC": { en: "Nasaka IEBC", sw: "Nasaka IEBC", ksl: "Nasaka IEBC", br: "⠝⠁⠎⠁⠅⠁ ⠊⠑⠃⠉" },
  "Find the closest IEBC registration center": { en: "Find the closest IEBC registration center", sw: "Pata kituo cha usajili cha IEBC kilicho karibu zaidi", ksl: "Find the closest IEBC registration center", br: "⠋⠊⠝⠙ ⠞⠓⠑ ⠉⠇⠕⠎⠑⠎⠞ ⠊⠑⠃⠉ ⠗⠑⠛⠊⠎⠞⠗⠁⠞⠊⠕⠝ ⠉⠑⠝⠞⠑⠗" },
  "Peoples-Audit": { en: "Peoples-Audit", sw: "Audit ya Wananchi", ksl: "Peoples-Audit", br: "⠏⠑⠕⠏⠇⠑⠎-⠁⠥⠙⠊⠞" },
  "Breakdown of the economic state of the nation": { en: "Breakdown of the economic state of the nation", sw: "Uchambuzi wa hali ya kiuchumi ya taifa", ksl: "Breakdown of the economic state of the nation", br: "⠃⠗⠑⠁⠅⠙⠕⠺⠝ ⠕⠋ ⠞⠓⠑ ⠑⠉⠕⠝⠕⠍⠊⠉ ⠎⠞⠁⠞⠑ ⠕⠋ ⠞⠓⠑ ⠝⠁⠞⠊⠕⠝" },
  "SHAmbles": { en: "SHAmbles", sw: "SHAmbles", ksl: "SHAmbles", br: "⠎⠓⠁⠍⠃⠇⠑⠎" },
  "Investigation and accountability tracking": { en: "Investigation and accountability tracking", sw: "Ufuatiliaji wa uchunguzi na uwajibikaji", ksl: "Investigation and accountability tracking", br: "⠊⠝⠧⠑⠎⠞⠊⠛⠁⠞⠊⠕⠝ ⠁⠝⠙ ⠁⠉⠉⠕⠥⠝⠞⠁⠃⠊⠇⠊⠞⠽ ⠞⠗⠁⠉⠅⠊⠝⠛" },
  "Legislative Bill Tracker": { en: "Legislative Bill Tracker", sw: "Kifuatiliaji cha Miswada ya Sheria", ksl: "Legislative Bill Tracker", br: "⠇⠑⠛⠊⠎⠇⠁⠞⠊⠧⠑ ⠃⠊⠇⠇ ⠞⠗⠁⠉⠅⠑⠗" },
  "Track bills and legislative progress": { en: "Track bills and legislative progress", sw: "Fuatilia miswada na maendeleo ya kisheria", ksl: "Track bills and legislative progress", br: "⠞⠗⠁⠉⠅ ⠃⠊⠇⠇⠎ ⠁⠝⠙ ⠇⠑⠛⠊⠎⠇⠁⠞⠊⠧⠑ ⠏⠗⠕⠛⠗⠑⠎⠎" },
  "Central hub for all civic documents": { en: "Central hub for all civic documents", sw: "Kitovu kikuu cha nyaraka zote za kiraia", ksl: "Central hub for all civic documents", br: "⠉⠑⠝⠞⠗⠁⠇ ⠓⠥⠃ ⠋⠕⠗ ⠁⠇⠇ ⠉⠊⠧⠊⠉ ⠙⠕⠉⠥⠍⠑⠞⠎" },
};

export type TranslationKey = keyof typeof translations;

export function translate(text: string, language: Language): string {
  if (translations[text] && translations[text][language]) {
    return translations[text][language];
  }
  return text;
}
