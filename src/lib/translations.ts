
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
  'Change Language': { en: 'Change Language', sw: 'Badilisha Lugha' },
  'Languages': { en: 'Languages', sw: 'Lugha' },
  
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
  
  // Resource Hub
  'Educational materials on civic rights, governance, and public participation': { 
    en: 'Educational materials on civic rights, governance, and public participation', 
    sw: 'Vifaa vya elimu kuhusu haki za kiraia, utawala, na ushiriki wa umma' 
  },
  'Submit Resource': { en: 'Submit Resource', sw: 'Wasilisha Rasilimali' },
  'My Submissions': { en: 'My Submissions', sw: 'Mawasilisho Yangu' },
  'Search resources...': { en: 'Search resources...', sw: 'Tafuta rasilimali...' },
  'Browse all resources': { en: 'Browse all resources', sw: 'Vinjari rasilimali zote' },
  'All Opportunities': { en: 'All Opportunities', sw: 'Fursa Zote' },
  'Local': { en: 'Local', sw: 'Za Ndani' },
  'Grassroots': { en: 'Grassroots', sw: 'Za Chini' },
  'Online': { en: 'Online', sw: 'Mtandaoni' },
  'Load More': { en: 'Load More', sw: 'Pakua Zaidi' },
  'No Resources Found': { en: 'No Resources Found', sw: 'Hakuna Rasilimali Zilizopatikana' },
  'View All Resources': { en: 'View All Resources', sw: 'Tazama Rasilimali Zote' },
  'Download started': { en: 'Download started', sw: 'Upakuaji umeanza' },
  'Your download has begun.': { en: 'Your download has begun.', sw: 'Upakuaji wako umeanza.' },
  'Link copied': { en: 'Link copied', sw: 'Kiungo kimenakiliwa' },
  'Resource link copied to clipboard': { en: 'Resource link copied to clipboard', sw: 'Kiungo cha rasilimali kimenakiliwa kwenye ubao' },
  'Download Resources for Offline Access': { en: 'Download Resources for Offline Access', sw: 'Pakua Rasilimali kwa Matumizi ya Nje ya Mtandao' },
  'Save resources to your device for access even when you\'re offline. Perfect for areas with limited connectivity.': { 
    en: 'Save resources to your device for access even when you\'re offline. Perfect for areas with limited connectivity.', 
    sw: 'Hifadhi rasilimali kwenye kifaa chako ili kufikia hata ukiwa nje ya mtandao. Inafaa kwa maeneo yenye uhusiano mdogo.' 
  },
  'Download Selected Resources': { en: 'Download Selected Resources', sw: 'Pakua Rasilimali Zilizochaguliwa' },
  
  // Home page
  'Empowering Citizens through': { en: 'Empowering Citizens through', sw: 'Kuwezesha Wananchi kupitia' },
  'Civic Education': { en: 'Civic Education', sw: 'Elimu ya Uraia' },
  'Access civic knowledge, track legislation, and participate in building a better Kenya.': { 
    en: 'Access civic knowledge, track legislation, and participate in building a better Kenya.', 
    sw: 'Pata maarifa ya kiraia, fuatilia sheria, na shiriki katika kujenga Kenya bora.' 
  },
  'Explore Resources': { en: 'Explore Resources', sw: 'Chunguza Rasilimali' },
  'Track Legislation': { en: 'Track Legislation', sw: 'Fuatilia Sheria' },
  'Educational Resources': { en: 'Educational Resources', sw: 'Rasilimali za Elimu' },
  'Learn about governance, rights, and civic processes.': { 
    en: 'Learn about governance, rights, and civic processes.', 
    sw: 'Jifunze kuhusu utawala, haki, na michakato ya kiraia.' 
  },
  'Community Forum': { en: 'Community Forum', sw: 'Jukwaa la Jamii' },
  'Connect and discuss civic matters with other citizens.': { 
    en: 'Connect and discuss civic matters with other citizens.', 
    sw: 'Unganisha na ujadili masuala ya kiraia na wananchi wengine.' 
  },
  'Legislative Updates': { en: 'Legislative Updates', sw: 'Masasisho ya Kisheria' },
  'Stay informed about bills and legal changes.': { 
    en: 'Stay informed about bills and legal changes.', 
    sw: 'Endelea kupata taarifa kuhusu miswada na mabadiliko ya kisheria.' 
  },
  'Find opportunities to make a difference.': { 
    en: 'Find opportunities to make a difference.', 
    sw: 'Pata fursa za kuleta tofauti.' 
  },
  
  // Featured Legislation
  'Featured Legislation': { en: 'Featured Legislation', sw: 'Sheria Zilizoangaziwa' },
  'Stay informed about important bills moving through the legislative process': { 
    en: 'Stay informed about important bills moving through the legislative process', 
    sw: 'Endelea kupata taarifa kuhusu miswada muhimu inayopitia mchakato wa kutunga sheria' 
  },
  'View all bills': { en: 'View all bills', sw: 'Tazama miswada yote' },
  'First Reading': { en: 'First Reading', sw: 'Kusomwa kwa Mara ya Kwanza' },
  'Public Feedback': { en: 'Public Feedback', sw: 'Maoni ya Umma' },
  'Committee Review': { en: 'Committee Review', sw: 'Ukaguzi wa Kamati' },
  'Education': { en: 'Education', sw: 'Elimu' },
  'Health': { en: 'Health', sw: 'Afya' },
  'Technology': { en: 'Technology', sw: 'Teknolojia' },
  'Last updated:': { en: 'Last updated:', sw: 'Ilisasishwa mwisho:' },
  
  // Community Discussion
  'Community Discussions': { en: 'Community Discussions', sw: 'Mijadala ya Jamii' },
  'Join conversations on civic issues affecting Kenyans': { 
    en: 'Join conversations on civic issues affecting Kenyans', 
    sw: 'Jiunge na mazungumzo kuhusu masuala ya kiraia yanayoathiri Wakenya' 
  },
  'View all discussions': { en: 'View all discussions', sw: 'Tazama mijadala yote' },
  'replies': { en: 'replies', sw: 'majibu' },
  'likes': { en: 'likes', sw: 'shavuni' },
  'Read more': { en: 'Read more', sw: 'Soma zaidi' },
  'Join Our Community': { en: 'Join Our Community', sw: 'Jiunge na Jamii Yetu' },
  'Connect with like-minded citizens passionate about civic education and making a difference in Kenya.': { 
    en: 'Connect with like-minded citizens passionate about civic education and making a difference in Kenya.', 
    sw: 'Unganisha na wananchi wenye nia sawa wenye shauku ya elimu ya uraia na kuleta tofauti nchini Kenya.' 
  },
  'Join Now': { en: 'Join Now', sw: 'Jiunge Sasa' },
  
  // Volunteer
  'Volunteer Opportunities': { en: 'Volunteer Opportunities', sw: 'Fursa za Kujitolea' },
  'Make a difference in your community through civic engagement': { 
    en: 'Make a difference in your community through civic engagement', 
    sw: 'Fanya tofauti katika jamii yako kupitia ushiriki wa kiraia' 
  },
  'Search & Filter': { en: 'Search & Filter', sw: 'Tafuta & Chuja' },
  'Search opportunities...': { en: 'Search opportunities...', sw: 'Tafuta fursa...' },
  'Location': { en: 'Location', sw: 'Eneo' },
  'All Locations': { en: 'All Locations', sw: 'Maeneo Yote' },
  'Nairobi': { en: 'Nairobi', sw: 'Nairobi' },
  'Mombasa': { en: 'Mombasa', sw: 'Mombasa' },
  'Kisumu': { en: 'Kisumu', sw: 'Kisumu' },
  'Remote': { en: 'Remote', sw: 'Mbali' },
  'Commitment': { en: 'Commitment', sw: 'Ahadi' },
  'All Commitments': { en: 'All Commitments', sw: 'Ahadi Zote' },
  'One-time': { en: 'One-time', sw: 'Mara Moja' },
  'Short-term': { en: 'Short-term', sw: 'Muda Mfupi' },
  'Recurring': { en: 'Recurring', sw: 'Inayojirudia' },
  'Ongoing': { en: 'Ongoing', sw: 'Inaendelea' },
  'Skills': { en: 'Skills', sw: 'Ujuzi' },
  'All Skills': { en: 'All Skills', sw: 'Ujuzi Wote' },
  'Public Speaking': { en: 'Public Speaking', sw: 'Kuongea Hadharani' },
  'Research': { en: 'Research', sw: 'Utafiti' },
  'Communication': { en: 'Communication', sw: 'Mawasiliano' },
  'Content Creation': { en: 'Content Creation', sw: 'Uundaji wa Maudhui' },
  'Apply Filters': { en: 'Apply Filters', sw: 'Tumia Vichujio' },
  'Volunteer Resources': { en: 'Volunteer Resources', sw: 'Rasilimali za Kujitolea' },
  'Volunteer Guide & Best Practices': { en: 'Volunteer Guide & Best Practices', sw: 'Mwongozo wa Kujitolea & Mazoea Bora' },
  'Safety Guidelines': { en: 'Safety Guidelines', sw: 'Miongozo ya Usalama' },
  'Measuring Your Impact': { en: 'Measuring Your Impact', sw: 'Kupima Athari Yako' },
  'Apply Now': { en: 'Apply Now', sw: 'Omba Sasa' },
  'Have a Volunteering Opportunity to Share?': { en: 'Have a Volunteering Opportunity to Share?', sw: 'Una Fursa ya Kujitolea ya Kushiriki?' },
  'If your organization is looking for volunteers for civic engagement activities, please submit your opportunity to be listed on our platform.': { 
    en: 'If your organization is looking for volunteers for civic engagement activities, please submit your opportunity to be listed on our platform.', 
    sw: 'Ikiwa shirika lako linatafuta watu wa kujitolea kwa shughuli za ushiriki wa kiraia, tafadhali wasilisha fursa yako ili kuorodheshwa kwenye jukwaa letu.' 
  },
  'Submit an Opportunity': { en: 'Submit an Opportunity', sw: 'Wasilisha Fursa' },

  // User profile
  'Your Profile': { en: 'Your Profile', sw: 'Wasifu Wako' },
  'Manage your account details': { en: 'Manage your account details', sw: 'Dhibiti maelezo ya akaunti yako' },
  'Email': { en: 'Email', sw: 'Barua pepe' },
  'Username': { en: 'Username', sw: 'Jina la mtumiaji' },
  'Full Name': { en: 'Full Name', sw: 'Jina Kamili' },
  'Updating...': { en: 'Updating...', sw: 'Inasasisha...' },
  'Update Profile': { en: 'Update Profile', sw: 'Sasisha Wasifu' },
  'Sign Out': { en: 'Sign Out', sw: 'Toka' },
  'Success!': { en: 'Success!', sw: 'Mafanikio!' },
  'Your profile has been updated.': { en: 'Your profile has been updated.', sw: 'Wasifu wako umesasishwa.' },
  'Error updating profile': { en: 'Error updating profile', sw: 'Hitilafu katika kusasisha wasifu' },
  'Loading...': { en: 'Loading...', sw: 'Inapakia...' },

  // Resource Upload
  'Upload New Resource': { en: 'Upload New Resource', sw: 'Pakia Rasilimali Mpya' },
  'Resource Title': { en: 'Resource Title', sw: 'Kichwa cha Rasilimali' },
  'Choose a clear, descriptive title for your resource': { 
    en: 'Choose a clear, descriptive title for your resource', 
    sw: 'Chagua kichwa wazi, cha kuelezea kwa rasilimali yako' 
  },
  'Description': { en: 'Description', sw: 'Maelezo' },
  'Provide a detailed description of the resource...': { 
    en: 'Provide a detailed description of the resource...', 
    sw: 'Toa maelezo ya kina ya rasilimali...' 
  },
  'Explain what users will learn from this resource': { 
    en: 'Explain what users will learn from this resource', 
    sw: 'Eleza watumiaji watajifunza nini kutoka kwa rasilimali hii' 
  },
  'Category': { en: 'Category', sw: 'Kategoria' },
  'Select a category': { en: 'Select a category', sw: 'Chagua kategoria' },
  'Rights': { en: 'Rights', sw: 'Haki' },
  'Governance': { en: 'Governance', sw: 'Utawala' },
  'Participation': { en: 'Participation', sw: 'Ushiriki' },
  'Elections': { en: 'Elections', sw: 'Uchaguzi' },
  'Judiciary': { en: 'Judiciary', sw: 'Mahakama' },
  'Resource Type': { en: 'Resource Type', sw: 'Aina ya Rasilimali' },
  'Select resource type': { en: 'Select resource type', sw: 'Chagua aina ya rasilimali' },
  'PDF Document': { en: 'PDF Document', sw: 'Hati ya PDF' },
  'Infographic': { en: 'Infographic', sw: 'Mchoro wa Habari' },
  'Resource URL': { en: 'Resource URL', sw: 'URL ya Rasilimali' },
  'Provide a direct link to your resource (document, video, or infographic)': { 
    en: 'Provide a direct link to your resource (document, video, or infographic)', 
    sw: 'Toa kiungo cha moja kwa moja kwa rasilimali yako (hati, video, au mchoro wa habari)' 
  },
  'Submission Guidelines': { en: 'Submission Guidelines', sw: 'Miongozo ya Kuwasilisha' },
  'All resources are reviewed before being published. Please ensure your submission:': { 
    en: 'All resources are reviewed before being published. Please ensure your submission:', 
    sw: 'Rasilimali zote hukaguliwa kabla ya kuchapishwa. Tafadhali hakikisha kuwasilisha kwako:' 
  },
  'Contains accurate information about Kenya\'s civic processes': { 
    en: 'Contains accurate information about Kenya\'s civic processes', 
    sw: 'Ina habari sahihi kuhusu michakato ya kiraia ya Kenya' 
  },
  'Is clearly written and educational in nature': { 
    en: 'Is clearly written and educational in nature', 
    sw: 'Imeandikwa wazi na ya kielimu kwa asili' 
  },
  'Respects copyright and properly cites any sources': { 
    en: 'Respects copyright and properly cites any sources', 
    sw: 'Heshimu hakimiliki na taja vyanzo vyovyote ipasavyo' 
  },
  'Does not contain offensive or inappropriate content': { 
    en: 'Does not contain offensive or inappropriate content', 
    sw: 'Haina maudhui ya kukera au yasiyofaa' 
  },
  'Submit for Approval': { en: 'Submit for Approval', sw: 'Wasilisha kwa Idhini' },
  'Resource submitted': { en: 'Resource submitted', sw: 'Rasilimali imewasilishwa' },
  'Your resource has been submitted for approval.': { 
    en: 'Your resource has been submitted for approval.', 
    sw: 'Rasilimali yako imewasilishwa kwa idhini.' 
  },
  'Authentication required': { en: 'Authentication required', sw: 'Uthibitishaji unahitajika' },
  'Please sign in to upload resources': { 
    en: 'Please sign in to upload resources', 
    sw: 'Tafadhali ingia ili kupakia rasilimali' 
  },

  // Pending Resources
  'Pending Resources': { en: 'Pending Resources', sw: 'Rasilimali Zinazongojea' },
  'Resources you\'ve submitted that are awaiting approval': { 
    en: 'Resources you\'ve submitted that are awaiting approval', 
    sw: 'Rasilimali ulizotuma zinazongojea idhini' 
  },
  'Submit New Resource': { en: 'Submit New Resource', sw: 'Wasilisha Rasilimali Mpya' },
  'No Pending Submissions': { en: 'No Pending Submissions', sw: 'Hakuna Mawasilisho Yanayosubiri' },
  'You haven\'t submitted any resources for approval yet.': { 
    en: 'You haven\'t submitted any resources for approval yet.', 
    sw: 'Hujawasilisha rasilimali zozote kwa idhini bado.' 
  },
  'Submit a Resource': { en: 'Submit a Resource', sw: 'Wasilisha Rasilimali' },
  'Awaiting Approval': { en: 'Awaiting Approval', sw: 'Inasubiri Idhini' },
  'Submitted on': { en: 'Submitted on', sw: 'Iliwasilishwa mnamo' },
  'Note:': { en: 'Note:', sw: 'Dokezo:' },
  'Resources are typically reviewed within 2-3 business days.': { 
    en: 'Resources are typically reviewed within 2-3 business days.', 
    sw: 'Rasilimali kawaida hukaguliwa ndani ya siku 2-3 za kazi.' 
  },
  'Resource Approval Process': { en: 'Resource Approval Process', sw: 'Mchakato wa Kuidhinisha Rasilimali' },
  'All submitted resources go through our approval process to ensure quality and accuracy:': { 
    en: 'All submitted resources go through our approval process to ensure quality and accuracy:', 
    sw: 'Rasilimali zote zilizowasilishwa hupitia mchakato wetu wa idhini ili kuhakikisha ubora na usahihi:' 
  },
  'Our team reviews the resource for accuracy and educational value': { 
    en: 'Our team reviews the resource for accuracy and educational value', 
    sw: 'Timu yetu inakagua rasilimali kwa usahihi na thamani ya kielimu' 
  },
  'Resources that meet our guidelines are approved and published': { 
    en: 'Resources that meet our guidelines are approved and published', 
    sw: 'Rasilimali zinazokidhi miongozo yetu huthibitishwa na kuchapishwa' 
  },
  'You\'ll receive a notification when your resource status changes': { 
    en: 'You\'ll receive a notification when your resource status changes', 
    sw: 'Utapokea arifa wakati hali ya rasilimali yako inabadilika' 
  },
  'Approved resources become available in the public Resource Hub': { 
    en: 'Approved resources become available in the public Resource Hub', 
    sw: 'Rasilimali zilizoidhinishwa hupatikana katika Kitovu cha Rasilimali cha umma' 
  },
  'Authentication Required': { en: 'Authentication Required', sw: 'Uthibitishaji Unahitajika' },
  'Please sign in to view your pending resource submissions.': { 
    en: 'Please sign in to view your pending resource submissions.', 
    sw: 'Tafadhali ingia ili kuona mawasilisho yako ya rasilimali yanayosubiri.' 
  },

  // Footer
  'Empowering Kenyan citizens with civic knowledge and tools for meaningful participation.': {
    en: 'Empowering Kenyan citizens with civic knowledge and tools for meaningful participation.',
    sw: 'Kuwezesha wananchi wa Kenya kwa maarifa ya kiraia na zana za ushiriki wenye maana.'
  },
  'Quick Links': { en: 'Quick Links', sw: 'Viungo vya Haraka' },
  'All rights reserved.': { en: 'All rights reserved.', sw: 'Haki zote zimehifadhiwa.' },
  'Privacy Policy': { en: 'Privacy Policy', sw: 'Sera ya Faragha' },
  'Terms of Service': { en: 'Terms of Service', sw: 'Masharti ya Huduma' },

  // Resource Details
  'Back to Resources': { en: 'Back to Resources', sw: 'Rudi kwa Rasilimali' },
  'views': { en: 'views', sw: 'maoni' },
  'Added': { en: 'Added', sw: 'Imeongezwa' },
  'Preview PDF document': { en: 'Preview PDF document', sw: 'Hakiki hati ya PDF' },
  'Preview infographic': { en: 'Preview infographic', sw: 'Hakiki mchoro wa habari' },
  'Download': { en: 'Download', sw: 'Pakua' },
  'Share': { en: 'Share', sw: 'Shiriki' },
  'About this Resource': { en: 'About this Resource', sw: 'Kuhusu Rasilimali Hii' },
  'This': { en: 'This', sw: 'Hii' },
  'provides information about': { en: 'provides information about', sw: 'inatoa habari kuhusu' },
  'in Kenya. It is part of our civic education materials designed to help citizens understand their rights and responsibilities.': {
    en: 'in Kenya. It is part of our civic education materials designed to help citizens understand their rights and responsibilities.',
    sw: 'nchini Kenya. Ni sehemu ya vifaa vyetu vya elimu ya uraia vilivyoundwa kusaidia wananchi kuelewa haki na majukumu yao.'
  },
  'Resource Information': { en: 'Resource Information', sw: 'Habari za Rasilimali' },
  'Type:': { en: 'Type:', sw: 'Aina:' },
  'Category:': { en: 'Category:', sw: 'Kategoria:' },
  'Added on:': { en: 'Added on:', sw: 'Iliongezwa mnamo:' },
  'Last updated:': { en: 'Last updated:', sw: 'Ilisasishwa mwisho:' },
  'Related Resources': { en: 'Related Resources', sw: 'Rasilimali Zinazohusiana' },
  'Resource Not Found': { en: 'Resource Not Found', sw: 'Rasilimali Haijapatikana' },
  'The resource you\'re looking for doesn\'t exist or has been removed.': {
    en: 'The resource you\'re looking for doesn\'t exist or has been removed.',
    sw: 'Rasilimali unayotafuta haipo au imeondolewa.'
  }
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
