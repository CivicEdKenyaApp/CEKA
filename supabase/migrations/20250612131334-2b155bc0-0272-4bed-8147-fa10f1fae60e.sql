
-- Fix search_path for create_admin_notification function
CREATE OR REPLACE FUNCTION public.create_admin_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  IF NEW.status = 'draft' AND (OLD IS NULL OR OLD.status != 'draft') THEN
    INSERT INTO admin_notifications (type, title, message, related_id)
    VALUES (
      'blog_draft',
      'New Blog Post Draft',
      'A new blog post draft "' || NEW.title || '" has been submitted for review.',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix search_path for is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND email = 'civiceducationkenya@gmail.com'
  );
END;
$function$;

-- Fix search_path for get_resource_view_count function
CREATE OR REPLACE FUNCTION public.get_resource_view_count(p_resource_id text, p_resource_type text)
RETURNS integer
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
  SELECT COUNT(*)::INTEGER
  FROM resource_views
  WHERE resource_id = p_resource_id 
    AND resource_type = p_resource_type;
$function$;

-- Fix search_path for track_resource_view function
CREATE OR REPLACE FUNCTION public.track_resource_view(p_resource_id text, p_resource_type text, p_view_type text DEFAULT 'page_view'::text, p_user_id uuid DEFAULT NULL::uuid, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
  INSERT INTO resource_views (
    resource_id,
    resource_type,
    view_type,
    user_id,
    ip_address,
    user_agent,
    viewed_at
  ) VALUES (
    p_resource_id,
    p_resource_type,
    p_view_type,
    COALESCE(p_user_id, auth.uid()),
    p_ip_address,
    p_user_agent,
    now()
  )
  RETURNING id;
$function$;
