import { PAYSTACK_API_BASE, PAYSTACK_SECRET_KEY } from './paystack'

export interface PaymentData {
  email: string
  amount: number // Amount in kobo (smallest currency unit)
  reference?: string
  metadata?: Record<string, any>
}

export interface InitializeTransactionResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

/**
 * Initializes a Paystack payment transaction
 * 
 * @param paymentData - Payment details including email, amount, and optional metadata
 * @returns Promise resolving to transaction initialization response
 * @throws Error if transaction initialization fails
 * 
 * @remarks
 * In production, transaction initialization should be handled on the backend
 * server to prevent exposing the secret key to the client.
 */
export async function initializeTransaction(
  paymentData: PaymentData
): Promise<InitializeTransactionResponse> {
  const reference = paymentData.reference || `ref_${Date.now()}_${Math.random().toString(36).substring(7)}`
  
  const response = await fetch(`${PAYSTACK_API_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: paymentData.email,
      amount: paymentData.amount, // Amount in kobo
      reference,
      metadata: paymentData.metadata || {},
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to initialize transaction')
  }

  return response.json()
}

/**
 * Verify a Paystack transaction
 */
export async function verifyTransaction(reference: string): Promise<any> {
  const response = await fetch(`${PAYSTACK_API_BASE}/transaction/verify/${reference}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to verify transaction')
  }

  return response.json()
}

/**
 * Converts amount from Rand to smallest currency unit (cents)
 * Paystack requires amounts in the smallest currency unit
 * 
 * @param amountInRand - Amount in South African Rand
 * @returns Amount converted to cents (multiplied by 100)
 */
export function convertToKobo(amountInRand: number): number {
  return Math.round(amountInRand * 100)
}
