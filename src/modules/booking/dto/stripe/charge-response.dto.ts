export class StripeChargeResponse {
  transactionId: string;
  transactionData: {
    id: string;
    object: string;
    amount: number;
    payment_method: string;
    payment_method_details: {
        cardBrand: string,
        cardCountry: string,
        cardLast4: string,
        cardType: string,
        cardExpMon: number,
        cardExpYear: number,
    };
    receipt_url: string;
  };
}


export class StripeRefundResponse {
    transactionId: string;
    transactionData: {
      id: string;
      object: string;
      amount: number;
      charge: any;
      reason: string;
    };
  }
  