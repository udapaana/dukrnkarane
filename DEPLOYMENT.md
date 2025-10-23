# Deployment Guide

This document describes how to deploy डुकृण्करणे to **dukrnkarane.udapaana.in**.

## Prerequisites

1. **GitHub Repository**: Code hosted at `github.com/udapaana/dukrnkarane`
2. **GitHub Pages**: Enabled in repository settings
3. **DNS Configuration**: A/CNAME records pointing to GitHub Pages
4. **Custom Domain**: `dukrnkarane.udapaana.in` configured in GitHub settings

## Deployment Method

The site uses **GitHub Actions** for automated deployment on every push to main/master branch.

### Workflow File

`.github/workflows/deploy.yml` handles:
- ✅ HTML validation
- ✅ Asset structure verification
- ✅ Content file checks
- ✅ WASM binary validation
- ✅ Automatic deployment to GitHub Pages

## DNS Configuration

Set up the following DNS records in your domain provider (e.g., Cloudflare):

### Option A: CNAME (Recommended)

```
Type: CNAME
Name: dukrnkarane
Target: udapaana.github.io
Proxy: OFF (DNS only)
```

### Option B: A Records

```
Type: A
Name: dukrnkarane
Content: 185.199.108.153

Type: A
Name: dukrnkarane
Content: 185.199.109.153

Type: A
Name: dukrnkarane
Content: 185.199.110.153

Type: A
Name: dukrnkarane
Content: 185.199.111.153
```

## GitHub Pages Configuration

1. Go to repository **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Custom domain: `dukrnkarane.udapaana.in`
4. ✅ Enforce HTTPS

## Manual Deployment Steps

If you need to deploy manually:

```bash
# 1. Ensure all changes are committed
git status

# 2. Push to main/master branch
git push origin main

# 3. GitHub Actions will automatically:
#    - Validate the build
#    - Deploy to GitHub Pages
#    - Make available at dukrnkarane.udapaana.in

# 4. Check deployment status
#    Visit: https://github.com/udapaana/dukrnkarane/actions
```

## Deployment Checklist

Before pushing to production:

- [ ] All local changes tested with `python3 -m http.server`
- [ ] Content files present in `data/sections/` (972 files)
- [ ] Assets properly organized in `assets/` directory
- [ ] WASM files present and not corrupted
- [ ] `CNAME` file contains `dukrnkarane.udapaana.in`
- [ ] HTML references correct asset paths
- [ ] JavaScript points to local content (`data/sections`)
- [ ] README and CHANGELOG updated
- [ ] No sensitive data in repository

## Verification After Deployment

Once deployed, verify:

1. **Site loads**: Visit https://dukrnkarane.udapaana.in
2. **Navigation works**: Click previous/next buttons
3. **Script switching**: Test all 4 scripts (IAST, Devanagari, Telugu, Nandinagari)
4. **Theme toggle**: Switch between light/dark themes
5. **Content loads**: Check multiple sections load correctly
6. **Edit button**: Test edit modal opens
7. **Help modal**: Verify markdown spec displays correctly
8. **Mobile responsive**: Test on mobile devices

## Troubleshooting

### Site not loading

- **Check DNS**: Use `dig dukrnkarane.udapaana.in` or `nslookup`
- **Verify GitHub Pages**: Settings → Pages → should show green checkmark
- **Check CNAME**: Ensure `CNAME` file exists in repository root
- **Wait for propagation**: DNS changes can take up to 48 hours

### 404 Errors on assets

- **Check paths**: All assets should be in `assets/` directory
- **Verify HTML**: References should be `assets/css/styles.css`, not `styles.css`
- **Check case sensitivity**: GitHub Pages is case-sensitive

### WASM not loading

- **Check file size**: `shlesha_bg.wasm` should be ~640KB
- **Verify import path**: Should be `../wasm/shlesha.js` from script.js
- **Check MIME type**: GitHub Pages should serve .wasm as `application/wasm`
- **Browser console**: Check for loading errors

### Content not displaying

- **Check sections**: Verify `data/sections/*.md` files exist
- **Test locally**: Run `python3 -m http.server` and test
- **Check JS console**: Look for fetch errors
- **Verify paths**: Content should load from `data/sections/001.md` etc.

## Rollback Procedure

If deployment fails:

```bash
# 1. Find last working commit
git log --oneline

# 2. Revert to that commit
git revert <commit-hash>

# 3. Push revert
git push origin main

# 4. Or force push to last working state (careful!)
git reset --hard <commit-hash>
git push --force origin main
```

## Build Validation

The GitHub Actions workflow validates:

- ✅ HTML structure and DOCTYPE
- ✅ CSS and JS asset paths
- ✅ WASM files present and sized correctly
- ✅ Content directory structure
- ✅ 900+ section files present
- ✅ Markdown specification exists
- ✅ Documentation files present

## Performance Optimization

The site is optimized for:

- **Initial load**: ~800KB (including WASM)
- **Content caching**: Adjacent sections preloaded
- **Font loading**: `font-display: swap` for Noto fonts
- **Lazy loading**: Help modal loads on demand
- **Compression**: GitHub Pages serves gzip/brotli automatically

## SSL Certificate

GitHub Pages automatically provisions SSL certificates via **Let's Encrypt**:

- ✅ HTTPS enforced
- ✅ Auto-renewal
- ✅ HTTP → HTTPS redirect

## Monitoring

Monitor deployment at:

- **Actions**: https://github.com/udapaana/dukrnkarane/actions
- **Pages**: Settings → Pages
- **Status**: Check https://www.githubstatus.com

## Contact

For deployment issues:

- **Repository Issues**: https://github.com/udapaana/dukrnkarane/issues
- **Workflow Issues**: Check Actions tab for error logs
- **DNS Issues**: Contact domain administrator

---

## Quick Deploy Command

```bash
# One-liner for quick deployment
git add . && git commit -m "Deploy updates" && git push origin main
```

---

**Last Updated**: 2025-10-23
**Domain**: dukrnkarane.udapaana.in
**Method**: GitHub Actions + GitHub Pages
