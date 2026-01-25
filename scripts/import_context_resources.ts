import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Factual data from @context files (simulated here based on prompt description)
 */
const CANONICAL_RESOURCES = [
    {
        title: "The Constitution of Kenya 2010",
        description: "The supreme law of the Republic of Kenya.",
        type: "PDF",
        url: "https://www.klrc.go.ke/index.php/constitution-of-kenya",
        category: "Legal"
    },
    {
        title: "Civic Education Handbook",
        description: "Comprehensive guide to civic duties and rights in Kenya.",
        type: "Document",
        url: "https://example.com/handbook.pdf",
        category: "Education"
    }
];

const CANONICAL_CHAPTERS = [
    { name: "Nairobi Chapter", slug: "nairobi", county: "Nairobi", description: "The central hub for civic action." },
    { name: "Mombasa Chapter", slug: "mombasa", county: "Mombasa", description: "Advancing governance at the coast." },
    { name: "Kisumu Chapter", slug: "kisumu", county: "Kisumu", description: "Lakeside engagement for accountability." }
];

async function importResources() {
    console.log("Starting resource import...");

    for (const res of CANONICAL_RESOURCES) {
        const { error } = await supabase
            .from('resources')
            .upsert(res, { onConflict: 'title' });

        if (error) console.error(`Error importing ${res.title}:`, error.message);
        else console.log(`Imported: ${res.title}`);
    }
}

async function importChapters() {
    console.log("Starting chapter import...");

    for (const chapter of CANONICAL_CHAPTERS) {
        const { error } = await supabase
            .from('chapters')
            .upsert(chapter, { onConflict: 'slug' });

        if (error) console.error(`Error importing ${chapter.name}:`, error.message);
        else console.log(`Imported: ${chapter.name}`);
    }
}

async function main() {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error("Missing environment variables. Check .env");
        return;
    }

    await importResources();
    await importChapters();

    console.log("Import process completed.");
}

main().catch(console.error);
