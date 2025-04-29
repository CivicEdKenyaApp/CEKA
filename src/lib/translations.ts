import { Language } from "@/contexts/LanguageContext"

export const translations: Record<string, Record<Language, string>> = {
  // General
  'Loading...': { en: 'Loading...', sw: 'Upe muda...', ksl: 'Loading...', br: '⠇⠕⠁⠙⠊⠝⠛...' },
  'Search...': { en: 'Search...', sw: 'Pekua...', ksl: 'Search...', br: '⠎⠑⠁⠗⠉⠓...' },
  'Learn More': { en: 'Learn More', sw: 'Zidi Kujifunza', ksl: 'Learn More', br: '⠇⠑⠁⠗⠝ ⠍⠕⠗⠑' },
  'View All': { en: 'View All', sw: 'Tazama Yote', ksl: 'View All', br: '⠧⠊⠑⠺ ⠁⠇⠇' },
  'Download': { en: 'Download', sw: 'Pakua', ksl: 'Download', br: '⠙⠕⠺⠝⠇⠕⠁⠙' },
  'Submit': { en: 'Submit', sw: 'Wasilisha', ksl: 'Submit', br: '⠎⠥⠃⠍⠊⠞' },
  'Cancel': { en: 'Cancel', sw: 'Batili', ksl: 'Cancel', br: '⠉⠁⠝⠉⠑⠇' },
  'Save': { en: 'Save', sw: 'Hifadhi', ksl: 'Save', br: '⠎⠁⠧⠑' },
  'Delete': { en: 'Delete', sw: 'Futa', ksl: 'Delete', br: '⠙⠑⠇⠑⠞⠑' },
  'Edit': { en: 'Edit', sw: 'Hariri', ksl: 'Edit', br: '⠑⠙⠊⠞' },
  'Close': { en: 'Close', sw: 'Funga', ksl: 'Close', br: '⠉⠇⠕⠎⠑' },
  'Back': { en: 'Back', sw: 'Rudi', ksl: 'Back', br: '⠃⠁⠉⠅' },
  'Next': { en: 'Next', sw: 'Endelea', ksl: 'Next', br: '⠝⠑⠭⠞' },
  'Previous': { en: 'Previous', sw: 'Iliyotangulia', ksl: 'Previous', br: '⠏⠗⠕⠧⠊⠕⠥⠎' },
  'Yes': { en: 'Yes', sw: 'Ndio', ksl: 'Yes', br: '⠽⠑⠎' },
  'No': { en: 'No', sw: 'La', ksl: 'No', br: '⠝⠕' },
  'Success': { en: 'Success', sw: 'Imefaulu', ksl: 'Success', br: '⠎⠥⠉⠉⠑⠎⠎' },
  'Success!': { en: 'Success!', sw: 'Imefaulu!', ksl: 'Success!', br: '⠎⠥⠉⠉⠑⠎⠎!' },
  'Error': { en: 'Error', sw: 'Hitilafu Kidogo', ksl: 'Error', br: '⠑⠗⠗⠕⠗' },
  'Warning': { en: 'Warning', sw: 'Onyo', ksl: 'Warning', br: '⠺⠁⠗⠝⠊⠝⠛' },
  'Info': { en: 'Info', sw: 'Habari', ksl: 'Info', br: '⠊⠝⠋⠕' },
  'Or': { en: 'Or', sw: 'Au', ksl: 'Or', br: '⠕⠗' },
  'Toggle theme': { en: 'Toggle theme', sw: 'Badilisha mandhari', ksl: 'Toggle theme', br: '⠞⠕⠛⠛⠇⠑ ⠞⠓⠑⠍⠑' },
  
  // Navigation
  'Home': { en: 'Home', sw: 'Nyumbani', ksl: 'Home', br: '⠓⠕⠍⠑' },
  'Resources': { en: 'Resources', sw: 'Rasilimali', ksl: 'Resources', br: '⠗⠑⠎⠕⠥⠗⠉⠑⠎' },
  'Community': { en: 'Community', sw: 'Jamii', ksl: 'Community', br: '⠉⠕⠍⠍⠥⠝⠊⠞⠽' },
  'Notifications': { en: 'Notifications', sw: 'Arifa', ksl: 'Notifications', br: '⠝⠕⠞⠊⠋⠊⠉⠁⠞⠊⠕⠝⠎' },
  'Profile': { en: 'Profile', sw: 'Wasifu', ksl: 'Profile', br: '⠏⠗⠕⠋⠊⠇⠑' },
  'Upload': { en: 'Upload', sw: 'Pakia', ksl: 'Upload', br: '⠥⠏⠇⠕⠁⠙' },
  'Legislative Tracker': { en: 'Legislative Tracker', sw: 'Kifuatiliaji cha Sheria', ksl: 'Legislative Tracker', br: '⠇⠑⠛⠊⠎⠇⠁⠞⠊⠧⠑ ⠞⠗⠁⠉⠅⠑⠗' },
  'Resource Hub': { en: 'Resource Hub', sw: 'Kituo cha Rasilimali', ksl: 'Resource Hub', br: '⠗⠑⠎⠕⠥⠗⠉⠑ ⠓⠥⠃' },
  'Volunteer': { en: 'Volunteer', sw: 'Jitolee', ksl: 'Volunteer', br: '⠧⠕⠇⠥⠝⠞⠑⠑⠗' },
  'Browse all resources': { en: 'Browse all resources', sw: 'Tazama rasilimali zote', ksl: 'Browse all resources', br: '⠃⠗⠕⠺⠎⠑ ⠁⠇⠇ ⠗⠑⠎⠕⠥⠗⠉⠑⠎' },
  'Change Language': { en: 'Change Language', sw: 'Badili Lugha', ksl: 'Change Language', br: '⠉⠓⠁⠝⠛⠑ ⠇⠁⠝⠛⠥⠁⠛⠑' },
  'Upload Resource': { en: 'Upload Resource', sw: 'Pakia Rasilimali', ksl: 'Upload Resource', br: '⠥⠏⠇⠕⠁⠙ ⠗⠑⠎⠕⠥⠗⠉⠑' },
  'English': { en: 'English', sw: 'Kiingereza', ksl: 'English', br: '⠑⠝⠛⠇⠊⠎⠓' },
  'Swahili': { en: 'Swahili', sw: 'Kiswahili', ksl: 'Swahili', br: '⠎⠺⠁⠓⠊⠇⠊' },
  'Languages': { en: 'Languages', sw: 'Lugha', ksl: 'Languages', br: '⠇⠁⠝⠛⠥⠁⠛⠑⠎' },
  'Kenya Sign Language': { en: 'Kenya Sign Language', sw: 'Lugha ya Ishara ya Kenya', ksl: 'Kenya Sign Language', br: '⠅⠑⠝⠽⠁ ⠎⠊⠛⠝ ⠇⠁⠝⠛⠥⠁⠛⠑' },
  'Braille': { en: 'Braille', sw: 'Braille', ksl: 'Braille', br: '⠃⠗⠁⠊⠇⠇⠑' },
  'More Options': { en: 'More Options', sw: 'Chaguo Zaidi', ksl: 'More Options', br: '⠍⠕⠗⠑ ⠕⠏⠞⠊⠕⠝⠎' },
  'Dark Mode': { en: 'Dark Mode', sw: 'Hali ya Giza', ksl: 'Dark Mode', br: '⠙⠁⠗⠅ ⠍⠕⠙⠑' },
  'Theme': { en: 'Theme', sw: 'Mandhari', ksl: 'Theme', br: '⠞⠓⠑⠍⠑' },
  'Settings': { en: 'Settings', sw: 'Mipangilio', ksl: 'Settings', br: '⠎⠑⠞⠞⠊⠝⠛⠎' },
  'Account': { en: 'Account', sw: 'Akaunti', ksl: 'Account', br: '⠁⠉⠉⠕⠥⠝⠞' },
  'Privacy': { en: 'Privacy', sw: 'Faragha', ksl: 'Privacy', br: '⠏⠗⠊⠧⠁⠉⠽' },
  'Write to Developer': { en: 'Write to Developer', sw: 'Andikia Mtengenezaji', ksl: 'Write to Developer', br: '⠺⠗⠊⠞⠑ ⠞⠕ ⠙⠑⠧⠑⠇⠕⠏⠑⠗' },
  
  // Auth
  'Sign In': { en: 'Sign In', sw: 'Ingia', ksl: 'Sign In', br: '⠎⠊⠛⠝ ⠊⠝' },
  'Sign Up': { en: 'Sign Up', sw: 'Jisajili', ksl: 'Sign Up', br: '⠎⠊⠛⠝ ⠥⠏' },
  'Sign Out': { en: 'Sign Out', sw: 'Toka', ksl: 'Sign Out', br: '⠎⠊⠛⠝ ⠕⠥⠞' },
  'Email': { en: 'Email', sw: 'Barua pepe', ksl: 'Email', br: '⠑⠍⠁⠊⠇' },
  'Password': { en: 'Password', sw: 'Nenosiri', ksl: 'Password', br: '⠏⠁⠎⠎⠺⠕⠗⠙' },
  'Confirm Password': { en: 'Confirm Password', sw: 'Thibitisha Nenosiri', ksl: 'Confirm Password', br: '⠉⠕⠝⠋⠊⠗⠍ ⠏⠁⠎⠎⠺⠕⠗⠙' },
  'Forgot Password?': { en: 'Forgot Password?', sw: 'Umesahau Nenosiri?', ksl: 'Forgot Password?', br: '⠋⠕⠗⠛⠕⠞ ⠏⠁⠎⠎⠺⠕⠗⠙?' },
  'Reset Password': { en: 'Reset Password', sw: 'Weka upya Nenosiri', ksl: 'Reset Password', br: '⠗⠑⠎⠑⠞ ⠏⠁⠎⠎⠺⠕⠗⠙' },
  'Full Name': { en: 'Full Name', sw: 'Jina Lako Kamili', ksl: 'Full Name', br: '⠋⠥⠇⠇ ⠝⠁⠍⠑' },
  'Username': { en: 'Username', sw: 'Jina la Mtumiaji', ksl: 'Username', br: '⠥⠎⠑⠗⠝⠁⠍⠑' },
  'Continue with Google': { en: 'Continue with Google', sw: 'Endelea na Google', ksl: 'Continue with Google', br: '⠉⠕⠝⠞⠊⠝⠥⠑ ⠺⠊⠞⠓ ⠛⠕⠕⠛⠇⠑' },
  'Continue with Twitter': { en: 'Continue with Twitter', sw: 'Endelea na Twitter', ksl: 'Continue with Twitter', br: '⠉⠕⠝⠞⠊⠝⠥⠑ ⠺⠊⠞⠓ ⠞⠺⠊⠞⠞⠑⠗' },
  'Welcome to Citizen Engagement': { en: 'Welcome to Citizen Engagement', sw: 'Karibu kwenye Ushiriki wa Raia', ksl: 'Welcome to Citizen Engagement', br: '⠺⠑⠇⠉⠕⠍⠑ ⠞⠕ ⠉⠊⠞⠊⠵⠑⠝ ⠑⠝⠛⠁⠛⠑⠍⠑⠝⠞' },
  'Welcome to CEKA': {
    en: "Welcome to CEKA",
    sw: "Karibu CEKA",
    ksl: "Welcome to CEKA",
    br: "⠺⠑⠇⠉⠕⠍⠑ ⠞⠕ ⠉⠑⠅⠁"
  },
  "Join our community of active citizens": {
    en: "Join our community of active citizens",
    sw: "Jiunge na jamii yetu ya raia amilifu",
    ksl: "Join our community of active citizens",
    br: "⠚⠕⠊⠝ ⠕⠥⠗ ⠉⠕⠍⠍⠥⠝⠊⠞⠽ ⠕⠋ ⠁⠉⠞⠊⠧⠑ ⠉⠊⠞⠊⠵⠑⠝⠎"
  },
  'Signing in...': { en: 'Signing in...', sw: 'Nipe sekunde uingie...', ksl: 'Signing in...', br: '⠎⠊⠛⠝⠊⠝⠛ ⠊⠝...' },
  'Creating account...': { en: 'Creating account...', sw: 'Inaunda akaunti...', ksl: 'Creating account...', br: '⠉⠗⠑⠁⠞⠊⠝⠛ ⠁⠉⠉⠕⠥⠝⠞...' },
  'Error signing in': { en: 'Error signing in', sw: 'Hitilafu wakati wa kuingia', ksl: 'Error signing in', br: '⠑⠗⠗⠕⠗ ⠎⠊⠛⠝⠊⠝⠛ ⠊⠝' },
  'Error signing up': { en: 'Error signing up', sw: 'Hitilafu wakati wa kujisajili', ksl: 'Error signing up', br: '⠑⠗⠗⠕⠗ ⠎⠊⠛⠝⠊⠝⠛ ⠥⠏' },
  'Check your email for the confirmation link.': { en: 'Check your email for the confirmation link.', sw: 'Angalia barua pepe yako kwa kiungo cha uthibitisho.', ksl: 'Check your email for the confirmation link.', br: '⠉⠓⠑⠉⠅ ⠽⠕⠥⠗ ⠑⠍⠁⠊⠇ ⠋⠕⠗ ⠞⠓⠑ ⠉⠕⠝⠋⠊⠗⠍⠁⠞⠊⠕⠝ ⠇⠊⠝⠅' },
  'Sign in reminder': { en: 'Sign in reminder', sw: 'Kikumbusho cha kuingia', ksl: 'Sign in reminder', br: '⠎⠊⠛⠝ ⠊⠝ ⠞⠕ ⠁⠉⠉⠑⠎⠎ ⠁⠇⠇ ⠉⠑⠅⠁ ⠋⠑⠁⠞⠥⠗⠑⠗' },
  'Sign in to access all CEKA features': { en: 'Sign in to access all CEKA features', sw: 'Jisajili ili kupata huduma zote za CEKA', ksl: 'Sign in to access all CEKA features', br: '⠎⠊⠛⠝ ⠊⠝ ⠞⠕ ⠁⠉⠉⠑⠎⠎ ⠁⠇⠇ ⠉⠑⠅⠁ ⠋⠑⠁⠞⠥⠗⠑⠎' },
  'Skip for now': { en: 'Skip for now', sw: 'Ruka kwa sasa', ksl: 'Skip for now', br: '⠎⠅⠊⠏ ⠋⠕⠗ ⠝⠕⠺' },
  'Welcome to CEKA 🇰🇪': { en: 'Welcome to CEKA 🇰🇪', sw: 'Karibu CEKA 🇰🇪', ksl: 'Welcome to CEKA 🇰🇪', br: '⠺⠑⠇⠉⠕⠍⠑ ⠞⠕ ⠉⠑⠅⠁ ⠰⠅⠑' },
  'Sign in to save your progress and access civic tools.': { en: 'Sign in to save your progress and access civic tools.', sw: 'Ingia ili kuhifadhi maendeleo yako na kupata zana za kiraia.', ksl: 'Sign in to save your progress and access civic tools.', br: '⠎⠊⠛⠝ ⠊⠝ ⠞⠕ ⠎⠁⠧⠑ ⠽⠕⠥⠗ ⠏⠗⠕⠛⠗⠑⠎⠎ ⠁⠝⠙ ⠁⠉⠉⠑⠎⠎ ⠉⠊⠧⠊⠉ ⠞⠕⠕⠇⠎' },
  
  // ResourceHighlights component
  'Educational Resources': { en: 'Educational Resources', sw: 'Rasilimali za Elimu', ksl: 'Educational Resources', br: '⠑⠙⠥⠉⠁⠞⠊⠕⠝⠁⠇ ⠗⠑⠎⠕⠥⠗⠉⠑⠎' },
  'Understanding the Constitution of Kenya': { 
    en: 'Understanding the Constitution of Kenya', 
    sw: 'Elewa Katiba ya Kenya',
    ksl: 'Understanding the Constitution of Kenya',
    br: '⠥⠝⠙⠑⠗⠎⠞⠁⠝⠙⠊⠝⠛ ⠞⠓⠑ ⠉⠕⠝⠎⠞⠊⠞⠥⠞⠊⠕⠝ ⠕⠋ ⠅⠑⠝⠽⠁'
  },
  'A comprehensive guide to the Kenyan Constitution and its key provisions.': { 
    en: 'A comprehensive guide to the Kenyan Constitution and its key provisions.', 
    sw: 'Kielezo kamili cha Katiba ya Kenya na masharti yake kama ilivyo faafu.',
    ksl: 'A comprehensive guide to the Kenyan Constitution and its key provisions.',
    br: '⠁ ⠉⠕⠍⠏⠗⠑⠓⠑⠝⠎⠊⠧⠑ ⠛⠥⠊⠙⠑ ⠞⠕ ⠞⠓⠑ ⠅⠑⠝⠽⠁⠝ ⠉⠕⠝⠎⠞⠊⠞⠥⠞⠊⠕⠝ ⠁⠝⠙ ⠊⠞⠎ ⠅⠑⠽ ⠏⠗⠕⠧⠊⠎⠊⠕⠝⠎'
  },
  'How Laws Are Made in Kenya': { 
    en: 'How Laws Are Made in Kenya', 
    sw: 'Jinsi Sheria Zinavyoundwa nchini Kenya',
    ksl: 'How Laws Are Made in Kenya',
    br: '⠓⠕⠺ ⠇⠁⠺⠎ ⠁⠗⠑ ⠍⠁⠙⠑ ⠊⠝ ⠅⠑⠝⠽⠁'
  },
  'Visual explanation of the legislative process from bill proposal to enactment.': { 
    en: 'Visual explanation of the legislative process from bill proposal to enactment.', 
    sw: 'Piga Taswira nasi katika maelezo ya mchakato wa kutunga sheria kutoka pendekezo la mswada hadi kuundwa kwake.',
    ksl: 'Visual explanation of the legislative process from bill proposal to enactment.',
    br: '⠧⠊⠎⠥⠁⠇ ⠑⠭⠏⠇⠁⠝⠁⠞⠊⠕⠝ ⠕⠋ ⠞⠓⠑ ⠇⠑⠛⠊⠎⠇⠁⠞⠊⠧⠑ ⠏⠗⠕⠉⠑⠎⠎ ⠋⠗⠕⠍ ⠃⠊⠇⠇ ⠏⠗⠕⠏⠕⠎⠁⠇ ⠞⠕ ⠑⠝⠁⠉⠞⠍⠑⠝⠞'
  },
  'Your Rights as a Kenyan Citizen': { 
    en: 'Your Rights as a Kenyan Citizen', 
    sw: 'Haki Zako kama Mwananchi wa Kenya',
    ksl: 'Your Rights as a Kenyan Citizen',
    br: '⠽⠕⠥⠗ ⠗⠊⠛⠓⠞⠎ ⠁⠎ ⠁ ⠅⠑⠝⠽⠁⠝ ⠉⠊⠞⠊⠵⠑⠝'
  },
  'Visual representation of fundamental rights guaranteed by the Constitution.': { 
    en: 'Visual representation of fundamental rights guaranteed by the Constitution.', 
    sw: 'Uwakilishi wa kuona wa haki za msingi zinazodhaminiwa na Katiba.',
    ksl: 'Visual representation of fundamental rights guaranteed by the Constitution.',
    br: '⠧⠊⠎⠥⠁⠇ ⠗⠑⠏⠗⠑⠎⠑⠝⠞⠁⠞⠊⠕⠝ ⠕⠋ ⠋⠥⠝⠙⠁⠍⠑⠝⠞⠁⠇ ⠗⠊⠛⠓⠞⠎ ⠛⠥⠁⠗⠁⠝⠞⠑⠑⠙ ⠃⠽ ⠞⠓⠑ ⠉⠕⠝⠎⠞⠊��⠥⠞⠊⠕⠝'
  },
  'Learn about governance, civic rights, and public participation': { 
    en: 'Learn about governance, civic rights, and public participation', 
    sw: 'Jifunze kuhusu utawala, haki za kiraia, na ushiriki wa umma',
    ksl: 'Learn about governance, civic rights, and public participation',
    br: '⠇⠑⠁⠗⠝ ⠁⠃⠕⠥⠞ ⠛⠕⠧⠑⠗⠝⠁⠝⠉⠑⠂ ⠉⠊⠧⠊⠉ ⠗⠊⠛⠓⠞⠎⠂ ⠁⠝⠙ ⠏⠥⠃⠇⠊⠉ ⠏⠁⠗⠞⠊⠉⠊⠏⠁⠞⠊⠕⠝'
  },
  'PDF': { en: 'PDF', sw: 'PDF', ksl: 'PDF', br: '⠏⠙⠋' },
  'Video': { en: 'Video', sw: 'Video', ksl: 'Video', br: '⠧⠊⠙⠑⠕' },
  'Infographic': { en: 'Infographic', sw: 'Infografiki', ksl: 'Infographic', br: '⠊⠝⠋⠕⠛⠗⠁⠏⠓⠊⠉' },
  
  // Legislative Tracker
  'Bills': { en: 'Bills', sw: 'Miswada', ksl: 'Bills', br: '⠃⠊⠇⠇⠎' },
  'Acts': { en: 'Acts', sw: 'Sheria', ksl: 'Acts', br: '⠁⠉⠞⠎' },
  'Policies': { en: 'Policies', sw: 'Sera', ksl: 'Policies', br: '⠏⠕⠇⠊⠉⠊⠑⠎' },
  'Status': { en: 'Status', sw: 'Hali', ksl: 'Status', br: '⠎⠞⠁⠞⠥⠎' },
  'Date': { en: 'Date', sw: 'Tarehe', ksl: 'Date', br: '⠙⠁⠞⠑' },
  'Category': { en: 'Category', sw: 'Kategoria', ksl: 'Category', br: '⠉⠁⠞⠑⠛⠕⠗⠽' },
  'Sponsor': { en: 'Sponsor', sw: 'Mdhamini', ksl: 'Sponsor', br: '⠎⠏⠕⠝⠎⠕⠗' },
  'First Reading': { en: 'First Reading', sw: 'Kusomwa kwa Kwanza', ksl: 'First Reading', br: '⠋⠊⠗⠎⠞ ⠗⠑⠁⠙⠊⠝⠛' },
  'Second Reading': { en: 'Second Reading', sw: 'Kusomwa kwa Pili', ksl: 'Second Reading', br: '⠎⠑⠉⠕⠝⠙ ⠗⠑⠁⠙⠊⠝⠛' },
  'Committee Stage': { en: 'Committee Stage', sw: 'Hatua ya Kamati', ksl: 'Committee Stage', br: '⠉⠕⠍⠍⠊⠞⠞⠑⠑ ⠎⠞⠁⠛⠑' },
  'Third Reading': { en: 'Third Reading', sw: 'Kusomwa kwa Tatu', ksl: 'Third Reading', br: '⠞⠓⠊⠗⠙ ⠗⠑⠁⠙⠊⠝⠛' },
  'Presidential Assent': { en: 'Presidential Assent', sw: 'Idhini ya Rais', ksl: 'Presidential Assent', br: '⠏⠗⠑⠎⠊⠙⠑⠝⠞⠊⠁⠇ ⠁⠎⠎⠑⠝⠞' },
  'Enacted': { en: 'Enacted', sw: 'Imetungwa', ksl: 'Enacted', br: '⠑⠝⠁⠉⠞⠑⠙' },
  
  // Resource Hub
  'All Resources': { en: 'All Resources', sw: 'Rasilimali Zote', ksl: 'All Resources', br: '⠁⠇⠇ ⠗⠑⠎⠕⠥⠗⠉⠑⠎' },
  'Documents': { en: 'Documents', sw: 'Nyaraka', ksl: 'Documents', br: '⠙⠕⠉⠥⠍⠑⠝⠞⠎' },
  'Videos': { en: 'Videos', sw: 'Video', ksl: 'Videos', br: '⠧⠊⠙⠑⠕⠎' },
  'Infographics': { en: 'Infographics', sw: 'Infografiki', ksl: 'Infographics', br: '⠊⠝⠋⠕⠛⠗⠁⠏⠓⠊⠉⠎' },
  'Audio': { en: 'Audio', sw: 'Sauti', ksl: 'Audio', br: '⠁⠥⠙⠊⠕' },
  'Filter': { en: 'Filter', sw: 'Chuja', ksl: 'Filter', br: '⠋⠊⠇⠞⠑⠗' },
  'Sort By': { en: 'Sort By', sw: 'Panga Kwa', ksl: 'Sort By', br: '⠎⠕⠗⠞ ⠃⠽' },
  'Most Recent': { en: 'Most Recent', sw: 'Za Hivi Karibuni', ksl: 'Most Recent', br: '⠍⠕⠎⠞ ⠗⠑⠉⠑⠝⠞' },
  'Most Popular': { en: 'Most Popular', sw: 'Maarufu Zaidi', ksl: 'Most Popular', br: '⠍⠕⠎⠞ ⠏⠕⠏⠥⠇⠁⠗' },
  'Title (A-Z)': { en: 'Title (A-Z)', sw: 'Kichwa (A-Z)', ksl: 'Title (A-Z)', br: '⠞⠊⠞⠇⠑ ⠶⠁⠤⠵⠶' },
  
  // Community Portal
  'Discussions': { en: 'Discussions', sw: 'Majadiliano', ksl: 'Discussions', br: '⠙⠊⠎⠉⠥⠎⠎⠊⠕⠝⠎' },
  'Events': { en: 'Events', sw: 'Matukio', ksl: 'Events', br: '⠑⠧⠑⠝⠞⠎' },
  'Campaigns': { en: 'Campaigns', sw: 'Kampeni', ksl: 'Campaigns', br: '⠉⠁⠍⠏⠁⠊⠛⠝⠎' },
  'Start a Discussion': { en: 'Start a Discussion', sw: 'Anzisha Majadiliano', ksl: 'Start a Discussion', br: '⠎⠞⠁⠗⠞ ⠁ ⠙⠊⠎⠉⠥⠎⠎⠊⠕⠝' },
  'Create Event': { en: 'Create Event', sw: 'Unda Tukio', ksl: 'Create Event', br: '⠉⠗⠑⠁⠞⠑ ⠑⠧⠑⠝⠞' },
  'Join Campaign': { en: 'Join Campaign', sw: 'Jiunge na Kampeni', ksl: 'Join Campaign', br: '⠚⠕⠊⠝ ⠉⠁⠍⠏⠁��⠛⠝' },
  
  // Volunteer
  'Opportunities': { en: 'Opportunities', sw: 'Fursa', ksl: 'Opportunities', br: '⠕⠏⠏⠕⠗⠞⠥⠝⠊⠞⠊⠑⠎' },
  'Apply': { en: 'Apply', sw: 'Omba', ksl: 'Apply', br: '⠁⠏⠏⠇⠽' },
  'Location': { en: 'Location', sw: 'Eneo', ksl: 'Location', br: '⠇⠕⠉⠁⠞⠊⠕⠝' },
  'Duration': { en: 'Duration', sw: 'Muda', ksl: 'Duration', br: '⠙⠥⠗⠁⠞⠊⠕⠝' },
  'Skills Required': { en: 'Skills Required', sw: 'Ujuzi Unaohitajika', ksl: 'Skills Required', br: '⠎⠅⠊⠇⠇⠎ ⠗⠑⠟⠥⠊⠗⠑⠙' },
  
  // User Profile
  'Account Settings': { en: 'Account Settings', sw: 'Mipangilio ya Akaunti', ksl: 'Account Settings', br: '⠁⠉⠉⠕⠥⠝⠞ ⠎⠑⠞⠞⠊⠝⠛⠎' },
  'My Contributions': { en: 'My Contributions', sw: 'Michango Yangu', ksl: 'My Contributions', br: '⠍⠽ ⠉⠕⠝⠞⠗⠊⠃⠥⠞⠊⠕⠝⠎' },
  'Saved Resources': { en: 'Saved Resources', sw: 'Rasilimali Zilizohifadhiwa', ksl: 'Saved Resources', br: '⠎⠁⠧⠑⠙ ⠗⠑⠎⠕⠥⠗⠉⠑⠎' },
  'Volunteer History': { en: 'Volunteer History', sw: 'Historia ya Kujitolea', ksl: 'Volunteer History', br: '⠧⠕⠇⠥⠝⠞⠑⠑⠗ ⠓⠊⠎⠞⠕⠗⠽' },
  'Notifications Settings': { en: 'Notifications Settings', sw: 'Mipangilio ya Arifa', ksl: 'Notifications Settings', br: '⠝⠕⠞⠊⠋⠊⠉⠁⠞⠊⠕⠝⠎ ⠎⠑⠞⠞⠊⠝⠛⠎' },

  // Resource Highlights
  'View PDF': { en: 'View PDF', sw: 'Tazama PDF', ksl: 'View PDF', br: '⠧⠊⠑⠺ ⠏⠙⠋' },
  'View Video': { en: 'View Video', sw: 'Tazama Video', ksl: 'View Video', br: '⠧⠊⠑⠺ ⠧⠊⠙⠑⠕' },
  'View Infographic': { en: 'View Infographic', sw: 'Tazama Infografiki', ksl: 'View Infographic', br: '⠧⠊⠑⠺ ⠊⠝⠋⠕⠛⠗⠁⠏⠓⠊⠉' },
  'A comprehensive guide to the Kenyan Constitution': { en: 'A comprehensive guide to the Kenyan Constitution', sw: 'Mwongozo kamili wa Katiba ya Kenya', ksl: 'A comprehensive guide to the Kenyan Constitution', br: '⠁ ⠉⠕⠍⠏⠗⠑⠓⠑⠝⠎⠊⠧⠑ ⠛⠥⠊⠙⠑ ⠞⠕ ⠞⠓⠑ ⠅⠑⠝⠽⠁⠝ ⠉⠕⠝⠎⠞⠊⠞⠥⠞⠊⠕⠝' },
  'How laws are made in Kenya': { en: 'How laws are made in Kenya', sw: 'Jinsi sheria zinavyotengenezwa nchini Kenya', ksl: 'How laws are made in Kenya', br: '⠓⠕⠺ ⠇⠁⠺⠎ ⠁⠗⠑ ⠍⠁⠙⠑ ⠊⠝ ⠅⠑⠝⠽⠁' },
  'Your rights as a Kenyan citizen': { en: 'Your rights as a Kenyan citizen', sw: 'Haki zako kama raia wa Kenya', ksl: 'Your rights as a Kenyan citizen', br: '⠽⠕⠥⠗ ⠗⠊⠛⠓⠞⠎ ⠁⠎ ⠁ ⠅⠑⠝⠽⠁⠝ ⠉⠊⠞⠊⠵⠑⠝' },
  'constitution': { en: 'Constitution', sw: 'Katiba', ksl: 'Constitution', br: '⠉⠕⠝⠎⠞⠊⠞⠥⠞⠊⠕⠝' },
  'lawmaking': { en: 'Lawmaking', sw: 'Uundaji wa Sheria', ksl: 'Lawmaking', br: '⠇⠁⠺⠍⠁⠅⠊⠝⠛' },
  'rights': { en: 'Rights', sw: 'Haki', ksl: 'Rights', br: '⠗⠊⠛⠓⠞⠎' },
  
  // PullToRefresh translations
  'Refreshing': { 
    en: 'Refreshing', 
    sw: 'Inabadilisha', 
    ksl: 'Refreshing', 
    br: '⠗⠑⠋⠗⠑⠎⠓⠊⠝⠛' 
  },
  'Updating content...': { 
    en: 'Updating content...', 
    sw: 'Inasasisha maudhui...', 
    ksl: 'Updating content...', 
    br: '⠥⠏⠙⠁⠞⠊⠝⠛ ⠉⠕⠝⠞⠑⠝⠞...' 
  },

  // Settings
  'Manage your account and preferences': { 
    en: 'Manage your account and preferences', 
    sw: 'Dhibiti akaunti yako na mapendeleo', 
    ksl: 'Manage your account and preferences', 
    br: '⠍⠁⠝⠁⠛⠑ ⠽⠕⠥⠗ ⠁⠉⠉⠕⠥⠝⠞ ⠁⠝⠙ ⠏⠗⠑⠋⠑⠗⠑⠝⠉⠑⠎' 
  },
  'Profile Information': { 
    en: 'Profile Information', 
    sw: 'Taarifa za Wasifu', 
    ksl: 'Profile Information', 
    br: '⠏⠗⠕⠋⠊⠇⠑ ⠊⠝⠋⠕⠗⠍⠁⠞⠊⠕⠝' 
  },
  'Change Password': { 
    en: 'Change Password', 
    sw: 'Badilisha Nenosiri', 
    ksl: 'Change Password', 
    br: '⠉⠓⠁⠝⠛⠑ ⠏⠁⠎⠎⠺⠕⠗⠙' 
  },
  'Save Changes': { 
    en: 'Save Changes', 
    sw: 'Hifadhi Mabadiliko', 
    ksl: 'Save Changes', 
    br: '⠎⠁⠧⠑ ⠉⠓⠁⠝⠛⠑⠎' 
  },
  'Danger Zone': { 
    en: 'Danger Zone', 
    sw: 'Eneo Hatari', 
    ksl: 'Danger Zone', 
    br: '⠙⠁⠝⠛⠑⠗ ⠵⠕⠝⠑' 
  },
  'Delete Account': { 
    en: 'Delete Account', 
    sw: 'Futa Akaunti', 
    ksl: 'Delete Account', 
    br: '⠙⠑⠇⠑⠞⠑ ⠁⠉⠉⠕⠥⠝⠞' 
  },
  
  // Featured Legislation
  'Featured Legislation': { 
    en: 'Featured Legislation', 
    sw: 'Sheria Zilizotangazwa', 
    ksl: 'Featured Legislation', 
    br: '⠋⠑⠁⠞⠥⠗⠑⠙ ⠇⠑⠛⠊⠎⠇⠁⠞⠊⠕⠝' 
  },
  'Track key bills and policies currently under consideration': { 
    en: 'Track key bills and policies currently under consideration', 
    sw: 'Fuatilia miswada na sera muhimu zinazoshughulikiwa kwa sasa', 
    ksl: 'Track key bills and policies currently under consideration', 
    br: '⠞⠗⠁⠉⠅ ⠅⠑⠽ ⠃⠊⠇⠇⠎ ⠁⠝⠙ ⠏⠕⠇⠊⠉⠊⠑⠎ ⠉⠥⠗⠗⠑⠝⠞⠇⠽ ⠥⠝⠙⠑⠗ ⠉⠕⠝⠎⠊⠙⠑⠗⠁⠞⠊⠕⠝' 
  },
  'View all legislation': { 
    en: 'View all legislation', 
    sw: 'Tazama sheria zote', 
    ksl: 'View all legislation', 
    br: '⠧⠊⠑⠺ ⠁⠇⠇ ⠇⠑⠛⠊⠎⠇⠁⠞⠊⠕⠝' 
  },
  'followers': { 
    en: 'followers', 
    sw: 'wafuasi', 
    ksl: 'followers', 
    br: '⠋⠕⠇⠇⠕⠺⠑⠗⠎' 
  },
  'Track this bill': { 
    en: 'Track this bill', 
    sw: 'Fuatilia mswada huu', 
    ksl: 'Track this bill', 
    br: '⠞⠗⠁⠉⠅ ⠞⠓⠊⠎ ⠃⠊⠇⠇' 
  },
  'Notification Preferences': { 
    en: 'Notification Preferences', 
    sw: 'Mapendeleo ya Arifa', 
    ksl: 'Notification Preferences', 
    br: '⠝⠕⠞⠊⠋⠊⠉⠁⠞⠊⠕⠝ ⠏⠗⠑⠋⠑⠗⠑⠝⠉⠑⠎' 
  },
  'Choose which notifications you want to receive': { 
    en: 'Choose which notifications you want to receive', 
    sw: 'Chagua arifa unazopendelea kupokea', 
    ksl: 'Choose which notifications you want to receive', 
    br: '⠉⠓⠕⠕⠎⠑ ⠺⠓⠊⠉⠓ ⠝⠕⠞⠊⠋⠊⠉⠁⠞⠊⠕⠝⠎ ⠽⠕⠥ ⠺⠁⠝⠞ ⠞⠕ ⠗⠑⠉⠑⠊⠧⠑' 
  },
  'Enable All Notifications': { 
    en: 'Enable All Notifications', 
    sw: 'Wezesha Arifa Zote', 
    ksl: 'Enable All Notifications', 
    br: '⠑⠝⠁⠃⠇⠑ ⠁⠇⠇ ⠝⠕⠞⠊⠋⠊⠉⠁⠞⠊⠕⠝⠎' 
  },
  'Receive all system notifications': { 
    en: 'Receive all system notifications', 
    sw: 'Pokea arifa zote za mfumo', 
    ksl: 'Receive all system notifications', 
    br: '⠗⠑⠉⠑⠊⠧⠑ ⠁⠇⠇ ⠎⠽⠎⠞⠑⠍ ⠝⠕⠞⠊⠋⠊⠉⠁⠞⠊⠕⠝⠎' 
  },
  'Your notification preferences have been updated.': { 
    en: 'Your notification preferences have been updated.', 
    sw: 'Mapendeleo yako ya arifa yamebadilishwa.', 
    ksl: 'Your notification preferences have been updated.', 
    br: '⠽⠕⠥⠗ ⠝⠕⠞⠊⠋⠊⠉⠁⠞⠊⠕⠝ ⠏⠗⠑⠋⠑⠗⠑⠝⠉⠑⠎ ⠓⠁⠧⠑ ⠃⠑⠑⠝ ⠥⠏⠙⠁⠞⠑⠙' 
  },
  'Manage how you receive notifications': { 
    en: 'Manage how you receive notifications', 
    sw: 'Simamia jinsi unavyopokea arifa', 
    ksl: 'Manage how you receive notifications', 
    br: '⠍⠁⠝⠁⠛⠑ ⠓⠕⠺ ⠽⠕⠥ ⠗⠑⠉⠑⠊⠧⠑ ⠝⠕⠞⠊⠋⠊⠉⠁⠞⠊⠕⠝⠎' 
  },
  'Notification Types': { 
    en: 'Notification Types', 
    sw: 'Aina za Arifa', 
    ksl: 'Notification Types', 
    br: '⠝⠕⠞⠊⠋⠊⠉⠁⠞⠊⠕⠝ ⠞⠽⠏⠑⠎' 
  },
  'Select the types of notifications you want to receive': { 
    en: 'Select the types of notifications you want to receive', 
    sw: 'Chagua aina za arifa unazopendelea kupokea', 
    ksl: 'Select the types of notifications you want to receive', 
    br: '⠎⠑⠇⠑⠉⠞ ⠞⠓⠑ ⠞⠽⠏⠑⠎ ⠕⠋ ⠝⠕⠞⠊⠋⠊⠉⠁⠞⠊⠕⠝⠎ ⠽⠕⠥ ⠺⠁⠝⠞ ⠞⠕ ⠗⠑⠉⠑⠊⠧⠑' 
  },
};

export function getTranslation(key: string, language: Language): string {
  if (translations[key] && translations[key][language]) {
    return translations[key][language]
  }
  // Fallback to English if translation not found
  return translations[key]?.en || key
    return text;
  }
