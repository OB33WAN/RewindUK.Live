# Hosting Notes

This site is currently hosted on GitHub Pages.

The domain registration may sit with Squarespace, but the live DNS and traffic path do not currently terminate there.

Current live path:

- Registrar: Squarespace
- Authoritative DNS: Cloudflare nameservers
- Hosting origin: GitHub Pages

## Current blocker

The custom domain is reaching GitHub Pages, but HTTPS validation is failing because the custom-domain setup is not complete end to end.

Current symptoms:

- `rewinduk.live` resolves to GitHub Pages IPs.
- `www.rewinduk.live` does not exist yet.
- HTTPS validation returns a certificate principal mismatch.

## GitHub Pages custom-domain checklist

1. Keep the GitHub Pages apex `A` records for `rewinduk.live` if GitHub Pages remains the host.
2. Add a root `CNAME` file in this repo containing `rewinduk.live`.
3. In the GitHub Pages repository settings, set the custom domain to `rewinduk.live`.
4. Enable `Enforce HTTPS` in GitHub Pages once GitHub finishes certificate provisioning.
5. Add a `www` DNS record if you want the `www` host to work too.
6. If Cloudflare remains authoritative for DNS, manage the DNS records there.

## Important note on headers

If Cloudflare is no longer proxying traffic, old Cloudflare response-header rules will not affect the live site. Security headers must come from the active edge or origin actually serving requests.

## What this repo still controls

- Page markup, content, and metadata.
- Static assets, manifest, robots, sitemap, and `.well-known/security.txt`.
- The GitHub Pages custom-domain file `CNAME`.
- Frontend behavior in `app.js` and styling in `styles.css`.

## What this repo does not fix

- Missing or incorrect DNS records.
- GitHub Pages custom-domain settings in the repository dashboard.
- TLS issuance timing on the active hosting platform.
