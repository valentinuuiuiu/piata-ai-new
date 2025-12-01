-- Fix user schema mismatch by creating a proper sync mechanism
-- This migration addresses the issue where users exist in public.users but not in auth.users

-- Create function to sync user from public.users to auth.users
CREATE OR REPLACE FUNCTION sync_user_to_auth(user_id uuid)
RETURNS void AS $$
DECLARE
    user_record record;
BEGIN
    -- Get user data from public.users
    SELECT id, email, name, created_at INTO user_record
    FROM public.users 
    WHERE id = user_id;
    
    -- If user exists in public.users but not in auth.users, create them
    IF FOUND AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) THEN
        INSERT INTO auth.users (
            id,
            email,
            raw_user_meta_data,
            created_at,
            updated_at,
            last_sign_in_at,
            aud,
            role,
            is_sso_user,
            is_anonymous
        ) VALUES (
            user_record.id,
            user_record.email,
            jsonb_build_object('name', user_record.name),
            COALESCE(user_record.created_at, NOW()),
            NOW(),
            NOW(),
            'authenticated',
            'authenticated',
            false,
            false
        );
        
        RAISE NOTICE 'User % synced from public.users to auth.users', user_record.email;
    ELSIF NOT FOUND THEN
        RAISE NOTICE 'User % not found in public.users', user_id;
    ELSE
        RAISE NOTICE 'User % already exists in auth.users', user_record.email;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to sync all orphaned users from public to auth
CREATE OR REPLACE FUNCTION sync_all_orphaned_users()
RETURNS TABLE(synced_users integer) AS $$
DECLARE
    user_count integer := 0;
    user_record record;
BEGIN
    -- Loop through users that exist in public.users but not in auth.users
    FOR user_record IN 
        SELECT pu.id, pu.email, pu.name, pu.created_at
        FROM public.users pu
        WHERE NOT EXISTS (
            SELECT 1 FROM auth.users au WHERE au.id = pu.id
        )
    LOOP
        INSERT INTO auth.users (
            id,
            email,
            raw_user_meta_data,
            created_at,
            updated_at,
            last_sign_in_at,
            aud,
            role,
            is_sso_user,
            is_anonymous
        ) VALUES (
            user_record.id,
            user_record.email,
            jsonb_build_object('name', user_record.name),
            COALESCE(user_record.created_at, NOW()),
            NOW(),
            NOW(),
            'authenticated',
            'authenticated',
            false,
            false
        );
        
        user_count := user_count + 1;
        RAISE NOTICE 'Synced user % (%) from public to auth', user_record.email, user_record.id;
    END LOOP;
    
    RETURN QUERY SELECT user_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function to automatically sync users
CREATE OR REPLACE FUNCTION on_public_user_created()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is an INSERT, sync to auth.users
    IF TG_OP = 'INSERT' THEN
        -- Check if user already exists in auth
        IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.id) THEN
            INSERT INTO auth.users (
                id,
                email,
                raw_user_meta_data,
                created_at,
                updated_at,
                last_sign_in_at,
                aud,
                role,
                is_sso_user,
                is_anonymous
            ) VALUES (
                NEW.id,
                NEW.email,
                jsonb_build_object('name', NEW.name),
                COALESCE(NEW.created_at, NOW()),
                NOW(),
                NOW(),
                'authenticated',
                'authenticated',
                false,
                false
            );
            RAISE NOTICE 'Automatically synced new user % to auth.users', NEW.email;
        END IF;
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically sync new users
DROP TRIGGER IF EXISTS sync_user_to_auth_trigger ON public.users;
CREATE TRIGGER sync_user_to_auth_trigger
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION on_public_user_created();

-- Now fix the specific user that was identified as having the mismatch
-- First, let's sync the specific user we identified
SELECT sync_user_to_auth('6191dba1-574a-49eb-a836-b203e858cb71');

-- Also sync any other orphaned users
SELECT sync_all_orphaned_users();

-- Success message
SELECT 'User synchronization fix applied successfully!' as message;