import type { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "../../lib/stripe";
import { adminDb } from "../../lib/firebaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { priceId, uid } = req.body as { priceId?: string; uid?: string };
  if (!priceId || !uid) {
    return res.status(400).json({ error: "priceId and uid are required" });
  }

  const userRef = adminDb.collection("users").doc(uid);
  const userSnap = await userRef.get();
  let customerId = userSnap.data()?.stripeCustomerId as string | undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({ metadata: { firebaseUID: uid } });
    customerId = customer.id;
    await userRef.set({ stripeCustomerId: customerId }, { merge: true });
  }

  const origin = req.headers.origin ?? `https://${req.headers.host}`;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: uid,
    subscription_data: { metadata: { firebaseUID: uid } },
    success_url: `${origin}/for-you?checkout=success`,
    cancel_url: `${origin}/choose-plan`,
  });

  return res.status(200).json({ url: session.url });
}
