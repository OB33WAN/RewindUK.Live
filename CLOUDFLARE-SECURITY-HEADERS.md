# Cloudflare Security Headers (GitHub Pages Origin)

This project is deployed from GitHub Pages and proxied through Cloudflare.
Header files like `_headers` are not applied by GitHub Pages.
Set response headers in Cloudflare instead.

## Recommended Cloudflare setup

1. Open Cloudflare dashboard for your domain.
2. Go to `Rules` -> `Transform Rules` -> `Modify Response Header`.
3. Create one rule targeting `*rewinduk.live/*`.
4. Add these response headers (set/overwrite):

- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.web3forms.com https://sonic.onlineaudience.co.uk https://sonic.onlineaudience.co.uk:8264; frame-src https://sonic.onlineaudience.co.uk; media-src https://sonic.onlineaudience.co.uk https://sonic.onlineaudience.co.uk:8264; form-action 'self' https://api.web3forms.com https://sonic.onlineaudience.co.uk mailto:; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; upgrade-insecure-requests`
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=(), usb=(), fullscreen=(self)`

## Notes

- Keep `security.txt` at `.well-known/security.txt` in this repo.
- Keep Cloudflare SSL mode at `Full (strict)` if possible.
- Enable `Always Use HTTPS` in Cloudflare.
