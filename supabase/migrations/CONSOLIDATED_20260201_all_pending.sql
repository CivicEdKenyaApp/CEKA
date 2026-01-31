-- ================================================
-- CEKA Platform - Consolidated Database Migration
-- ================================================
-- Run Date: 2026-02-01
-- Description: All pending schema updates for CEKA platform
-- 
-- This file consolidates the following migrations:
-- 1. User Notifications (polymorphic notification system)
-- 2. Chat Moderation (ban/mute/warn system)
-- 
-- INSTRUCTIONS:
-- 1. Log into Supabase Dashboard
-- 2. Go to SQL Editor
-- 3. Copy and paste this entire file
-- 4. Click "Run"
-- 5. After running, regenerate types: npx supabase gen types typescript
-- ================================================

-- ================================================
-- PART 1: USER NOTIFICATIONS (Polymorphic System)
-- ================================================

-- Create user_notifications table with polymorphic relationships
CREATE TABLE IF NOT EXISTS public.user_notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Polymorphic source identification
    source_type text NOT NULL CHECK (source_type IN (
        'chat_message',      -- New message in a room you're in
        'chat_mention',      -- Someone mentioned you in chat
        'chat_reply',        -- Reply to your message
        'blog_comment',      -- Comment on your blog post
        'blog_mention',      -- Mentioned in a blog post
        'volunteer_opportunity', -- New volunteer opportunity
        'volunteer_application', -- Application status update
        'bill_update',       -- Update on a followed bill
        'campaign_update',   -- Update on a joined campaign
        'discussion_reply',  -- Reply to your discussion
        'system',            -- System announcements
        'moderation'         -- Moderation actions
    )),
    source_id uuid,          -- ID of the source entity (chat_message.id, blog_post.id, etc.)
    
    -- Actor information (who triggered this notification)
    actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Notification content
    title text NOT NULL,
    message text NOT NULL,
    link text,               -- Deep link to the relevant content
    image_url text,          -- Optional image (actor avatar, campaign image, etc.)
    
    -- Related metadata
    metadata jsonb DEFAULT '{}'::jsonb,  -- Additional context data
    
    -- Priority and categorization
    priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    category text DEFAULT 'general',
    
    -- State tracking
    is_read boolean DEFAULT false,
    read_at timestamp with time zone,
    is_archived boolean DEFAULT false,
    archived_at timestamp with time zone,
    is_dismissed boolean DEFAULT false,
    
    -- Timestamps
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone  -- Optional expiration
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON public.user_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON public.user_notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_user_notifications_source ON public.user_notifications(source_type, source_id);

-- Enable Row Level Security
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.user_notifications;
CREATE POLICY "Users can view own notifications" 
    ON public.user_notifications FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.user_notifications;
CREATE POLICY "Users can update own notifications" 
    ON public.user_notifications FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON public.user_notifications;
CREATE POLICY "System can insert notifications"
    ON public.user_notifications FOR INSERT
    WITH CHECK (true);  -- Allow inserts from authenticated contexts

-- Function to create a notification (for use in triggers and functions)
CREATE OR REPLACE FUNCTION public.create_notification(
    p_user_id uuid,
    p_source_type text,
    p_source_id uuid,
    p_actor_id uuid,
    p_title text,
    p_message text,
    p_link text DEFAULT NULL,
    p_image_url text DEFAULT NULL,
    p_priority text DEFAULT 'normal',
    p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS uuid AS $$
DECLARE
    v_id uuid;
BEGIN
    -- Don't notify if actor is the same as user (don't notify yourself)
    IF p_actor_id = p_user_id THEN
        RETURN NULL;
    END IF;

    INSERT INTO public.user_notifications (
        user_id, source_type, source_id, actor_id, 
        title, message, link, image_url, priority, metadata
    )
    VALUES (
        p_user_id, p_source_type, p_source_id, p_actor_id,
        p_title, p_message, p_link, p_image_url, p_priority, p_metadata
    )
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION public.mark_notifications_read(
    p_notification_ids uuid[]
) RETURNS void AS $$
BEGIN
    UPDATE public.user_notifications
    SET is_read = true, read_at = now()
    WHERE id = ANY(p_notification_ids)
    AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read() RETURNS void AS $$
BEGIN
    UPDATE public.user_notifications
    SET is_read = true, read_at = now()
    WHERE user_id = auth.uid()
    AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to notify on chat mentions
CREATE OR REPLACE FUNCTION public.notify_chat_mention() RETURNS trigger AS $$
DECLARE
    v_message record;
    v_actor record;
BEGIN
    -- Get the message details
    SELECT cm.*, cr.name as room_name
    INTO v_message
    FROM public.chat_messages cm
    LEFT JOIN public.chat_rooms cr ON cm.room_id = cr.id
    WHERE cm.id = NEW.message_id;
    
    -- Get actor details
    SELECT full_name, avatar_url INTO v_actor
    FROM public.profiles
    WHERE id = v_message.user_id;
    
    -- Create notification for mentioned user
    PERFORM public.create_notification(
        NEW.mentioned_user_id,
        'chat_mention',
        NEW.message_id,
        v_message.user_id,
        COALESCE(v_actor.full_name, 'Someone') || ' mentioned you',
        LEFT(v_message.content, 100),
        '/community?room=' || v_message.room_id,
        v_actor.avatar_url,
        'high'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for chat mentions
DROP TRIGGER IF EXISTS on_chat_mention ON public.chat_mentions;
CREATE TRIGGER on_chat_mention
    AFTER INSERT ON public.chat_mentions
    FOR EACH ROW
    WHEN (NEW.mentioned_user_id IS NOT NULL)
    EXECUTE FUNCTION public.notify_chat_mention();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;

-- Comment on table
COMMENT ON TABLE public.user_notifications IS 'Polymorphic notification system for all user-facing notifications with real-time support';


-- ================================================
-- PART 2: CHAT MODERATION SYSTEM
-- ================================================

-- Create chat_moderation_actions table
CREATE TABLE IF NOT EXISTS public.chat_moderation_actions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    action_type text NOT NULL CHECK (action_type IN ('ban', 'mute', 'warn', 'delete')),
    target_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    moderator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    room_id text NOT NULL,
    message_id uuid REFERENCES public.chat_messages(id) ON DELETE SET NULL,
    reason text NOT NULL,
    duration_minutes integer,  -- NULL for permanent
    expires_at timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create chat_room_members table for tracking permissions
CREATE TABLE IF NOT EXISTS public.chat_room_members (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    room_id text NOT NULL,
    is_banned boolean DEFAULT false,
    banned_at timestamp with time zone,
    ban_expires_at timestamp with time zone,
    is_muted boolean DEFAULT false,
    muted_at timestamp with time zone,
    mute_expires_at timestamp with time zone,
    joined_at timestamp with time zone DEFAULT now(),
    last_read_at timestamp with time zone,
    UNIQUE(user_id, room_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_moderation_target ON public.chat_moderation_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_room ON public.chat_moderation_actions(room_id);
CREATE INDEX IF NOT EXISTS idx_moderation_active ON public.chat_moderation_actions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_room_members_banned ON public.chat_room_members(room_id, is_banned) WHERE is_banned = true;

-- Enable RLS
ALTER TABLE public.chat_moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for moderation actions
DROP POLICY IF EXISTS "Admins can view all moderation actions" ON public.chat_moderation_actions;
CREATE POLICY "Admins can view all moderation actions"
    ON public.chat_moderation_actions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

DROP POLICY IF EXISTS "Admins can create moderation actions" ON public.chat_moderation_actions;
CREATE POLICY "Admins can create moderation actions"
    ON public.chat_moderation_actions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- RLS Policies for room members
DROP POLICY IF EXISTS "Users can view their own membership" ON public.chat_room_members;
CREATE POLICY "Users can view their own membership"
    ON public.chat_room_members FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all memberships" ON public.chat_room_members;
CREATE POLICY "Admins can view all memberships"
    ON public.chat_room_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

DROP POLICY IF EXISTS "Users can update their own membership" ON public.chat_room_members;
CREATE POLICY "Users can update their own membership"
    ON public.chat_room_members FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can update any membership" ON public.chat_room_members;
CREATE POLICY "Admins can update any membership"
    ON public.chat_room_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Function to check if user is banned or muted
CREATE OR REPLACE FUNCTION public.check_chat_permission(p_user_id uuid, p_room_id text)
RETURNS TABLE(can_post boolean, reason text) AS $$
DECLARE
    v_member public.chat_room_members%ROWTYPE;
BEGIN
    SELECT * INTO v_member
    FROM public.chat_room_members
    WHERE user_id = p_user_id AND room_id = p_room_id;
    
    -- No membership record = allowed
    IF NOT FOUND THEN
        RETURN QUERY SELECT true::boolean, NULL::text;
        RETURN;
    END IF;
    
    -- Check if ban is active
    IF v_member.is_banned AND (v_member.ban_expires_at IS NULL OR v_member.ban_expires_at > now()) THEN
        RETURN QUERY SELECT false::boolean, 'You are banned from this room'::text;
        RETURN;
    END IF;
    
    -- Check if mute is active
    IF v_member.is_muted AND (v_member.mute_expires_at IS NULL OR v_member.mute_expires_at > now()) THEN
        RETURN QUERY SELECT false::boolean, 'You are muted in this room'::text;
        RETURN;
    END IF;
    
    -- Clear expired bans/mutes
    IF v_member.is_banned AND v_member.ban_expires_at <= now() THEN
        UPDATE public.chat_room_members SET is_banned = false WHERE id = v_member.id;
    END IF;
    IF v_member.is_muted AND v_member.mute_expires_at <= now() THEN
        UPDATE public.chat_room_members SET is_muted = false WHERE id = v_member.id;
    END IF;
    
    RETURN QUERY SELECT true::boolean, NULL::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to notify user when moderated (depends on create_notification function from Part 1)
CREATE OR REPLACE FUNCTION public.notify_moderation_action() RETURNS trigger AS $$
BEGIN
    -- Create notification for the moderated user
    PERFORM public.create_notification(
        NEW.target_user_id,
        'moderation',
        NEW.id,
        NEW.moderator_id,
        CASE NEW.action_type
            WHEN 'ban' THEN 'You have been banned'
            WHEN 'mute' THEN 'You have been muted'
            WHEN 'warn' THEN 'You received a warning'
            ELSE 'Moderation action taken'
        END,
        NEW.reason,
        '/community',
        NULL,
        'high'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_moderation_action ON public.chat_moderation_actions;
CREATE TRIGGER on_moderation_action
    AFTER INSERT ON public.chat_moderation_actions
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_moderation_action();

COMMENT ON TABLE public.chat_moderation_actions IS 'Tracks moderation actions (bans, mutes, warnings) in chat rooms';
COMMENT ON TABLE public.chat_room_members IS 'Tracks user membership and permissions in chat rooms';


-- ================================================
-- PART 3: STORAGE BUCKET CONFIGURATION
-- ================================================
-- NOTE: Storage buckets must be created via Supabase Dashboard or CLI
-- The following is for reference only

-- After running this migration, create these storage buckets in Supabase Dashboard:
-- 1. "resources" bucket - For civic education documents and resources
-- 2. "avatars" bucket - For user profile pictures (already exists)
-- 3. "blog-images" bucket - For blog post images
-- 4. "campaign-media" bucket - For campaign images and videos

-- Storage RLS policy for resources bucket (run in Storage > Policies):
-- SELECT: Allow authenticated users to download
-- INSERT: Allow authenticated users to upload to their own folder
-- DELETE: Allow users to delete their own files


-- ================================================
-- VERIFICATION QUERIES
-- ================================================
-- Run these to verify the migration was successful:

-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_notifications', 'chat_moderation_actions', 'chat_room_members');

-- Check functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('create_notification', 'mark_notifications_read', 'mark_all_notifications_read', 'check_chat_permission');

-- Check triggers exist
SELECT trigger_name, event_object_table FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name IN ('on_chat_mention', 'on_moderation_action');
