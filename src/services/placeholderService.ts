/**
 * Intelligent Placeholder Engine - PRO VERSION
 * 
 * Maps thousands of potential civic/social/legal keywords to premium fallbacks.
 * Uses a weighted scoring system for best-fit selection.
 */

export type PlaceholderType = 'image' | 'infographics' | 'document' | 'pdf';

interface PlaceholderConfig {
    url: string;
    label: string;
    tags: string[];
}

const PLACEHOLDER_MAPPING: Record<PlaceholderType, PlaceholderConfig> = {
    image: {
        url: '4.png',
        label: 'Image / Visual',
        tags: [
            'image', 'photo', 'picture', 'visual', 'gallery', 'portrait', 'scenery',
            'photography', 'rendering', 'asset'
        ]
    },
    infographics: {
        url: '5.png',
        label: 'Infographics',
        tags: [
            'infographic', 'infographics', 'data', 'chart', 'graph', 'statistics',
            'viz', 'visualization', 'explainer', 'summary', 'breakdown'
        ]
    },
    document: {
        url: '6.png',
        label: 'Document',
        tags: [
            'document', 'doc', 'text', 'paper', 'manuscript', 'file', 'archive',
            'records', 'protocol', 'guidelines', 'handbook', 'manual', 'constitution'
        ]
    },
    pdf: {
        url: '7.png',
        label: 'PDF',
        tags: [
            'pdf', 'portable', 'adobe', 'scan', 'booklet', 'act',
            'rights', 'legislation', 'parliament', 'bills', 'legal', 'governance'
        ]
    }
};

// Base path for placeholders (using local public folder for immediate reliability)
const PUBLIC_ASSETS_BASE = '/placeholders/';

export const placeholderService = {
    /**
     * Get the best placeholder URL based on tags using a weighted scoring system
     * HIGHEST PRIORITY (STRICT): 
     * 4 = Image, 5 = Infographics, 6 = Document, 7 = PDF
     */
    getPlaceholderByTags(tags: string[] = [], resourceType: string = ''): string {
        const normalizedTags = (tags || []).map(t => t.toLowerCase().trim());
        const type = (resourceType || '').toLowerCase().trim();

        // 1. HIGHEST PRIORITY (Go Ham logic: enforce strict mapping)

        // 7 = PDF
        if (type === 'pdf' || normalizedTags.includes('pdf')) {
            return this.getPlaceholderByType('pdf'); // 7.png
        }

        // 6 = Document
        if (type === 'document' || type === 'doc' || normalizedTags.includes('document') || normalizedTags.includes('doc')) {
            return this.getPlaceholderByType('document'); // 6.png
        }

        // 5 = Infographics
        if (type === 'infographic' || type === 'infographics' || normalizedTags.includes('infographic') || normalizedTags.includes('infographics')) {
            return this.getPlaceholderByType('infographics'); // 5.png
        }

        // 4 = Image (fallback for visuals)
        if (type === 'image' || type === 'photo' || normalizedTags.includes('image') || normalizedTags.includes('photo')) {
            return this.getPlaceholderByType('image'); // 4.png
        }

        // 2. TAG SCORING SYSTEM (Fallback for ambiguous matches)
        if (normalizedTags.length === 0) return this.getPlaceholderByType('document');

        const scores: Record<PlaceholderType, number> = {
            image: 0,
            infographics: 0,
            document: 0,
            pdf: 0
        };

        for (const [pType, config] of Object.entries(PLACEHOLDER_MAPPING)) {
            const currentType = pType as PlaceholderType;

            normalizedTags.forEach(userTag => {
                config.tags.forEach(standardTag => {
                    // Exact match = 10 pts
                    if (userTag === standardTag) {
                        scores[currentType] += 10;
                    }
                    // Partial match = 3 pts
                    else if (userTag.includes(standardTag) || standardTag.includes(userTag)) {
                        scores[currentType] += 3;
                    }
                });
            });
        }

        // Find type with highest score
        let bestMatch: PlaceholderType = 'document';
        let maxScore = -1;

        for (const [pType, score] of Object.entries(scores)) {
            if (score > maxScore) {
                maxScore = score;
                bestMatch = pType as PlaceholderType;
            }
        }

        // If no score, default to document
        if (maxScore === 0) bestMatch = 'document';

        console.debug(`[PlaceholderEngine] Selected: ${bestMatch} (score: ${maxScore}) for type: ${type}, tags:`, tags);
        return this.getPlaceholderByType(bestMatch);
    },

    /**
     * Get placeholder by explicit type
     */
    getPlaceholderByType(type: PlaceholderType): string {
        return `${PUBLIC_ASSETS_BASE}${PLACEHOLDER_MAPPING[type].url}`;
    },

    /**
     * Get all available types
     */
    getAvailableTypes(): PlaceholderType[] {
        return Object.keys(PLACEHOLDER_MAPPING) as PlaceholderType[];
    }
};

export default placeholderService;
