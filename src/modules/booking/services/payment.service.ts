import { Injectable, Logger } from '@nestjs/common';
import { StripeChargeResponse, StripeRefundResponse } from '../dto/stripe/charge-response.dto';
import { Stripe } from 'stripe';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
  });

  constructor() {}

  async createTokenFromCard(
    cardNumber: string,
    cardExpMonth: string,
    cardExpYear: string,
    cardCvc?: string,
  ): Promise<{token: string}>{
    try {
      const options: Stripe.TokenCreateParams = {
        card: {
            number: cardNumber,
            exp_month: cardExpMonth,
            exp_year: cardExpYear,
            cvc: cardCvc
        }
      };
      const token = await this.stripe.tokens.create(options);
      if (token.id !== null) {
        return {
          token: token.id
        };
      }
      throw new Error('Card failed please try using different card');
    } catch (err) {
      throw err;
    }
  }

  async chargeAmount(
    paymentToken: string,
    amount: number,
    referenceId: string,
    referenceType?: string,
    desc?: string,
  ): Promise<StripeChargeResponse>{
    try {
      amount = amount * 100;
      const options: Stripe.ChargeCreateParams = {
        amount: amount,
        capture: true,
        currency: process.env.STRIPE_CURRENCY,
        description: desc,
        source: paymentToken,
        metadata: { referenceId, referenceType },
      };
      const charge = await this.stripe.charges.create(options);
      if (charge.id !== null && charge.status == 'succeeded' && charge.paid) {
        return {
          transactionId: charge.id,
          transactionData: {
            id: charge.id,
            object: charge.object,
            amount: charge.amount,
            payment_method: charge.payment_method,
            payment_method_details: {
              cardBrand: charge.payment_method_details.card.brand,
              cardCountry: charge.payment_method_details.card.country,
              cardLast4: charge.payment_method_details.card.last4,
              cardType: charge.payment_method_details.card.funding,
              cardExpMon: charge.payment_method_details.card.exp_month,
              cardExpYear: charge.payment_method_details.card.exp_year,
            },
            receipt_url: charge.receipt_url,
          },
        };
      }
      throw new Error('Payment failed please try again or try using different card');
    } catch (err) {
      throw err;
    }
  }

  async refundAmount(
    transactionId: string,
    amount?: number,
    description?: string,
  ): Promise<StripeRefundResponse> {
    try {
      const options: Stripe.RefundCreateParams = {
        currency: process.env.STRIPE_CURRENCY,
        reason: "requested_by_customer",
        charge: transactionId,
        metadata: { description },
      };
      if(amount > 0){
        options.amount = amount * 100;
      }
      const refund = await this.stripe.refunds.create(options);
      if (refund.id !== null && refund.status == 'succeeded') {
        return {
          transactionId: refund.id,
          transactionData: {
            id: refund.id,
            object: refund.object,
            amount: refund.amount,
            charge: refund.charge,
            reason: refund.reason,
          },
        };
      }
      throw new Error('Refund failed please try again later or contact administrator');
    } catch (err) {
      throw err;
    }
  }
}

