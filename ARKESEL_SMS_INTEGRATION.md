# Arkesel SMS Integration Guide

## Why Arkesel?
- ⚡ **Fastest Approval** in Ghana (usually within hours, sometimes instant!)
- 💰 **Affordable**: ~4 pesewas per SMS
- 🇬🇭 **Ghana-based**: Better support and understanding of local needs
- 📱 **WhatsApp Too**: They also support WhatsApp messages!
- 🔒 **Reliable**: Used by major Ghana businesses

---

## Step 1: Sign Up for Arkesel

1. Go to: https://arkesel.com
2. Click **"Get Started"** or **"Sign Up"**
3. Fill in your details:
   - Business Name: **Rekon360** (or your company)
   - Email
   - Phone Number
   - Business Type: **SaaS/Software**

4. Submit application
5. **Wait**: Usually approved within 1-4 hours ⚡

---

## Step 2: Get Your API Credentials

Once approved:

1. Login to Arkesel Dashboard
2. Go to **"Settings"** → **"API Keys"**
3. Copy your:
   - **API Key**: `ark_live_xxxxxxxxxxxxxxxx`
   - **Sender ID**: Your approved sender name (e.g., "Rekon360")

---

## Step 3: Add to Your Backend

### Update POSSection.tsx

Find the `sendSMSReceipt` function and update it:

```javascript
const sendSMSReceipt = async () => {
  if (!smsPhone || !lastSale) {
    toast.error("Please enter a valid phone number")
    return
  }

  try {
    setSmsSending(true)

    // Format receipt message (max 160 chars for 1 SMS)
    const smsMessage = `Rekon360 Receipt: ${lastSale.items.map(item =>
      `${item.name} x${item.quantity}`
    ).join(', ')}. Total: GHS${lastSale.total.toFixed(2)}. Receipt: ${lastSale.id}. Powered by Rekon360`

    // Send via Arkesel API
    const response = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
      method: 'POST',
      headers: {
        'api-key': 'YOUR_ARKESEL_API_KEY', // Replace with your key
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: 'Rekon360', // Your approved sender ID
        message: smsMessage,
        recipients: [smsPhone] // Must be in format: 0241234567 or 233241234567
      })
    })

    const data = await response.json()

    if (data.code === '1000' || data.status === 'success') {
      toast.success(`Receipt sent to ${smsPhone} via SMS!`)
      setSmsDialogOpen(false)
      setSmsPhone('')
    } else {
      toast.error(`Failed: ${data.message || 'Unknown error'}`)
    }

  } catch (error) {
    console.error('Error sending SMS:', error)
    toast.error("Failed to send SMS receipt")
  } finally {
    setSmsSending(false)
  }
}
```

---

## Step 4: Test SMS

### Test Numbers:
```
Ghana format: 0241234567
International: 233241234567
```

### Test Message:
```
Rekon360 Receipt: Milo 400g x2, Bread x1. Total: GHS32.50. Receipt: RCP1234567890. Powered by Rekon360
```

---

## Pricing Breakdown

| SMS Count | Cost (GHS) | Per SMS |
|-----------|------------|---------|
| 100 SMS   | ~4.00      | 4 pesewas |
| 500 SMS   | ~18.00     | 3.6 pesewas |
| 1000 SMS  | ~35.00     | 3.5 pesewas |

**Recommendation:** Start with 500 SMS package (GHS 18) for testing

---

## Best Practices

### 1. **Keep Messages Short** (Save Money!)
- ✅ Good: "Receipt: Item x2. Total: GHS50. #1234"
- ❌ Bad: Long descriptions that require 2-3 SMS

### 2. **Phone Number Format**
```javascript
// Clean phone number before sending
function cleanPhoneNumber(phone) {
  // Remove spaces, dashes, etc.
  let cleaned = phone.replace(/\D/g, '')

  // Add 233 if it starts with 0
  if (cleaned.startsWith('0')) {
    cleaned = '233' + cleaned.substring(1)
  }

  return cleaned
}
```

### 3. **Error Handling**
```javascript
// Check response codes
if (data.code === '1000') {
  // Success
} else if (data.code === '1001') {
  // Insufficient credit
  toast.error("Low SMS balance. Please top up!")
} else if (data.code === '1002') {
  // Invalid phone number
  toast.error("Invalid phone number format")
}
```

---

## Alternative: Batch SMS

For **Daily Reports to Admin**:

```javascript
// Send daily summary to business owner
async function sendDailySummary(adminPhone, salesData) {
  const message = `Rekon360 Daily Report: Today's sales: GHS${salesData.total}. Transactions: ${salesData.count}. Top item: ${salesData.topProduct}. View details: rekon360.com`

  const response = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
    method: 'POST',
    headers: {
      'api-key': 'YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sender: 'Rekon360',
      message: message,
      recipients: [adminPhone]
    })
  })

  return response.json()
}
```

**Schedule**: Send at 9 PM every day (end of business)

---

## Troubleshooting

### Issue: "Invalid Sender ID"
**Fix**: Make sure you're using your **approved sender ID** from Arkesel dashboard

### Issue: "Insufficient Balance"
**Fix**: Top up your Arkesel account with Mobile Money

### Issue: "Invalid Phone Number"
**Fix**: Use format `0241234567` or `233241234567` (no spaces!)

### Issue: Message Not Received
**Check**:
1. Phone number correct?
2. Sufficient balance in Arkesel?
3. Network coverage?
4. Check Arkesel dashboard logs

---

## WhatsApp Integration (Bonus!)

Arkesel also supports WhatsApp!

### Benefits:
- ✅ Rich formatting (bold, italics)
- ✅ Images (send receipt as image!)
- ✅ Cheaper than SMS
- ✅ Better delivery rates

### How to Enable:
1. Contact Arkesel support
2. Request WhatsApp Business API access
3. Get WhatsApp API credentials
4. Update code to use WhatsApp endpoint

---

## Cost Comparison

| Method | Cost per Receipt | Features |
|--------|-----------------|----------|
| **SMS** | 4 pesewas | Simple, universal, reliable |
| **WhatsApp** | 2 pesewas | Rich format, images, cheaper |
| **Email** | Free | Requires internet, not everyone checks |

**Recommendation**: Offer both SMS + WhatsApp, let customer choose!

---

## Support

- **Arkesel Support**: support@arkesel.com
- **Phone**: Check their website
- **Response Time**: Usually same day

---

## Next Steps After Integration

1. ✅ Test with your own phone number
2. ✅ Test with 5 different Ghana networks (MTN, Vodafone, AirtelTigo)
3. ✅ Monitor delivery rates in Arkesel dashboard
4. ✅ Set up low balance alerts
5. ✅ Add to admin settings: SMS on/off toggle

---

## Security Notes

⚠️ **NEVER** commit your API key to GitHub!

Store it securely:
```javascript
// In your environment variables
const ARKESEL_API_KEY = process.env.ARKESEL_API_KEY

// Or in Supabase Edge Function secrets
const ARKESEL_API_KEY = Deno.env.get('ARKESEL_API_KEY')
```

---

## ROI Calculator

If you charge **50 GHS/month** and send **10 SMS per business** per month:
- SMS cost: 10 × 0.04 = 0.40 GHS
- Your profit: 50 - 0.40 = **49.60 GHS** (99.2% margin!)

SMS is **very cheap** compared to your subscription fee! 💰
