-- ============================================================================
-- CEKA (Civic Education Kenya) Database Schema Reference
-- Generated from backup.sql on 2026-01-25
-- 
-- NOTE: This file is a REFERENCE for the existing schema.
-- DO NOT EXECUTE directly - the schema already exists in Supabase.
-- Use this for understanding table structures and relationships.
-- ============================================================================

-- ============================================================================
-- PUBLIC SCHEMA TABLES (Existing in CEKA Supabase)
-- ============================================================================

-- 1. PROFILES - User profiles linked to auth.users
-- Already exists: public.profiles
-- Fields: id, username, full_name, avatar_url, email, created_at, updated_at, 
--         county, bio, interests, areas_of_interest, created_via, auth_user_id, is_admin

-- 2. RESOURCES - Civic education resources
-- Already exists: public.resources
-- Fields: id, title, description, type, url, category, is_downloadable, 
--         created_at, updated_at, uploadedBy, downloadUrl, videoUrl, thumbnail_url, user_id

-- 3. RESOURCE_CATEGORIES
-- Already exists: public.resource_categories
-- Fields: id, name, description, created_at

-- 4. RESOURCE_VIEWS - Analytics for resource views
-- Already exists: public.resource_views
-- Fields: id, resource_id, resource_type, view_type, user_id, ip_address, 
--         user_agent, viewed_at, created_at

-- 5. BLOG_POSTS
-- Already exists: public.blog_posts
-- Fields: id, title, slug, content, excerpt, author, tags, status, 
--         published_at, created_at, updated_at, scheduled_at, rejection_reason, 
--         admin_notes, user_id, category_id

-- 6. BLOG_CATEGORIES
-- Already exists: public.blog_categories
-- Fields: id, name, description, created_at

-- 7. BILLS - Legislative bill tracking
-- Already exists: public.bills
-- Fields: id, title, summary, status, category, date, created_at, updated_at,
--         url, sponsor, description, stages, comments, constitutional_section, sources

-- 8. BILL_FOLLOWS - Users following bills
-- Already exists: public.bill_follows
-- Fields: id, user_id, bill_id, created_at

-- 9. CIVIC_EVENTS - Calendar events
-- Already exists: public.civic_events
-- Fields: id, title, description, event_date, start_time, end_time, 
--         category, color, related_bill_id, related_resource_id, created_at, updated_at

-- 10. CAROUSEL_SLIDES - Homepage carousel
-- Already exists: public.carousel_slides
-- Fields: id, title, description, cta_text, color, link_url, image_url, type,
--         order_index, is_active, created_at, updated_at, badge_color, icon_name,
--         gradient_from, gradient_to, text_color_light, text_color_dark,
--         button_color_light, button_color_dark, animation_type, priority

-- 11. VOLUNTEER_OPPORTUNITIES
-- Already exists: public.volunteer_opportunities
-- Fields: id, title, organization, description, location, type, date, time,
--         commitment, created_at, updated_at, status, skills_required,
--         contact_email, apply_url, is_remote, tags, created_by_user_id

-- 12. VOLUNTEER_APPLICATIONS
-- Already exists: public.volunteer_applications
-- Fields: id, opportunity_id, user_id, status, created_at, updated_at

-- 13. CIVIC_EDUCATION_PROVIDERS
-- Already exists: public.civic_education_providers
-- Fields: id, name, description, focus_areas, counties_served, contact_email,
--         contact_phone, website_url, logo_url, is_verified, submitted_by_user_id,
--         created_at, updated_at

-- 14. DISCUSSIONS
-- Already exists: public.discussions
-- Fields: id, title, content, user_id, category, likes, replies, created_at, updated_at

-- 15. DISCUSSION_REPLIES
-- Already exists: public.discussion_replies
-- Fields: id, discussion_id, user_id, content, likes, created_at, updated_at

-- 16. DOCUMENTS
-- Already exists: public.documents
-- Fields: id, title, description, file_url, file_type, mime_type, size_bytes,
--         user_id, is_approved, virus_scanned, virus_scan_result, created_at, updated_at

-- 17. ADVOCACY_TOOLKIT
-- Already exists: public.advocacy_toolkit
-- Fields: id, title, description, content, category, document_ids, created_at, updated_at

-- 18. NOTIFICATIONS
-- Already exists: public.notifications
-- Fields: id, user_id, message, link, is_read, type, created_at, related_entity_id

-- 19. FEEDBACK
-- Already exists: public.feedback
-- Fields: id, user_id, message, category, status, created_at, updated_at

-- 20. COMMUNITY_MEMBERS
-- Already exists: public.community_members
-- Fields: id, first_name, last_name, email, county, interests, areas_of_interest,
--         terms_accepted, source_ip, user_agent, status, created_at, updated_at

-- 21. USER_CONTRIBUTIONS
-- Already exists: public.user_contributions
-- Fields: id, title, content, url, document_url, user_id, status, category,
--         ai_summary, ai_tags, created_at, updated_at

-- 22. USER_ROLES
-- Already exists: public.user_roles
-- Fields: id, user_id, role, created_at

-- 23. ADMIN_AUDIT_LOG
-- Already exists: public.admin_audit_log
-- Fields: id, user_id, action, resource_type, resource_id, details, ip_address,
--         user_agent, created_at

-- 24. ADMIN_NOTIFICATIONS
-- Already exists: public.admin_notifications
-- Fields: id, type, title, message, related_id, is_read, created_at

-- 25. ADMIN_SESSIONS
-- Already exists: public.admin_sessions
-- Fields: id, user_id, email, session_token, created_at, last_active, is_active, expires_at

-- 26. PROCESSING_JOBS
-- Already exists: public.processing_jobs
-- Fields: id, user_id, job_name, status, progress, current_step, input_files,
--         input_urls, output_files, error_message, processing_logs, expires_at,
--         created_at, updated_at, completed_at

-- 27. YOUTUBE_VIDEOS
-- Already exists: public.youtube_videos
-- Fields: id, title, description, url, download_url, is_downloadable, uploaded_by,
--         bill_objective, county, created_at, updated_at, status

-- 28. VISUALIZERS
-- Already exists: public.visualizers
-- Fields: id, title, description, url, type, created_at, updated_at, category,
--         display_order, is_active, geo_json_url

-- 29. HEALTH_FACILITIES
-- Already exists: public.health_facilities
-- Fields: FID, OBJECTID, name, type, owner, county, subcounty, division, location,
--         sub_location, constituency, nearest_to, latitude, longitude

-- 30. SYSTEM_METRICS
-- Already exists: public.system_metrics
-- Fields: id, metric_name, metric_value, metric_date, created_at

-- 31. APP_CHANGES
-- Already exists: public.app_changes
-- Fields: id, change_type, description, technical_details, user_friendly_message,
--         severity, affects_users, processed, created_at, updated_at

-- ============================================================================
-- RLS POLICIES (SUGGESTIONS - Already configured in Supabase)
-- ============================================================================

-- Resources: Public read, authenticated write
-- POLICY "Public can view resources" ON public.resources FOR SELECT USING (true);
-- POLICY "Authenticated users can insert" ON public.resources FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Blog Posts: Public read published, authenticated write
-- POLICY "Public can view published posts" ON public.blog_posts FOR SELECT USING (status = 'published');
-- POLICY "Authors can manage own posts" ON public.blog_posts FOR ALL USING (auth.uid() = user_id);

-- Profiles: Users can read all, write own
-- POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
-- POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Civic Events: Public read
-- POLICY "Public can view events" ON public.civic_events FOR SELECT USING (true);

-- ============================================================================
-- STORAGE BUCKETS (Existing in CEKA Supabase)
-- ============================================================================

-- 1. resources - For civic education resources (PDFs, documents)
-- 2. carousel-thumbnails - For homepage carousel images
-- 3. avatars - For user profile pictures
-- 4. documents - For user-uploaded documents

-- ============================================================================
-- IMPORTANT NOTES
-- ============================================================================

-- 1. All tables use UUID primary keys with gen_random_uuid() default
-- 2. Timestamps use timezone-aware timestamp with time zone
-- 3. created_at and updated_at are auto-managed via triggers
-- 4. RLS is enabled on most tables with appropriate policies
-- 5. Storage uses Supabase Storage with public/private buckets
