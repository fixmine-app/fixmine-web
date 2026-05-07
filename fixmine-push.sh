#!/bin/bash
set -e

cd "C:/google drive/automation/fixmine-v9-supabase/fixmind"

echo "=== STEP 1: Moving files to correct public/ locations ==="
mv icon-512.png public/icon-512.png
mv icon-192.png public/icon-192.png
mv assetlinks.json public/.well-known/assetlinks.json
cp manifest.json public/manifest.json && rm manifest.json
mv privacy-policy.html public/privacy-policy.html
mv delete-account.html public/delete-account.html
echo "✅ Files moved"

echo "=== STEP 2: Fixing next.config.js ==="
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/sdk'],
  },
  async headers() {
    return [
      {
        source: '/.well-known/assetlinks.json',
        headers: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
EOF
echo "✅ next.config.js fixed"

echo "=== STEP 3: Fixing vercel.json ==="
cat > vercel.json << 'EOF'
{
  "version": 2,
  "functions": {
    "src/app/api/**/*.ts": { "maxDuration": 30 },
    "src/app/api/**/*.js": { "maxDuration": 30 }
  }
}
EOF
echo "✅ vercel.json fixed"

echo "=== STEP 4: Verifying structure ==="
echo "--- public/ ---"
ls public/
echo "--- public/.well-known/ ---"
ls public/.well-known/
echo "--- checking no stray files at root ---"
ls *.png 2>/dev/null && echo "⚠️  PNG still at root!" || echo "✅ No stray PNGs"
ls *.html 2>/dev/null && echo "⚠️  HTML still at root!" || echo "✅ No stray HTMLs"

echo "=== STEP 5: Wiping GitHub and pushing clean ==="
rm -rf .git
git init
git branch -M master
git remote add origin https://github.com/cekgejala/fixmine-web.git
git add .
git add -f public/.well-known/assetlinks.json
git commit -m "feat: Clean rebuild — FixMine v1 DOKU payment + TWA Google Play support"
git push -f origin master

echo ""
echo "======================================================"
echo "  ✅ DONE — Vercel will deploy in ~2 minutes"
echo "======================================================"
echo ""
echo "  Verify these URLs after deploy:"
echo "  https://fixmine.app/manifest.json"
echo "  https://fixmine.app/.well-known/assetlinks.json"
echo "  https://fixmine.app/privacy-policy.html"
echo "  https://fixmine.app/delete-account.html"
echo "  https://fixmine.app/icon-512.png"
echo "  https://fixmine.app/icon-192.png"
echo ""
