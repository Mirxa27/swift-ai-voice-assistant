import { NextRequest, NextResponse } from 'next/server'
import { getPayPalService } from '@/lib/payments/paypal'

export async function POST(request: NextRequest) {
  try {
    // Get webhook headers
    const headers = {
      'paypal-transmission-id': request.headers.get('paypal-transmission-id'),
      'paypal-transmission-time': request.headers.get('paypal-transmission-time'),
      'paypal-transmission-sig': request.headers.get('paypal-transmission-sig'),
      'paypal-cert-url': request.headers.get('paypal-cert-url'),
      'paypal-auth-algo': request.headers.get('paypal-auth-algo'),
    }

    // Get webhook body
    const body = await request.json()

    // Process webhook
    const paypalService = getPayPalService()
    const result = await paypalService.handleWebhook(headers, body)

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// PayPal webhooks require specific headers
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'