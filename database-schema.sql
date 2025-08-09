-- Generatorus Database Schema
-- Run these commands in your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create visitors table for analytics
CREATE TABLE IF NOT EXISTS visitors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_url TEXT NOT NULL,
    user_agent TEXT,
    ip_address INET,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create code_snippets table for SEO and third-party integrations
CREATE TABLE IF NOT EXISTS code_snippets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    code TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'custom',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create advertisements table
CREATE TABLE IF NOT EXISTS advertisements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    ad_code TEXT NOT NULL,
    placement VARCHAR(100) NOT NULL, -- 'header', 'sidebar', 'footer', 'content'
    page_url VARCHAR(255), -- specific page or '*' for all pages
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create qr_history table for user QR code generation history
CREATE TABLE IF NOT EXISTS qr_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    qr_data TEXT NOT NULL,
    qr_type VARCHAR(50) DEFAULT 'text',
    settings JSONB, -- Store QR code settings (colors, size, logo, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table for application configuration
CREATE TABLE IF NOT EXISTS settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    category VARCHAR(50) DEFAULT 'general',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table to extend auth.users
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(200),
    role VARCHAR(20) DEFAULT 'customer',
    avatar_url TEXT,
    phone VARCHAR(20),
    bio TEXT,
    location VARCHAR(200),
    website VARCHAR(200),
    date_of_birth DATE,
    gender VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_visitors_visited_at ON visitors(visited_at);
CREATE INDEX IF NOT EXISTS idx_visitors_page_url ON visitors(page_url);
CREATE INDEX IF NOT EXISTS idx_code_snippets_type ON code_snippets(type);
CREATE INDEX IF NOT EXISTS idx_code_snippets_active ON code_snippets(is_active);
CREATE INDEX IF NOT EXISTS idx_advertisements_placement ON advertisements(placement);
CREATE INDEX IF NOT EXISTS idx_advertisements_active ON advertisements(is_active);
CREATE INDEX IF NOT EXISTS idx_qr_history_user_id ON qr_history(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_history_created_at ON qr_history(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Row Level Security Policies

-- Visitors table - Allow insert for all, select for admins only
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for all users" ON visitors
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select for admins" ON visitors
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
        OR 
        auth.jwt() ->> 'email' = 'rubel820746@gmail.com'
    );

-- Code snippets table - Admin only
ALTER TABLE code_snippets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only access" ON code_snippets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
        OR 
        auth.jwt() ->> 'email' = 'rubel820746@gmail.com'
    );

-- Advertisements table - Admin only
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only access" ON advertisements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
        OR 
        auth.jwt() ->> 'email' = 'rubel820746@gmail.com'
    );

-- QR history table - Users can access their own data, admins can access all
ALTER TABLE qr_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own data" ON qr_history
    FOR ALL USING (
        user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
        OR 
        auth.jwt() ->> 'email' = 'rubel820746@gmail.com'
    );

-- User profiles table - Users can access own profile, admins can access all
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own profile" ON user_profiles
    FOR ALL USING (
        id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() 
            AND up.role = 'admin'
        )
        OR 
        auth.jwt() ->> 'email' = 'rubel820746@gmail.com'
    );

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, first_name, last_name, full_name, role)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'full_name',
        CASE 
            WHEN NEW.email = 'rubel820746@gmail.com' THEN 'admin'
            ELSE COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample data for testing
INSERT INTO code_snippets (name, description, code, type, is_active) VALUES
('Google Analytics', 'Google Analytics tracking code', '<!-- Google Analytics -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag(''js'', new Date());\n  gtag(''config'', ''GA_MEASUREMENT_ID'');\n</script>', 'analytics', false),
('Google Search Console', 'Google Search Console verification', '<meta name="google-site-verification" content="your-verification-code" />', 'verification', false),
('Facebook Pixel', 'Facebook Pixel tracking code', '<!-- Facebook Pixel Code -->\n<script>\n!function(f,b,e,v,n,t,s)\n{if(f.fbq)return;n=f.fbq=function(){n.callMethod?\nn.callMethod.apply(n,arguments):n.queue.push(arguments)};\nif(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version=''2.0'';\nn.queue=[];t=b.createElement(e);t.async=!0;\nt.src=v;s=b.getElementsByTagName(e)[0];\ns.parentNode.insertBefore(t,s)}(window, document,''script'',\n''https://connect.facebook.net/en_US/fbevents.js'');\nfbq(''init'', ''YOUR_PIXEL_ID'');\nfbq(''track'', ''PageView'');\n</script>', 'advertising', false);

-- Insert sample advertisements
INSERT INTO advertisements (name, description, ad_code, placement, page_url, is_active, priority) VALUES
('Header Banner', 'Main header advertisement', '<div class="ad-banner">Your Ad Here</div>', 'header', '*', false, 1),
('Sidebar Ad', 'Sidebar advertisement', '<div class="ad-sidebar">Sidebar Ad</div>', 'sidebar', '*', false, 2),
('Footer Ad', 'Footer advertisement', '<div class="ad-footer">Footer Ad</div>', 'footer', '*', false, 3);

-- Enable RLS on settings
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can manage settings
CREATE POLICY "Admins can manage settings" ON settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
        OR
        auth.jwt() ->> 'email' = 'rubel820746@gmail.com'
    );

-- Policy: Everyone can read settings (for public configuration)
CREATE POLICY "Everyone can read settings" ON settings
    FOR SELECT USING (true);

-- Insert default settings
INSERT INTO settings (key, value, category, description) VALUES
('site_name', 'Generatorus', 'general', 'Site name'),
('site_description', 'Free QR Code and Barcode Generator', 'general', 'Site description'),
('site_url', 'https://generatorus.com', 'general', 'Site URL'),
('admin_email', 'admin@generatorus.com', 'general', 'Administrator email'),
('timezone', 'UTC', 'general', 'Default timezone'),
('language', 'en', 'general', 'Default language'),
('meta_title', 'Generatorus - Free QR Code Generator', 'seo', 'Meta title'),
('meta_description', 'Generate QR codes and barcodes for free with no expiration', 'seo', 'Meta description'),
('meta_keywords', 'qr code, barcode, generator, free', 'seo', 'Meta keywords'),
('primary_color', '#00d4ff', 'appearance', 'Primary brand color'),
('secondary_color', '#ff6b9d', 'appearance', 'Secondary brand color'),
('accent_color', '#c471ed', 'appearance', 'Accent color'),
('enable_registration', 'true', 'security', 'Allow user registration'),
('require_email_verification', 'true', 'security', 'Require email verification'),
('password_min_length', '6', 'security', 'Minimum password length'),
('enable_api', 'true', 'api', 'Enable API access'),
('api_rate_limit', '100', 'api', 'API rate limit per hour'),
('email_notifications', 'true', 'notifications', 'Enable email notifications');

COMMIT;
