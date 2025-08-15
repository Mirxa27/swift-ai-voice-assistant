import { Client, Environment, OrdersController } from '@paypal/paypal-server-sdk'
import { prisma } from '../db'

export class PayPalService {
  private client: Client
  private ordersController: OrdersController

  constructor() {
    this.client = new Client({
      environment: process.env.NODE_ENV === 'production' 
        ? Environment.Production 
        : Environment.Sandbox,
    })
    
    this.ordersController = new OrdersController(this.client)
  }

  // Subscription Plans
  private plans = {
    DISCOVERY: {
      id: 'discovery-plan',
      name: 'Discovery Plan',
      price: 0,
      minutes: 10,
    },
    GROWTH: {
      id: process.env.PAYPAL_GROWTH_PLAN_ID || 'growth-plan',
      name: 'Growth Plan',
      price: 22,
      minutes: 100,
    },
    TRANSFORMATION: {
      id: process.env.PAYPAL_TRANSFORMATION_PLAN_ID || 'transformation-plan',
      name: 'Transformation Plan',
      price: 222,
      minutes: 1000,
    },
  }

  async createSubscription(userId: string, planType: 'GROWTH' | 'TRANSFORMATION') {
    try {
      const plan = this.plans[planType]
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Create subscription with PayPal
      const subscriptionRequest = {
        plan_id: plan.id,
        subscriber: {
          name: {
            given_name: user.name?.split(' ')[0] || 'User',
            surname: user.name?.split(' ')[1] || '',
          },
          email_address: user.email,
        },
        application_context: {
          brand_name: 'Newomen',
          locale: 'en-US',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          payment_method: {
            payer_selected: 'PAYPAL',
            payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
          },
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/cancel`,
        },
      }

          // Mock implementation - replace with actual PayPal API call
    const response = {
      result: {
        id: `MOCK-SUB-${Date.now()}`,
        links: [{ rel: 'approve', href: `https://www.paypal.com/checkoutnow?token=MOCK-${Date.now()}` }]
      }
    }

      const subscriptionId = response.result.id

      // Update or create subscription in database
      if (user.subscription) {
        await prisma.subscription.update({
          where: { id: user.subscription.id },
          data: {
            plan: planType,
            status: 'PENDING',
            paypalSubscriptionId: subscriptionId,
            minutesRemaining: plan.minutes,
          },
        })
      } else {
        await prisma.subscription.create({
          data: {
            userId,
            plan: planType,
            status: 'PENDING',
            paypalSubscriptionId: subscriptionId,
            minutesRemaining: plan.minutes,
            minutesUsed: 0,
          },
        })
      }

      // Return approval URL for user to complete payment
      const approvalUrl = response.result.links?.find(
        link => link.rel === 'approve'
      )?.href

      return {
        subscriptionId,
        approvalUrl,
      }
    } catch (error) {
      console.error('PayPal subscription creation error:', error)
      throw new Error('Failed to create subscription')
    }
  }

  async activateSubscription(subscriptionId: string) {
    try {
          // Mock implementation - replace with actual PayPal API call
    const paypalSubscription = {
      id: subscriptionId,
      billing_info: { next_billing_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }
    }

      // Update database subscription
      const subscription = await prisma.subscription.findFirst({
        where: { paypalSubscriptionId: subscriptionId },
      })

      if (!subscription) {
        throw new Error('Subscription not found')
      }

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE',
          startDate: new Date(),
          renewalDate: new Date(paypalSubscription.billing_info?.next_billing_time || ''),
        },
      })

      // Create payment record
      await prisma.payment.create({
        data: {
          subscriptionId: subscription.id,
          amount: this.plans[subscription.plan as keyof typeof this.plans].price,
          currency: 'USD',
          status: 'COMPLETED',
          paypalPaymentId: paypalSubscription.id,
        },
      })

      return subscription
    } catch (error) {
      console.error('PayPal subscription activation error:', error)
      throw new Error('Failed to activate subscription')
    }
  }

  async cancelSubscription(userId: string, reason?: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      })

      if (!user?.subscription?.paypalSubscriptionId) {
        throw new Error('No active subscription found')
      }

      // Mock implementation - replace with actual PayPal API call
      console.log('Cancelling subscription:', user.subscription.paypalSubscriptionId)

      // Update database
      await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      })

      return { success: true }
    } catch (error) {
      console.error('PayPal subscription cancellation error:', error)
      throw new Error('Failed to cancel subscription')
    }
  }

  async handleWebhook(headers: any, body: any) {
    try {
      // Verify webhook signature
      const webhookId = process.env.PAYPAL_WEBHOOK_ID
      if (!this.verifyWebhookSignature(headers, body, webhookId)) {
        throw new Error('Invalid webhook signature')
      }

      const event = body
      
      switch (event.event_type) {
        case 'BILLING.SUBSCRIPTION.ACTIVATED':
          await this.handleSubscriptionActivated(event)
          break
        case 'BILLING.SUBSCRIPTION.CANCELLED':
          await this.handleSubscriptionCancelled(event)
          break
        case 'BILLING.SUBSCRIPTION.EXPIRED':
          await this.handleSubscriptionExpired(event)
          break
        case 'PAYMENT.SALE.COMPLETED':
          await this.handlePaymentCompleted(event)
          break
        case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
          await this.handlePaymentFailed(event)
          break
        default:
          console.log(`Unhandled webhook event: ${event.event_type}`)
      }

      return { success: true }
    } catch (error) {
      console.error('Webhook processing error:', error)
      throw error
    }
  }

  private verifyWebhookSignature(headers: any, body: any, webhookId?: string): boolean {
    // TODO: Implement PayPal webhook signature verification
    // This requires the webhook ID and verification with PayPal's API
    return true // Simplified for now
  }

  private async handleSubscriptionActivated(event: any) {
    const subscriptionId = event.resource.id
    await this.activateSubscription(subscriptionId)
  }

  private async handleSubscriptionCancelled(event: any) {
    const subscriptionId = event.resource.id
    const subscription = await prisma.subscription.findFirst({
      where: { paypalSubscriptionId: subscriptionId },
    })

    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      })
    }
  }

  private async handleSubscriptionExpired(event: any) {
    const subscriptionId = event.resource.id
    const subscription = await prisma.subscription.findFirst({
      where: { paypalSubscriptionId: subscriptionId },
    })

    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'EXPIRED',
          endDate: new Date(),
        },
      })
    }
  }

  private async handlePaymentCompleted(event: any) {
    const payment = event.resource
    const subscriptionId = payment.billing_agreement_id

    const subscription = await prisma.subscription.findFirst({
      where: { paypalSubscriptionId: subscriptionId },
    })

    if (subscription) {
      // Record payment
      await prisma.payment.create({
        data: {
          subscriptionId: subscription.id,
          amount: parseFloat(payment.amount.total),
          currency: payment.amount.currency,
          status: 'COMPLETED',
          paypalPaymentId: payment.id,
        },
      })

      // Refresh minutes for the subscription
      const plan = this.plans[subscription.plan as keyof typeof this.plans]
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          minutesRemaining: subscription.minutesRemaining + plan.minutes,
          renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      })
    }
  }

  private async handlePaymentFailed(event: any) {
    const subscriptionId = event.resource.id
    const subscription = await prisma.subscription.findFirst({
      where: { paypalSubscriptionId: subscriptionId },
    })

    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'SUSPENDED',
        },
      })

      // TODO: Send email notification to user about payment failure
    }
  }

  async getSubscriptionDetails(subscriptionId: string) {
    try {
      // Mock implementation - replace with actual PayPal API call
      return {
        id: subscriptionId,
        status: 'ACTIVE',
        billing_info: { next_billing_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }
      }
    } catch (error) {
      console.error('Failed to get subscription details:', error)
      throw error
    }
  }
}

// Singleton instance
let paypalService: PayPalService | null = null

export function getPayPalService(): PayPalService {
  if (!paypalService) {
    paypalService = new PayPalService()
  }
  return paypalService
}

export default getPayPalService()