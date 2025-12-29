export const searchConfig = {
  // Search debounce delay in milliseconds
  debounceDelay: 300,
  
  // Minimum characters before showing suggestions
  minCharsForSuggestions: 2,
  
  // Maximum suggestions to show
  maxSuggestions: 8,
  
  // Results per page
  resultsPerPage: 20,
  
  // Search types configuration
  types: {
    resources: {
      enabled: true,
      fields: ['title', 'description', 'category', 'tags']
    },
    bills: {
      enabled: true,
      fields: ['title', 'summary', 'description', 'category']
    },
    blogs: {
      enabled: true,
      fields: ['title', 'content', 'excerpt', 'tags']
    }
  },
  
  // Fallback configuration
  fallback: {
    enabled: true,
    suggestions: [
      'Kenyan Constitution',
      'Voting Process',
      'County Governments',
      'Public Participation',
      'Tax Obligations',
      'Land Rights',
      'Judicial System',
      'Youth Participation'
    ]
  }
};
