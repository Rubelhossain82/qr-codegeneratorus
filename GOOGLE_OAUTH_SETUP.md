# 🔧 Google OAuth Setup Guide

## 🚨 Current Issue
Google OAuth may show "Access blocked: This app's request is invalid" error if the redirect URI is not properly configured in Google Cloud Console.

## ✅ Current Status
- ✅ Supabase Google OAuth is enabled and configured
- ✅ Client ID and Secret are properly set
- ✅ Google OAuth button is enabled and clickable
- 🔧 Google Cloud Console redirect URIs need to be configured

## ✅ Solution Steps

### 1. **Access Google Cloud Console**
- Go to: https://console.cloud.google.com/
- Select your project or create a new one

### 2. **Configure OAuth Consent Screen**
- Go to **APIs & Services** > **OAuth consent screen**
- Choose **External** user type
- Fill in the required information:
  - App name: `Generatorus`
  - User support email: `rubel820746@gmail.com`
  - Developer contact email: `rubel820746@gmail.com`
- Under **Authorized domains**, add: `supabase.co`
- Configure scopes:
  - `../auth/userinfo.email`
  - `../auth/userinfo.profile`
  - `openid`

### 3. **Create OAuth 2.0 Credentials**
- Go to **APIs & Services** > **Credentials**
- Click **Create Credentials** > **OAuth Client ID**
- Choose **Web application**
- Set name: `Generatorus Web Client`

### 4. **Configure Authorized URLs**

#### **Authorized JavaScript origins:**
```
http://localhost:5178
http://localhost:3000
https://generatorus.vercel.app
```

#### **Authorized redirect URIs:**
```
https://ubjdlnlslmmvpconxzcu.supabase.co/auth/v1/callback
http://localhost:5178/auth/callback
http://localhost:3000/auth/callback
https://generatorus.vercel.app/auth/callback
```

**⚠️ IMPORTANT:** The main Supabase callback URL is required for OAuth to work properly.

### 5. **Update Supabase Configuration**
- Copy the **Client ID** and **Client Secret** from Google Cloud Console
- Go to Supabase Dashboard > Authentication > Providers
- Enable Google provider
- Paste the Client ID and Client Secret
- Save the configuration

### 6. **Enable Google Sign-In in Code**
After completing the above steps, update the GoogleSignInButton component to enable the functionality:

```javascript
// Remove the temporary disable code in src/components/auth/GoogleSignInButton.jsx
// Comment out or remove these lines:
// toast.info('Google Sign-In is being configured. Please use email registration for now.')
// return
```

## 🔍 Important Notes

1. **Callback URL Format**: The Supabase callback URL must be exactly:
   `https://ubjdlnlslmmvpconxzcu.supabase.co/auth/v1/callback`

2. **Domain Verification**: Make sure `supabase.co` is added to authorized domains in OAuth consent screen

3. **Testing**: Test with both localhost and production URLs

4. **Security**: Keep your Client Secret secure and never expose it in client-side code

## 🚀 After Setup

Once configured properly:
- Users can sign in with Google with one click
- User profiles will be automatically created in the database
- Google user data will be properly mapped to our user_profiles table
- Users will be redirected to appropriate dashboard based on their role

## 📞 Support

If you encounter issues:
1. Check Google Cloud Console logs
2. Verify all URLs are correctly configured
3. Ensure OAuth consent screen is properly set up
4. Test with different browsers/incognito mode
