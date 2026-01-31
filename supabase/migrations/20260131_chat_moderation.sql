-- ================================================
-- CEKA Chat Moderation Schema
-- ================================================
-- Run this migration in Supabase SQL Editor

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
CREATE POLICY "Admins can view all moderation actions"
    ON public.chat_moderation_actions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Admins can create moderation actions"
    ON public.chat_moderation_actions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- RLS Policies for room members
CREATE POLICY "Users can view their own membership"
    ON public.chat_room_members FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Admins can view all memberships"
    ON public.chat_room_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Users can update their own membership"
    ON public.chat_room_members FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

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

-- Trigger to notify user when moderated
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
