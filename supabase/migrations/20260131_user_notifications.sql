-- ================================================
-- CEKA User Notifications - Polymorphic Schema
-- ================================================
-- Run this migration in Supabase SQL Editor

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
CREATE POLICY "Users can view own notifications" 
    ON public.user_notifications FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
    ON public.user_notifications FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

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
