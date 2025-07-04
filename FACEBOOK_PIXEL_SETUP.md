# Facebook Pixel Setup - Login, Register & Home Page

## Quick Setup

### 1. Get Your Facebook Pixel ID
1. Go to [Facebook Business Manager](https://business.facebook.com/)
2. Navigate to Events Manager
3. Create a new Pixel or use an existing one
4. Copy your Pixel ID (it looks like: `123456789012345`)

### 2. Update the Pixel ID
Replace `YOUR_PIXEL_ID_HERE` in `index.html` with your actual Facebook Pixel ID:
- Line 15: `fbq('init', 'YOUR_PIXEL_ID_HERE');`
- Line 22: `src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID_HERE&ev=PageView&noscript=1"`

## Events Currently Tracked

### ✅ Automatic Events
- **PageView**: Tracked automatically on every page load
- **CompleteRegistration**: When users successfully register
- **Login**: When users successfully log in
- **ViewContent**: When users visit the home page

### 📍 Tracking Locations

#### Login Page (`src/pages/home/Login/Login.jsx`)
- Tracks successful login events
- Includes user ID, role, and login method

#### Register Page (`src/pages/home/Register/Register.jsx`)
- Tracks successful registration events
- Includes user ID, registration method, referral info

#### Home Page (`src/pages/home/Home/Home.jsx`)
- Tracks home page visits
- Includes page type and user type

## Testing

### 1. Facebook Pixel Helper
1. Install [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedmicjlmbpobgjfmdk) Chrome extension
2. Visit your website
3. Click the extension icon to see tracked events

### 2. Test Events
- **Login**: Go to login page and successfully log in
- **Register**: Go to register page and create a new account
- **Home**: Visit the home page

## Files Modified

- ✅ `index.html` - Base pixel code added
- ✅ `src/lib/facebookPixel.js` - Tracking utility functions
- ✅ `src/pages/home/Login/Login.jsx` - Login event tracking
- ✅ `src/pages/home/Register/Register.jsx` - Registration event tracking
- ✅ `src/pages/home/Home/Home.jsx` - Home page visit tracking

## Next Steps

1. Replace `YOUR_PIXEL_ID_HERE` with your actual Pixel ID
2. Test the events using Facebook Pixel Helper
3. Check Facebook Events Manager to verify events are firing
4. Set up Facebook Ads campaigns using the tracked events

## Support

If you need help:
1. Check browser console for errors
2. Verify Pixel ID is correct
3. Test with Facebook Pixel Helper
4. Check Facebook Events Manager 