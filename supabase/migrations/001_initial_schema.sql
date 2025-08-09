-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'customer');

-- Users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role user_role DEFAULT 'customer',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Visitors tracking table
CREATE TABLE public.visitors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ip_address INET,
  user_agent TEXT,
  country TEXT,
  city TEXT,
  page_visited TEXT,
  referrer TEXT,
  session_id TEXT,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Advertisements table
CREATE TABLE public.advertisements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  position TEXT DEFAULT 'sidebar', -- sidebar, header, footer, content
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  click_count INTEGER DEFAULT 0,
  impression_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Code snippets/QR history table
CREATE TABLE public.qr_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'qr', 'barcode', 'text', 'url', etc.
  content TEXT NOT NULL,
  format TEXT DEFAULT 'png', -- png, svg, pdf
  size INTEGER DEFAULT 256,
  error_correction TEXT DEFAULT 'M', -- L, M, Q, H
  foreground_color TEXT DEFAULT '#000000',
  background_color TEXT DEFAULT '#ffffff',
  logo_url TEXT,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Code snippets table for generated code
CREATE TABLE public.code_snippets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  language TEXT NOT NULL, -- html, css, javascript, python, etc.
  code TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  tags TEXT[],
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_visitors_ip ON public.visitors(ip_address);
CREATE INDEX idx_visitors_date ON public.visitors(visited_at);
CREATE INDEX idx_advertisements_active ON public.advertisements(is_active);
CREATE INDEX idx_advertisements_position ON public.advertisements(position);
CREATE INDEX idx_qr_history_user ON public.qr_history(user_id);
CREATE INDEX idx_qr_history_type ON public.qr_history(type);
CREATE INDEX idx_qr_history_date ON public.qr_history(created_at);
CREATE INDEX idx_code_snippets_user ON public.code_snippets(user_id);
CREATE INDEX idx_code_snippets_language ON public.code_snippets(language);
CREATE INDEX idx_code_snippets_public ON public.code_snippets(is_public);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_snippets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for visitors table (admin only)
CREATE POLICY "Admins can view visitors" ON public.visitors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can insert visitor data" ON public.visitors
  FOR INSERT WITH CHECK (true);

-- RLS Policies for advertisements table
CREATE POLICY "Everyone can view active ads" ON public.advertisements
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage ads" ON public.advertisements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for qr_history table
CREATE POLICY "Users can view own QR history" ON public.qr_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own QR history" ON public.qr_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all QR history" ON public.qr_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for code_snippets table
CREATE POLICY "Users can view own snippets" ON public.code_snippets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view public snippets" ON public.code_snippets
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage own snippets" ON public.code_snippets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all snippets" ON public.code_snippets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advertisements_updated_at
  BEFORE UPDATE ON public.advertisements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_code_snippets_updated_at
  BEFORE UPDATE ON public.code_snippets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
