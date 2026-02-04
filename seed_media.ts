/**
 * Seed Media Data Script
 * 
 * This script simulates the upload of the exhibits provided by the user.
 * It populates the media_content and media_items tables.
 */

import { mediaService } from './src/services/mediaService';
import { supabase } from './src/integrations/supabase/client';

async function seedExhibits() {
    console.log('🚀 Starting Seeding of exhibits...');

    // 1. Create the "Price of Compromise" Carousel/PDF Series
    const slug = 'price-of-compromise';
    const existing = await mediaService.getMediaContent(slug);

    if (existing) {
        console.log('✨ Content already exists, skipping creation.');
        return;
    }

    const content = await mediaService.createContent({
        type: 'carousel',
        title: 'The Price of Compromise',
        description: 'Corruption is perfected by our leaders but starts with you. A deep dive into the costs of compromise in Kenya.',
        slug: slug,
        status: 'published',
        metadata: {
            pdf_url: '/media/documents/The_Price_of_Compromise.pdf' // This would be the B2 URL
        }
    });

    if (!content) {
        console.error('❌ Failed to create content container');
        return;
    }

    console.log('✅ Created content container:', content.id);

    // 2. Simulate adding the Carousel Image (Exhibit 2)
    // Note: In a real environment, we'd use the file objects. 
    // Here we just insert the DB record to verify the frontend link.
    const { error: itemError } = await supabase
        .from('media_items')
        .insert([
            {
                content_id: content.id,
                type: 'image',
                file_path: 'media/carousel/2026/02/04/price-of-compromise/cover.png',
                file_url: 'https://placehold.co/800x800?text=Price+of+Compromise+1/8', // Placeholder for now
                order_index: 0,
                metadata: { alt: 'Title Slide' }
            },
            {
                content_id: content.id,
                type: 'image',
                file_path: 'media/carousel/2026/02/04/price-of-compromise/page-2.png',
                file_url: 'https://placehold.co/800x800?text=Corruption+Impact+2/8',
                order_index: 1,
                metadata: { alt: 'Impact Slide' }
            }
        ]);

    if (itemError) {
        console.error('❌ Failed to add media items:', itemError);
    } else {
        console.log('✅ Added test carousel items');
    }

    console.log('🎉 Seeding complete!');
}

// seedExhibits(); // Manual trigger
