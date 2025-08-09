# 🚀 Supabase Database Setup Guide

## 📋 Overview
This guide will help you set up the Supabase database for the Generatorus project.

## 🔧 Setup Steps

### 1. **Access Supabase Dashboard**
- Go to: https://supabase.com/dashboard
- Login with your account
- Select your project: `ubjdlnlslmmvpconxzcu`

### 2. **Run Database Migrations**

#### Option A: Using Supabase Dashboard (Recommended)
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the content from `supabase/migrations/001_initial_schema.sql`
3. Click **Run** to execute the migration
4. Copy and paste the content from `supabase/seed.sql`
5. Click **Run** to insert demo data

#### Option B: Using Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref ubjdlnlslmmvpconxzcu

# Run migrations
supabase db push

# Run seed data
supabase db seed
```

### 3. **Verify Database Setup**

After running the migrations, you should have these tables:
- ✅ `public.users` - User profiles
- ✅ `public.visitors` - Visitor tracking
- ✅ `public.advertisements` - Ad management
- ✅ `public.qr_history` - QR code history
- ✅ `public.code_snippets` - Code snippets

### 4. **Create Demo Admin User**

#### Option A: Using the App (Recommended)
1. Start the development server: `npm run dev`
2. Go to the login page
3. Click **"Create Demo Admin"** button
4. This will create the admin user with credentials:
   - Email: `rubel820746@gmail.com`
   - Password: `82074682Rr`

#### Option B: Manual Creation
1. Go to **Authentication > Users** in Supabase dashboard
2. Click **"Add user"**
3. Enter:
   - Email: `rubel820746@gmail.com`
   - Password: `82074682Rr`
   - User Metadata:
     ```json
     {
       "first_name": "Rubel",
       "last_name": "Hossain",
       "role": "admin"
     }
     ```

### 5. **Configure Row Level Security (RLS)**

The migration script automatically sets up RLS policies, but verify:

1. Go to **Authentication > Policies**
2. Check that policies are enabled for all tables
3. Verify admin users can access all data
4. Verify regular users can only access their own data

### 6. **Test the Setup**

1. **Test Authentication:**
   - Try logging in with demo credentials
   - Check if admin dashboard loads
   - Verify user role detection

2. **Test Database Operations:**
   - Create a QR code (should save to history)
   - Check visitor tracking
   - View advertisements

3. **Test Admin Features:**
   - Access admin dashboard
   - View user management
   - Check analytics data

## 🔍 Troubleshooting

### Common Issues:

#### 1. **Login Not Working**
- Check if demo admin user exists in Authentication > Users
- Verify email confirmation (disable if needed)
- Check browser console for errors

#### 2. **Database Connection Issues**
- Verify Supabase URL and API key in `src/lib/supabase.js`
- Check network connectivity
- Ensure project is not paused

#### 3. **Permission Errors**
- Check RLS policies are correctly set up
- Verify user roles in the database
- Check if tables exist

#### 4. **Migration Errors**
- Run migrations one by one
- Check for syntax errors in SQL
- Verify extensions are enabled

## 📊 Database Schema

### Tables Structure:

```sql
-- Users (extends auth.users)
users {
  id: UUID (PK, FK to auth.users)
  email: TEXT
  first_name: TEXT
  last_name: TEXT
  role: ENUM('admin', 'customer')
  avatar_url: TEXT
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}

-- Visitor Tracking
visitors {
  id: UUID (PK)
  ip_address: INET
  user_agent: TEXT
  country: TEXT
  city: TEXT
  page_visited: TEXT
  referrer: TEXT
  session_id: TEXT
  visited_at: TIMESTAMP
}

-- Advertisement Management
advertisements {
  id: UUID (PK)
  title: TEXT
  description: TEXT
  image_url: TEXT
  link_url: TEXT
  position: TEXT
  is_active: BOOLEAN
  start_date: TIMESTAMP
  end_date: TIMESTAMP
  click_count: INTEGER
  impression_count: INTEGER
  created_by: UUID (FK to users)
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}

-- QR Code History
qr_history {
  id: UUID (PK)
  user_id: UUID (FK to users)
  type: TEXT
  content: TEXT
  format: TEXT
  size: INTEGER
  error_correction: TEXT
  foreground_color: TEXT
  background_color: TEXT
  logo_url: TEXT
  download_count: INTEGER
  created_at: TIMESTAMP
}

-- Code Snippets
code_snippets {
  id: UUID (PK)
  user_id: UUID (FK to users)
  title: TEXT
  language: TEXT
  code: TEXT
  description: TEXT
  is_public: BOOLEAN
  tags: TEXT[]
  view_count: INTEGER
  like_count: INTEGER
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

## 🎯 Next Steps

After successful setup:

1. **Remove Debug Code:**
   - Remove test buttons from login page
   - Remove console.log statements
   - Clean up temporary code

2. **Configure Production:**
   - Set up environment variables
   - Configure email templates
   - Set up custom domain (if needed)

3. **Add Features:**
   - Real-time subscriptions
   - File upload for logos
   - Advanced analytics
   - Email notifications

## 📞 Support

If you encounter issues:
1. Check Supabase dashboard logs
2. Review browser console errors
3. Verify database table structure
4. Test with simple queries first

---

**Note:** This setup creates a fully functional backend with authentication, database, and real-time capabilities without needing a separate backend server!
