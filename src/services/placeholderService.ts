/**
 * Intelligent Placeholder Engine - PRO VERSION
 * 
 * Maps thousands of potential civic/social/legal keywords to premium fallbacks.
 * Uses a weighted scoring system for best-fit selection.
 */

export type PlaceholderType = 'legal' | 'governance' | 'community' | 'constitution';

interface PlaceholderConfig {
    url: string;
    label: string;
    tags: string[];
}

const PLACEHOLDER_MAPPING: Record<PlaceholderType, PlaceholderConfig> = {
    constitution: {
        url: '4.png',
        label: 'Constitution & Rights',
        tags: [
            'constitution', 'rights', 'bill of rights', 'justice', 'charter', 'sovereignty',
            'freedom', 'liberty', 'amendment', 'bbi', 'referendum', 'katiba', 'preamble',
            'judiciary', 'bench', 'supremacy', 'devolution', 'chapters', 'schedules',
            'fundamental', 'civil liberties', 'protests', 'activism', 'civic space',
            'human rights', 'equality', 'equity', 'rule of law', 'constitutionalism',
            'national accord', 'sovereign', 'citizen rights', 'legal framework', 'democracy',
            'protection', 'enforcement', 'articles', 'section', 'clause', 'presidential',
            'judgement', 'ruling', 'verdict', 'bench', 'magistrate'
        ]
    },
    governance: {
        url: '5.png',
        label: 'Governance & Politics',
        tags: [
            'governance', 'politics', 'elections', 'parliament', 'senate', 'county', 'mca',
            'governor', 'president', 'cabinet', 'policy', 'state', 'government', 'iebc',
            'eacc', 'dci', 'audit', 'transparency', 'accountability', 'leadership',
            'integrity', 'public finance', 'budget', 'debt', 'imf', 'world bank', 'taxes',
            'finance bill', 'kra', 'revenue', 'spending', 'infrastructure', 'manifesto',
            'diplomacy', 'foreign policy', 'vetting', 'appointments', 'hansard',
            'standing orders', 'legislation', 'proclamation', 'decree', 'executive',
            'legislature', 'assembly', 'devolution', 'ward', 'constituency', 'polling'
        ]
    },
    legal: {
        url: '6.png',
        label: 'Law & Litigation',
        tags: [
            'law', 'litigation', 'court', 'case', 'suit', 'petition', 'affidavit', 'summon',
            'witness', 'accused', 'defender', 'prosecutor', 'lsk', 'advocate', 'lawyer',
            'magistrate', 'high court', 'supreme court', 'appeals', 'magistrate', 'dispute',
            'arbitration', 'mediation', 'damages', 'injunction', 'stay order', 'contempt',
            'bail', 'bond', 'jail', 'prison', 'penal code', 'evidence', 'forensics',
            'cybercrime', 'tort', 'contract', 'land law', 'family law', 'succession',
            'probate', 'conveyancing', 'intellectual property', 'commercial law', 'criminal',
            'defense', 'testimony', 'trial', 'hearing', 'chambers', 'bar'
        ]
    },
    community: {
        url: '7.png',
        label: 'Community & Engagement',
        tags: [
            'community', 'engagement', 'participation', 'youth', 'volunteers', 'civic',
            'discussion', 'voice', 'dialogue', 'townhall', 'baraza', 'neighborhood',
            'grassroots', 'mobilization', 'campaign', 'awareness', 'education', 'training',
            'workshop', 'seminar', 'webinar', 'resource', 'hub', 'collective', 'synergy',
            'mutual aid', 'welfare', 'harambee', 'resilience', 'sustainability', 'environment',
            'health', 'sanitation', 'schools', 'tvet', 'university', 'social justice',
            'empowerment', 'advocacy', 'lobbying', 'network', 'coalition', 'unity',
            'peace', 'reconciliation', 'safety', 'security', 'welfare', 'village'
        ]
    }
};

// Base path for public assets bucket (routed through Supabase Edge Function Proxy for Private Buckets)
const PUBLIC_ASSETS_BASE = 'https://cajrvemigxghnfmyopiy.supabase.co/functions/v1/b2-proxy?path=placeholders/';

export const placeholderService = {
    /**
     * Get the best placeholder URL based on tags using a weighted scoring system
     */
    getPlaceholderByTags(tags: string[] = []): string {
        if (!tags || tags.length === 0) return this.getPlaceholderByType('community');

        const normalizedTags = tags.map(t => t.toLowerCase().trim());

        const scores: Record<PlaceholderType, number> = {
            constitution: 0,
            governance: 0,
            legal: 0,
            community: 0
        };

        for (const [type, config] of Object.entries(PLACEHOLDER_MAPPING)) {
            const pType = type as PlaceholderType;

            normalizedTags.forEach(userTag => {
                config.tags.forEach(standardTag => {
                    // Exact match = 10 pts
                    if (userTag === standardTag) {
                        scores[pType] += 10;
                    }
                    // Partial match = 3 pts
                    else if (userTag.includes(standardTag) || standardTag.includes(userTag)) {
                        scores[pType] += 3;
                    }
                });
            });
        }

        // Find type with highest score
        let bestMatch: PlaceholderType = 'community';
        let maxScore = -1;

        for (const [type, score] of Object.entries(scores)) {
            if (score > maxScore) {
                maxScore = score;
                bestMatch = type as PlaceholderType;
            }
        }

        // If no score, default to community
        if (maxScore === 0) bestMatch = 'community';

        console.log(`[PlaceholderEngine] Selected: ${bestMatch} (score: ${maxScore}) for tags:`, tags);
        return `${PUBLIC_ASSETS_BASE}${PLACEHOLDER_MAPPING[bestMatch].url}`;
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
