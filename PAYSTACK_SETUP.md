# Paystack Payment Integration Setup

## Overview
Paystack payment processing has been integrated into the checkout flow. Users will be redirected to Paystack's secure payment page to complete their transactions.

## Setup Steps

### 1. Database Migration
Run the SQL script to add payment fields to the orders table:

```sql
-- Run this in your Supabase SQL Editor
-- File: add-payment-fields.sql
```

This adds:
- `payment_reference` - Stores Paystack transaction reference
- `payment_status` - Tracks payment status (pending, paid, failed, refunded)

### 2. API Keys Configuration
Your Paystack API keys are configured in `lib/paystack.ts`:
- **Public Key**: `pk_test_3fd4a7c967557a5db86c6182ca25e9101e48c0a8`
- **Secret Key**: `sk_test_fdd6d8784af8728172ec9eece03d1d3c4814af5a`

⚠️ **Security Note**: In production, move these keys to environment variables and never commit secret keys to version control.

### 3. How It Works

1. **Checkout Flow**:
   - User enters delivery address and email
   - Clicks "Place Order"
   - Paystack payment modal opens

2. **Payment Processing**:
   - User completes payment on Paystack's secure page
   - Payment is processed securely by Paystack

3. **Order Creation**:
   - After successful payment, transaction is verified
   - Order is created in database with payment reference
   - Cart is cleared
   - User is redirected to orders page

### 4. Testing

Use Paystack test cards for testing:
- **Card Number**: `4084084084084081`
- **CVV**: Any 3 digits (e.g., `408`)
- **Expiry**: Any future date (e.g., `12/25`)
- **PIN**: Any 4 digits (e.g., `0000`)

### 5. Currency Support

Currently configured for **ZAR (South African Rand)**. The amount is automatically converted to cents (smallest currency unit) for Paystack.

### 6. Payment Channels

The integration supports multiple payment methods:
- Card payments
- Bank transfers
- USSD
- QR codes
- Mobile money
- Bank transfers

## Files Modified

- `app/checkout.tsx` - Updated checkout flow with Paystack integration
- `lib/paystack.ts` - Paystack API keys configuration
- `lib/paystackService.ts` - Payment service utilities
- `add-payment-fields.sql` - Database migration script

## Dependencies Added

- `react-native-paystack-webview` - Paystack WebView component
- `react-native-webview` - WebView support

## Production Checklist

Before going live:

- [ ] Replace test keys with live Paystack keys
- [ ] Move API keys to environment variables
- [ ] Update currency if needed (currently ZAR)
- [ ] Test with real transactions
- [ ] Set up webhook endpoints for payment notifications (optional)
- [ ] Configure Paystack dashboard settings
- [ ] Test payment failure scenarios
- [ ] Test payment verification flow

## Troubleshooting

### Payment Not Initializing
- Check that Paystack keys are correct
- Verify internet connection
- Check browser console for errors

### Payment Verification Fails
- Ensure payment_reference is stored correctly
- Check Paystack dashboard for transaction status
- Verify secret key has correct permissions

### Currency Issues
- Paystack supports ZAR, but verify in your Paystack dashboard
- Amount conversion: 1 Rand = 100 cents

## Support

For Paystack-specific issues, refer to:
- [Paystack Documentation](https://paystack.com/docs)
- [Paystack Support](https://paystack.com/support)
