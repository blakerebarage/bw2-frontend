# Deployment Guide: Fixing ASP.NET Error Page Redirects

## The Problem

Google is indexing an ASP.NET error page (`/Home/Error?aspxerrorpath=...`) as your homepage instead of your React application. This indicates a server configuration issue where ASP.NET responses are being served instead of your React app.

## Solutions Implemented

### 1. Client-Side Redirects (React App)
- ✅ Enhanced `NotFound` component with SEO-friendly 404 handling
- ✅ Added `RedirectHandler` component to catch problematic URLs
- ✅ Improved meta tags and canonical URLs
- ✅ Auto-redirect to homepage after 5 seconds on 404

### 2. Server-Side Configuration Files Created
- ✅ `public/_redirects` - For Netlify/Vercel/similar platforms
- ✅ `nginx.conf` - For Nginx server configuration
- ✅ Updated `robots.txt` - Blocks crawling of error pages
- ✅ Enhanced `sitemap.xml` - Guides search engines to correct pages

## Deployment Instructions by Platform

### For Netlify
1. The `public/_redirects` file is already configured
2. Deploy your app - Netlify will automatically use the redirects
3. Add these headers in Netlify dashboard (optional):
   ```
   /*
     X-Frame-Options: DENY
     X-Content-Type-Options: nosniff
     X-XSS-Protection: 1; mode=block
   ```

### For Vercel
1. Create `vercel.json` in your root directory:
```json
{
  "redirects": [
    {
      "source": "/Home/Error",
      "destination": "/",
      "permanent": true
    },
    {
      "source": "/home/error",
      "destination": "/",
      "permanent": true
    },
    {
      "source": "/Error",
      "destination": "/",
      "permanent": true
    },
    {
      "source": "/error",
      "destination": "/",
      "permanent": true
    },
    {
      "source": "/(Default|Index).(aspx?|asp)",
      "destination": "/",
      "permanent": true
    },
    {
      "source": "/(Member|id-ID/Member)/(.*)",
      "destination": "/",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### For Nginx Server
1. Use the provided `nginx.conf` file
2. Copy it to your Nginx configuration directory
3. Reload Nginx: `sudo nginx -t && sudo systemctl reload nginx`

### For Apache Server
Create `.htaccess` in your `public` directory:
```apache
RewriteEngine On

# Redirect ASP.NET error pages
RewriteRule ^Home/Error/?.*$ / [R=301,L]
RewriteRule ^home/error/?.*$ / [R=301,L]
RewriteRule ^Error/?.*$ / [R=301,L]
RewriteRule ^error/?.*$ / [R=301,L]
RewriteRule ^(Default|Index)\.(aspx?|asp)$ / [R=301,L]
RewriteRule ^(Member|id-ID/Member)/.*$ / [R=301,L]

# Handle React Router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security headers
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
Header always set X-XSS-Protection "1; mode=block"
```

### For Railway/Nixpacks
Since you're using `nixpacks.toml`, Railway will build and deploy automatically. However, you need to ensure proper server configuration:

1. If using Railway's default server, create `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "replicas": 1
  }
}
```

2. Add a startup script that uses a web server with proper redirects

## Immediate Actions Required

### 1. Check Your Current Hosting Setup
```bash
# Test if ASP.NET is still running somewhere
curl -I https://play9.live/Home/Error

# This should return a 301 redirect to / or a 404, not an ASP.NET error
```

### 2. Google Search Console Actions
1. Go to [Google Search Console](https://search.google.com/search-console/)
2. Submit your updated sitemap: `https://play9.live/sitemap.xml`
3. Request removal of the error page URL
4. Use "Fetch as Google" to test your homepage

### 3. Submit Updated Sitemap
```bash
# Test your sitemap is accessible
curl https://play9.live/sitemap.xml

# Submit to Google
# Go to Search Console > Sitemaps > Add new sitemap
# Enter: sitemap.xml
```

## Verification Steps

1. **Test Redirects:**
   ```bash
   curl -I https://play9.live/Home/Error
   # Should return: HTTP/1.1 301 Moved Permanently
   # Location: https://play9.live/
   ```

2. **Check React App Routes:**
   ```bash
   curl -I https://play9.live/casino
   # Should return: HTTP/1.1 200 OK (serving index.html)
   ```

3. **Verify SEO Tags:**
   - Visit https://play9.live/
   - View page source
   - Confirm canonical URL points to https://play9.live/
   - Confirm proper meta tags are present

## Monitoring and Maintenance

1. **Set up monitoring** for the error URLs to ensure they stay redirected
2. **Monitor Google Search Console** for crawl errors
3. **Update sitemap** when adding new pages
4. **Regular SEO audits** to catch similar issues early

## Troubleshooting

### If Google still shows the error page:
1. Use Google's URL removal tool
2. Request re-indexing of your homepage
3. Check if old ASP.NET server is still running

### If redirects don't work:
1. Check server configuration is properly deployed
2. Clear CDN cache if using one
3. Test with different browsers/incognito mode

### If 404s still show React errors:
1. Ensure server serves index.html for all non-file routes
2. Check if service worker is interfering
3. Verify build output includes all necessary files 