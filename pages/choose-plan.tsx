import { useState } from "react";
import { FiZap, FiUsers, FiTarget, FiChevronDown } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { openModal } from "../store/modalSlice";

const PLANS = {
  yearly: {
    label: "Premium Plus Yearly",
    price: "$99.99/year",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY ?? "",
    trial: "7-day free trial included",
  },
  monthly: {
    label: "Premium Monthly",
    price: "$9.99/month",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY ?? "",
    trial: "No trial included",
  },
} as const;

const FEATURES = [
  { icon: <FiZap />, text: "Key ideas in few min with many books to read" },
  { icon: <FiUsers />, text: "3 million people growing with Summarist everyday" },
  { icon: <FiTarget />, text: "Precise recommendations collections curated by experts" },
];

const FAQ = [
  {
    q: "How does the free trial work?",
    a: "You are under no obligation to continue your subscription, and you will only be billed when the trial period expires. You can cancel any time before the 7-day free trial ends at no charge.",
  },
  {
    q: "Can I switch plans later?",
    a: "While an annual plan is active, it isn't possible to switch to monthly. Once your current monthly billing cycle ends, though, moving to an annual plan is always an option.",
  },
  {
    q: "What do I get with Premium?",
    a: "Unlimited access to our full library, higher-quality audio, offline downloads, and the ability to send books to your Kindle.",
  },
  {
    q: "What happens if I cancel?",
    a: "You keep access to one curated free book per day.",
  },
];

export default function ChoosePlan() {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  const handleCheckout = async () => {
    if (!user.uid) {
      dispatch(openModal("login"));
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: PLANS[selectedPlan].priceId, uid: user.uid }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="choose-plan">
      <div className="plan__header--wrapper">
        <div className="plan__header">
          <h1>Get unlimited access to many amazing books to read</h1>
          <p>Turn ordinary moments into amazing learning opportunities.</p>
          <img src="/assets/pricing-top.png" alt="pricing" />
        </div>
      </div>

      <div className="plan__features">
        {FEATURES.map((feature) => (
          <div key={feature.text}>
            <div className="plan__feature-icon">{feature.icon}</div>
            <div className="plan__feature-text">{feature.text}</div>
          </div>
        ))}
      </div>

      <h2 className="section-heading" style={{ textAlign: "center", marginBottom: 24 }}>
        Choose the plan that fits you
      </h2>

      <div className="plans">
        {(Object.keys(PLANS) as Array<keyof typeof PLANS>).map((key, i) => (
          <div key={key}>
            <button
              className={`plan ${selectedPlan === key ? "plan--selected" : ""}`}
              onClick={() => setSelectedPlan(key)}
            >
              <span className="plan__radio">{selectedPlan === key && <span className="plan__radio-dot" />}</span>
              <div>
                <div className="plan__label">{PLANS[key].label}</div>
                <div className="plan__price">{PLANS[key].price}</div>
                <div className="plan__trial">{PLANS[key].trial}</div>
              </div>
            </button>
            {i === 0 && <div className="plan__separator">or</div>}
          </div>
        ))}
      </div>

      <div className="plan__cta">
        <button className="btn" onClick={handleCheckout} disabled={loading}>
          {loading ? "Redirecting…" : selectedPlan === "yearly" ? "Start your free trial" : "Get started"}
        </button>
        {error && <div className="modal__error">{error}</div>}
        <p className="plan__disclaimer">
          Cancel your trial at any time before it ends, and you won&apos;t be charged.
        </p>
      </div>

      <div className="faq">
        {FAQ.map((item, i) => (
          <div key={item.q} className="faq__item">
            <button className="faq__question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              {item.q}
              <FiChevronDown className={`faq__icon ${openFaq === i ? "faq__icon--open" : ""}`} />
            </button>
            {openFaq === i && <div className="faq__answer">{item.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
