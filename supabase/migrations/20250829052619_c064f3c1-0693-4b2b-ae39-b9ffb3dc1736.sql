-- Add RLS policies for tables that are missing them
CREATE POLICY "Public can read blog categories" 
ON public.blog_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Public can read resource categories" 
ON public.resource_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Public can read carousel slides" 
ON public.carousel_slides 
FOR SELECT 
USING (is_active = true);

-- Fix function search paths to address security warnings
-- The following functions need search_path fixes but already have some set
-- We'll recreate them with proper search paths

-- Fix the functions that have mutable search paths
CREATE OR REPLACE FUNCTION public.update_discussion_reply_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
IF TG_OP = 'INSERT' THEN
UPDATE discussions SET replies = replies + 1 WHERE id = NEW.discussion_id;
RETURN NEW;
ELSIF TG_OP = 'DELETE' THEN
UPDATE discussions SET replies = replies - 1 WHERE id = OLD.discussion_id;
RETURN OLD;
END IF;
RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;