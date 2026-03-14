# Security Policy

## Scope

This repository contains the static frontend for RewindUK Live.

Security issues in scope include:

- XSS, injection, or unsafe DOM rendering in the frontend.
- Misconfigured third-party embeds or form integrations.
- Broken access control or data exposure caused by site code.
- Unsafe references in `robots.txt`, `sitemap.xml`, or `.well-known/security.txt`.

Platform-level issues such as DNS, TLS certificates, hosting account access, and CDN configuration are handled in the hosting provider dashboard rather than this repo.

## Supported Version

Only the current contents of the default branch are supported.

## Reporting a Vulnerability

Report security issues to `contact@rewinduk.live`.

Include:

- A short description of the issue.
- The affected page or file.
- Steps to reproduce.
- Screenshots, console errors, or request details where useful.

If the issue affects the live domain, also mention whether it appears to be:

- A frontend code issue.
- A hosting or DNS issue.
- A third-party integration issue.

## Response Expectations

- Initial acknowledgement target: within 5 business days.
- Valid reports will be investigated and fixed according to severity and deployment impact.
- If the issue is outside this repo and belongs to the hosting provider, it should be remediated in the relevant provider dashboard.
