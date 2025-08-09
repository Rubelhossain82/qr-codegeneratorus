# Generatorus Email Templates

## Email Change Confirmation Template

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
  <div style="background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
    <h1 style="color: #00d4ff; font-size: 28px; margin: 0; font-weight: bold;">Generatorus</h1>
    <p style="color: rgba(255, 255, 255, 0.8); margin: 10px 0 0 0; font-size: 16px;">Your Ultimate QR Code & Barcode Generator</p>
  </div>
  
  <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #1a1a2e; font-size: 24px; margin: 0 0 20px 0;">Confirm Email Change</h2>
    
    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">You've requested to change your email address from <strong>{{ .Email }}</strong> to <strong>{{ .NewEmail }}</strong>.</p>
    
    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">To confirm this change, please click the button below:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" style="background: linear-gradient(135deg, #00d4ff 0%, #ff6b9d 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Confirm Email Change</a>
    </div>
    
    <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">If you didn't request this change, please ignore this email.</p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #718096; font-size: 12px;">
    <p>© 2024 Generatorus. All rights reserved.</p>
  </div>
</div>
```

## Magic Link Template

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
  <div style="background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
    <h1 style="color: #00d4ff; font-size: 28px; margin: 0; font-weight: bold;">Generatorus</h1>
    <p style="color: rgba(255, 255, 255, 0.8); margin: 10px 0 0 0; font-size: 16px;">Your Ultimate QR Code & Barcode Generator</p>
  </div>
  
  <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #1a1a2e; font-size: 24px; margin: 0 0 20px 0;">Your Magic Link</h2>
    
    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Click the button below to securely sign in to your Generatorus account:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" style="background: linear-gradient(135deg, #00d4ff 0%, #ff6b9d 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Sign In to Generatorus</a>
    </div>
    
    <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">This link will expire in 1 hour for security reasons.</p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #718096; font-size: 12px;">
    <p>© 2024 Generatorus. All rights reserved.</p>
  </div>
</div>
```

## Invite Template

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
  <div style="background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
    <h1 style="color: #00d4ff; font-size: 28px; margin: 0; font-weight: bold;">Generatorus</h1>
    <p style="color: rgba(255, 255, 255, 0.8); margin: 10px 0 0 0; font-size: 16px;">Your Ultimate QR Code & Barcode Generator</p>
  </div>
  
  <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #1a1a2e; font-size: 24px; margin: 0 0 20px 0;">You're Invited!</h2>
    
    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">You've been invited to join Generatorus, the ultimate QR code and barcode generator platform.</p>
    
    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">Click the button below to accept the invitation and create your account:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" style="background: linear-gradient(135deg, #00d4ff 0%, #ff6b9d 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Accept Invitation</a>
    </div>
    
    <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">If you don't want to create an account, you can safely ignore this email.</p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #718096; font-size: 12px;">
    <p>© 2024 Generatorus. All rights reserved.</p>
  </div>
</div>
```

## Email Subjects

- **Confirmation**: `Welcome to Generatorus - Confirm Your Account`
- **Magic Link**: `Your Generatorus Magic Link`
- **Email Change**: `Generatorus - Confirm Email Change`
- **Password Recovery**: `Generatorus - Reset Your Password`
- **Invite**: `You're Invited to Join Generatorus`
- **Reauthentication**: `Generatorus - Confirm Reauthentication`

## SMTP Settings

- **Sender Name**: `Generatorus`
