-- ==========================================================
-- B2 MEDIA MIGRATION SEED (FIXED)
-- Date: 2026-02-08
-- ==========================================================

-- 1. Ensure tags column exists in media_content
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='media_content' AND column_name='tags') THEN
        ALTER TABLE public.media_content ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
END $$;

DO $$ 
DECLARE
    v_gus_id UUID;
    v_poc_id UUID;
    v_b2_base TEXT := 'https://s3.eu-central-003.backblazeb2.com/ceka-resources-vault';
BEGIN 
    -- 1. GREEN UNDER SIEGE
    -- ------------------------------------------
    
    -- Insert container if not exists
    INSERT INTO public.media_content (id, type, title, description, slug, cover_url, status, metadata, tags)
    VALUES (
        gen_random_uuid(),
        'carousel',
        'Green Under Siege',
        'A Civic Education Kenya special on environmental protection and the impact of climate change in Kenya.',
        'green-under-siege',
        v_b2_base || '/carousels/green-under-siege/4.png',
        'published',
        json_build_object('pdf_url', v_b2_base || '/carousels/green-under-siege/green-under-siege.pdf'),
        ARRAY['environment', 'special-edition']
    )
    ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        cover_url = EXCLUDED.cover_url,
        metadata = EXCLUDED.metadata,
        tags = EXCLUDED.tags
    RETURNING id INTO v_gus_id;

    -- Clean up old items for GUS to avoid duplicates if re-running
    DELETE FROM public.media_items WHERE content_id = v_gus_id;

    -- Insert items for GUS
    -- Items 4 to 18
    FOR i IN 4..18 LOOP
        INSERT INTO public.media_items (content_id, type, file_path, file_url, order_index, metadata)
        VALUES (
            v_gus_id,
            'image',
            'carousels/green-under-siege/' || i || '.png',
            v_b2_base || '/carousels/green-under-siege/' || i || '.png',
            i - 4,
            json_build_object('aspect_ratio', '1:1')
        );
    END LOOP;

    -- 2. THE PRICE OF COMPROMISE
    -- ------------------------------------------
    
    -- Insert container if not exists
    INSERT INTO public.media_content (id, type, title, description, slug, cover_url, status, metadata, tags)
    VALUES (
        gen_random_uuid(),
        'carousel',
        'The Price of Compromise',
        'A deep dive into the historical and modern implications of political compromise in the Kenyan context.',
        'the-price-of-compromise',
        v_b2_base || '/carousels/price-of-compromise/1.png',
        'published',
        json_build_object('pdf_url', v_b2_base || '/carousels/price-of-compromise/price-of-compromise.pdf'),
        ARRAY['history', 'politics', 'special-edition']
    )
    ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        cover_url = EXCLUDED.cover_url,
        metadata = EXCLUDED.metadata,
        tags = EXCLUDED.tags
    RETURNING id INTO v_poc_id;

    -- Clean up old items for POC
    DELETE FROM public.media_items WHERE content_id = v_poc_id;

    -- Insert items for POC
    -- Items 1 to 8
    FOR i IN 1..8 LOOP
        INSERT INTO public.media_items (content_id, type, file_path, file_url, order_index, metadata)
        VALUES (
            v_poc_id,
            'image',
            'carousels/price-of-compromise/' || i || '.png',
            v_b2_base || '/carousels/price-of-compromise/' || i || '.png',
            i - 1,
            json_build_object('aspect_ratio', '4:5')
        );
    END LOOP;

END $$;
