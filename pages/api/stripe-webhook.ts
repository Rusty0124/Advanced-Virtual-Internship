import type { NextApiRequest, NextApiResponse } from "next";
import type Stripe from "stripe";
import { stripe, PRICE_TO_TIER } from "../../lib/stripe";
import { adminAuth, adminDb } from "../../lib/firebaseAdmin";

export const config = {
  api: { bodyParser: false },
};

function readRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function setSubscriptionTier(uid: string, tier: "basic" | "premium" | "premium-plus") {
  const existingClaims = (await adminAuth.getUser(uid)).customClaims ?? {};
  await adminAuth.setCustomUserClaims(uid, { ...existingClaims, stripeRole: tier });
  await adminDb.collection("users").doc(uid).set({ subscription: tier }, { merge: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const sig = req.headers["stripe-signature"];
  if (!sig) return res.status(400).send("Missing stripe-signature header");

  let event: Stripe.Event;
  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(400).send(`Webhook signature verification failed: ${message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const uid = session.client_reference_id;
      if (uid && typeof session.subscription === "string") {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        const priceId = subscription.items.data[0]?.price.id;
        const tier = (priceId && PRICE_TO_TIER[priceId]) || "premium";
        await setSubscriptionTier(uid, tier);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const uid = subscription.metadata.firebaseUID;
      if (uid) {
        if (subscription.status === "active" || subscription.status === "trialing") {
          const priceId = subscription.items.data[0]?.price.id;
          const tier = (priceId && PRICE_TO_TIER[priceId]) || "premium";
          await setSubscriptionTier(uid, tier);
        } else {
          await setSubscriptionTier(uid, "basic");
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const uid = subscription.metadata.firebaseUID;
      if (uid) await setSubscriptionTier(uid, "basic");
      break;
    }
  }

  return res.status(200).json({ received: true });
}
