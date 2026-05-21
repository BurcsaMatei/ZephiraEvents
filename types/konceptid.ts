export type ContractJson = {
  clientName: string;
  plan: string;
  priceMonthly: number;
  currency: string;
  startDate: string;
  nextBillingDate: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripeProductId: string;
  stripePriceId: string;
  paymentMethod: string;
  status: "active" | "cancelled" | "paused";
  billingCycle: "monthly" | "biannual" | "annual";
  paymentLinkMonthly: string;
  paymentLinkBiannual: string;
  paymentLinkAnnual: string;
};

export type InvoiceJson = {
  id: string;
  stripeInvoiceId: string;
  amount: number;
  currency: string;
  status: "paid" | "unpaid" | "void";
  dueDate: string;
  paidAt: string | null;
  invoicePdfUrl: string | null;
  hostedInvoiceUrl: string | null;
  createdAt: string;
};
