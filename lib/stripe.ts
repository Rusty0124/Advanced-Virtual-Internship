import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-07-29.dahlia",
});

export const PRICE_TO_TIER: Record<string, "premium" | "premium-plus"> = {
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY ?? ""]: "premium",
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY ?? ""]: "premium-plus",
};
