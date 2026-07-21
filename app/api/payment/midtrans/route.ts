import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email } = await request.json()
    const order_id = `myTELMOM-PREM-${crypto.randomUUID()}`

    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (!serverKey) {
      console.error("MIDTRANS_SERVER_KEY is missing")
      return NextResponse.json({ error: 'Payment gateway configuration error' }, { status: 500 })
    }

    const authString = Buffer.from(`${serverKey}:`).toString('base64')

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const payload = {
      transaction_details: {
        order_id: order_id,
        gross_amount: 49000
      },
      item_details: [
        {
          id: 'myTELMOM-PREMIUM',
          price: 49000,
          quantity: 1,
          name: 'myTELMOM Premium (Monthly)'
        }
      ],
      customer_details: {
        email: email || user.email,
        first_name: 'myTELMOM',
        last_name: 'Customer'
      },
      callbacks: {
        finish: `${siteUrl}/checkout/success?order_id=${order_id}`
      }
    }

    const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Midtrans Error:", data)
      return NextResponse.json({ error: `Midtrans Error: ${data.error_messages ? data.error_messages.join(', ') : JSON.stringify(data)}` }, { status: 500 })
    }

    // Return the redirect_url provided by Midtrans Snap
    return NextResponse.json({ redirect_url: data.redirect_url })

  } catch (error: any) {
    console.error("Payment API Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
