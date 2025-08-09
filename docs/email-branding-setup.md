# Generatorus Email Branding Setup Guide

This guide will help you customize the Supabase email templates to use Generatorus branding instead of the default Supabase branding.

## Steps to Configure Email Branding

### 1. Access Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your Generatorus project

### 2. Navigate to Authentication Settings
1. In the left sidebar, click on "Authentication"
2. Click on "Settings" tab
3. Scroll down to the "Email Templates" section

### 3. Update Email Subjects
Replace the default subjects with these Generatorus-branded versions:

- **Confirmation Email**: `Welcome to Generatorus - Confirm Your Account`
- **Magic Link**: `Your Generatorus Magic Link`
- **Email Change**: `Generatorus - Confirm Email Change`
- **Password Recovery**: `Generatorus - Reset Your Password`
- **Invite**: `You're Invited to Join Generatorus`
- **Reauthentication**: `Generatorus - Confirm Reauthentication`

### 4. Update Email Templates

#### Confirmation Email Template
Replace the confirmation email template with:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
  <div style="background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
    <h1 style="color: #00d4ff; font-size: 28px; margin: 0; font-weight: bold;">Generatorus</h1>
    <p style="color: rgba(255, 255, 255, 0.8); margin: 10px 0 0 0; font-size: 16px;">Your Ultimate QR Code & Barcode Generator</p>
  </div>
  
  <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #1a1a2e; font-size: 24px; margin: 0 0 20px 0;">Welcome to Generatorus!</h2>
    
    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Thank you for joining our platform! We're excited to have you on board.</p>
    
    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">To complete your registration and start creating amazing QR codes and barcodes, please confirm your email address by clicking the button below:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" style="background: linear-gradient(135deg, #00d4ff 0%, #ff6b9d 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Confirm Your Account</a>
    </div>
    
    <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">If the button doesn't work, you can copy and paste this link into your browser:</p>
    <p style="color: #00d4ff; font-size: 14px; word-break: break-all; margin: 5px 0 0 0;">{{ .ConfirmationURL }}</p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #718096; font-size: 12px;">
    <p>© 2024 Generatorus. All rights reserved.</p>
  </div>
</div>
```

#### Password Recovery Email Template
Replace the password recovery template with:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
  <div style="background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
    <h1 style="color: #00d4ff; font-size: 28px; margin: 0; font-weight: bold;">Generatorus</h1>
    <p style="color: rgba(255, 255, 255, 0.8); margin: 10px 0 0 0; font-size: 16px;">Your Ultimate QR Code & Barcode Generator</p>
  </div>
  
  <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #1a1a2e; font-size: 24px; margin: 0 0 20px 0;">Reset Your Password</h2>
    
    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">We received a request to reset your Generatorus account password.</p>
    
    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">Click the button below to create a new password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" style="background: linear-gradient(135deg, #00d4ff 0%, #ff6b9d 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
    </div>
    
    <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #718096; font-size: 12px;">
    <p>© 2024 Generatorus. All rights reserved.</p>
  </div>
</div>
```

### 5. Update SMTP Settings
In the SMTP settings section:
- Set **Sender Name** to: `Generatorus`
- This will ensure emails appear to come from "Generatorus" instead of the default sender

### 6. Save Changes
Click "Save" to apply all the email template changes.

## Testing the Email Templates

1. Create a test account to verify the confirmation email
2. Try the password reset flow to test the recovery email
3. Check that emails now display "Generatorus" branding

## Additional Customizations

You can further customize:
- Magic Link email template
- Email change confirmation template
- Invite email template
- Reauthentication email template

Follow the same pattern as above, using the Generatorus branding elements:
- Colors: #00d4ff (primary blue), #ff6b9d (accent pink)
- Background gradient: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%)
- Company name: "Generatorus"
- Tagline: "Your Ultimate QR Code & Barcode Generator"

## Notes
- All email templates support HTML and CSS styling
- Use the `{{ .ConfirmationURL }}` variable for action links
- Test thoroughly before deploying to production
- Keep email templates mobile-responsive
