
-- Enable Row Level Security (RLS) on public tables
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for blog_posts
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can view all blog posts" ON public.blog_posts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert blog posts" ON public.blog_posts
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update blog posts" ON public.blog_posts
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete blog posts" ON public.blog_posts
  FOR DELETE TO authenticated USING (true);

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all user roles" ON public.user_roles
  FOR ALL TO service_role USING (true);

-- Fix function search_path security by setting it to immutable for all functions
ALTER FUNCTION public.filter_resources_by_topic(text) SET search_path = '';
ALTER FUNCTION public.get_all_providers() SET search_path = '';
ALTER FUNCTION public.get_discussion_thread(uuid) SET search_path = '';
ALTER FUNCTION public.get_followed_bills(uuid) SET search_path = '';
ALTER FUNCTION public.get_my_volunteer_applications(uuid) SET search_path = '';
ALTER FUNCTION public.get_upcoming_events() SET search_path = '';
ALTER FUNCTION public.get_user_profile(uuid) SET search_path = '';
ALTER FUNCTION public.apply_for_volunteer_opportunity(uuid, uuid, text) SET search_path = '';
ALTER FUNCTION public.create_discussion(uuid, uuid, text, text) SET search_path = '';
ALTER FUNCTION public.submit_contribution(uuid, text, text) SET search_path = '';
ALTER FUNCTION public.submit_feedback(uuid, text, text) SET search_path = '';
ALTER FUNCTION public.unfollow_bill(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.update_updated_at_timestamp() SET search_path = '';
ALTER FUNCTION public.create_event(text, text, date, time, time, text) SET search_path = '';
ALTER FUNCTION public.delete_user_profile(uuid, boolean) SET search_path = '';
ALTER FUNCTION public.get_advocacy_toolkit() SET search_path = '';
ALTER FUNCTION public.follow_bill(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.get_all_learning_materials() SET search_path = '';
ALTER FUNCTION public.get_bill_details(uuid) SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.list_open_volunteer_opportunities() SET search_path = '';
ALTER FUNCTION public.notify_users_about_bill_change(uuid) SET search_path = '';
ALTER FUNCTION public.search_bills(text) SET search_path = '';
ALTER FUNCTION public.register_user_for_event(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.reply_to_discussion(uuid, uuid, text) SET search_path = '';
ALTER FUNCTION public.search_providers_by_county_or_topic(text, text) SET search_path = '';
ALTER FUNCTION public.update_user_profile(uuid, text, text, text) SET search_path = '';
