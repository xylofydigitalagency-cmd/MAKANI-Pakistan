# Firebase Architecture & Production Deployment Guide

## 1. Environment Variables Configuration

To connect your real Firebase project to **Makani Pakistan**, create a `.env.local` file (or set variables in your deployment environment) with the following parameters:

```env
# Google AI Studio / Gemini API Key
GEMINI_API_KEY="your-gemini-key"

# App Base URL
APP_URL="https://your-domain.com"

# Firebase Client Configuration (From Firebase Console > Project Settings > Web App)
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-app"
VITE_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"
VITE_FIREBASE_APP_ID="1:1234567890:web:abcdef"

# Designated Administrator Google Account
VITE_ADMIN_EMAIL="xylofydigitalagency@gmail.com"
```

## 2. Firebase Console Setup Checklist

### A. Authentication
1. Go to **Authentication** > **Sign-in method**.
2. Enable **Google Provider** (add project support email).
3. Enable **Phone Provider** (configure SMS quota and test phone numbers if needed).
4. In **Authorized Domains**, add:
   - `localhost`
   - Your Cloud Run domain: `ais-dev-fnethqqeet2vhzltpbhjwi-287589238039.asia-southeast1.run.app`
   - Your custom domain.

### B. Cloud Firestore
1. Create Firestore Database in **Production Mode**.
2. Select your closest region (e.g., `asia-south1` or `asia-southeast1`).
3. Deploy the provided `firestore.rules` file:
   - Enforces default-deny.
   - Public visitors can only query `status == 'approved'` properties.
   - Owner contact phone numbers require authentication.
   - Only `xylofydigitalagency@gmail.com` (or tokens with `admin: true`) can approve listings and payments.

### C. Cloud Storage
1. Initialize Firebase Storage.
2. Create folders:
   - `/properties/{propertyId}/{filename}` (Property photos, minimum 3 required).
   - `/payments/{paymentId}/{filename}` (Manual bank transfer screenshots).
   - `/profiles/{userId}/{filename}` (Avatar images).

## 3. Quota & Credit System Architecture

- **Free Allowance**: Every newly registered Google user receives 5 free published listing credits.
- **Paid Package**: 14 publication credits for PKR 500 via manual bank/mobile transfer (Meezan Bank, JazzCash, EasyPaisa, Nayapay).
- **Separation of Balances**: `freeCreditsRemaining` and `paidCreditsRemaining` are tracked as separate integers.
- **Server-Authoritative Consumption**: Credits are deducted ONLY when an administrator approves a listing. If a listing is rejected or pending, no credit is consumed.
- **Single-Grant Guarantee**: When an admin approves a payment, exactly 14 credits are added once. Repeated approvals are blocked and logged.
