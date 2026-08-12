import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { openModal } from "../store/modalSlice";

const TIER_LABEL: Record<string, string> = {
  basic: "Basic",
  premium: "Premium",
  "premium-plus": "Premium Plus",
};

export default function Settings() {
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  if (!user.authLoaded) return null;

  if (!user.uid) {
    return (
      <div className="settings settings--logged-out">
        <img src="/assets/login.png" alt="" />
        <p>Log in to your account to see your details.</p>
        <button className="btn" onClick={() => dispatch(openModal("login"))}>
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="settings">
      <h1 className="section-heading">Settings</h1>
      <div className="settings__row">
        <div className="settings__label">Your Subscription plan</div>
        <div className="settings__value">{TIER_LABEL[user.subscription]}</div>
        {user.subscription === "basic" && (
          <button className="btn" onClick={() => router.push("/choose-plan")}>
            Upgrade to Premium
          </button>
        )}
      </div>
      <div className="settings__row">
        <div className="settings__label">Email</div>
        <div className="settings__value">{user.email}</div>
      </div>
    </div>
  );
}