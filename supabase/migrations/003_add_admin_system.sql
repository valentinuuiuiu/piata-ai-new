-- Add user roles and admin system
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user',
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Create user_profiles table if it doesn't exist with admin fields
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    credits_balance INTEGER DEFAULT 0,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert admin users
INSERT INTO users (id, email, name, password, role, is_admin, is_active) VALUES
('admin_ionut', 'ionutbaltag3@gmail.com', 'Ionut Admin', 'ionela_2B', 'admin', TRUE, TRUE),
('admin_claude', 'claude.dev@mail.com', 'Claude Admin', 'ionela_2B', 'admin', TRUE, TRUE)
ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    is_admin = EXCLUDED.is_admin,
    is_active = EXCLUDED.is_active;

-- Create corresponding profiles for admins
INSERT INTO user_profiles (user_id, credits_balance, is_admin) VALUES
('admin_ionut', 999999, TRUE),
('admin_claude', 999999, TRUE)
ON CONFLICT (user_id) DO UPDATE SET
    is_admin = EXCLUDED.is_admin,
    credits_balance = EXCLUDED.credits_balance;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_admin ON users(is_admin);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_admin ON user_profiles(is_admin);

-- Create function to check admin status
CREATE OR REPLACE FUNCTION is_admin_user(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE email = user_email 
        AND is_admin = TRUE 
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION is_admin_user TO authenticated, anon;