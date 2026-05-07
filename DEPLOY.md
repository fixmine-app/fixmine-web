# FixMine DOKU Payment — Full Deploy

## ARCHITECTURE
Customer → fixmine.app/pricing → /api/payment/create → DOKU checkout
DOKU → gominers.id/api/payment-webhook (payment confirmed)
gominers → fixmine.app/api/payment/activate (activate user plan)

## STEP 1 — Generate shared secret (run in Git Bash)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
Save the output — this is your FIXMINE_WEBHOOK_SECRET
Give this secret to gominers team so they can call /api/payment/activate

## STEP 2 — Run SQL in Supabase
Paste supabase-payment.sql → Run

## STEP 3 — Copy files into project
src/app/api/payment/create/route.ts
src/app/api/payment/activate/route.ts
src/app/api/payment/status/route.ts
src/app/pricing/page.tsx

## STEP 4 — Add env vars
npx vercel env add DOKU_CLIENT_ID production
# BRN-0280-1777102334281

npx vercel env add DOKU_SECRET_KEY production
# SK-QKbcPUHEiwGFsqws0Wts

npx vercel env add FIXMINE_WEBHOOK_SECRET production
# (the secret you generated in Step 1)

## STEP 5 — Deploy
npx vercel --prod

## STEP 6 — Tell gominers team
Endpoint: POST https://fixmine.app/api/payment/activate
Header: Authorization: Bearer <FIXMINE_WEBHOOK_SECRET>
Body: { user_id, plan_id, plan_days, invoice_number, amount }

## STEP 7 — Set webhook in DOKU Dashboard
Settings → Notification URL: https://www.gominers.id/api/payment-webhook

## STEP 8 — Delete Midtrans vars from Vercel
vercel.com → Settings → Environment Variables
Delete: MIDTRANS_SERVER_KEY, NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
