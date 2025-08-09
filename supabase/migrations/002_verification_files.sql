-- Create verification files table for file upload management
CREATE TABLE IF NOT EXISTS public.verification_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    verification_status VARCHAR(50) DEFAULT 'pending', -- pending, verified, failed
    platform VARCHAR(100), -- google, facebook, bing, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for verification files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification-files', 'verification-files', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for verification files
ALTER TABLE public.verification_files ENABLE ROW LEVEL SECURITY;

-- Allow public read access to verification files (for external verification)
CREATE POLICY "Public read access for verification files" ON public.verification_files
    FOR SELECT USING (true);

-- Allow authenticated users to insert verification files
CREATE POLICY "Authenticated users can insert verification files" ON public.verification_files
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update their own verification files
CREATE POLICY "Authenticated users can update verification files" ON public.verification_files
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete verification files
CREATE POLICY "Authenticated users can delete verification files" ON public.verification_files
    FOR DELETE USING (auth.role() = 'authenticated');

-- Storage policies for verification files bucket
CREATE POLICY "Public read access for verification files storage" ON storage.objects
    FOR SELECT USING (bucket_id = 'verification-files');

CREATE POLICY "Authenticated users can upload verification files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'verification-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update verification files" ON storage.objects
    FOR UPDATE USING (bucket_id = 'verification-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete verification files" ON storage.objects
    FOR DELETE USING (bucket_id = 'verification-files' AND auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_verification_files_name ON public.verification_files(file_name);
CREATE INDEX idx_verification_files_type ON public.verification_files(file_type);
CREATE INDEX idx_verification_files_status ON public.verification_files(verification_status);
CREATE INDEX idx_verification_files_platform ON public.verification_files(platform);
CREATE INDEX idx_verification_files_created ON public.verification_files(created_at);

-- Insert sample verification files for demo
INSERT INTO public.verification_files (
    file_name,
    original_name,
    file_type,
    file_size,
    file_url,
    storage_path,
    description,
    platform,
    verification_status
) VALUES
(
    'google-site-verification.html',
    'google-site-verification.html',
    'text/html',
    512,
    'https://example.com/verification-files/public/google-site-verification.html',
    'public/google-site-verification.html',
    'Google Search Console verification file',
    'google',
    'pending'
);
