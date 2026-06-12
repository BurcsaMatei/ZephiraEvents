// pages/api/konceptid/stripe-webhook.ts
// Webhook Stripe — procesează invoice.paid și salvează factura în data/konceptid/invoices/.
// Body parser dezactivat — Stripe necesită raw Buffer pentru verificarea semnăturii.

import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

import { createFile } from "../../../lib/admin/github";
import type { InvoiceJson } from "../../../types/konceptid";

export const config = {
  api: {
    bodyParser: false,
  },
};

function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  let rawBody: Buffer;
  try {
    rawBody = await getRawBody(req);
  } catch {
    return res.status(400).json({ error: "Failed to read request body" });
  }

  const sig = req.headers["stripe-signature"];
  if (!sig) {
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook signature verification failed";
    return res.status(400).json({ error: message });
  }

  try {
    if (event.type === "invoice.paid") {
      const invoice = event.data.object as Stripe.Invoice;

      const allowedCustomerId = process.env.STRIPE_CUSTOMER_ID;
      if (allowedCustomerId && invoice.customer !== allowedCustomerId) {
        return res.status(200).json({ received: true });
      }

      const invoiceJson: InvoiceJson = {
        id: invoice.id,
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency.toUpperCase(),
        status: "paid",
        dueDate: invoice.due_date
          ? new Date(invoice.due_date * 1000).toISOString()
          : new Date().toISOString(),
        paidAt: invoice.status_transitions.paid_at
          ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
          : new Date().toISOString(),
        invoicePdfUrl: invoice.invoice_pdf ?? null,
        hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
        createdAt: new Date().toISOString(),
      };

      await createFile(
        `data/konceptid/invoices/invoice-${Date.now()}.json`,
        JSON.stringify(invoiceJson, null, 2),
      );
    }

    return res.status(200).json({ received: true });
  } catch {
    return res.status(500).json({ error: "Internal error" });
  }
}
