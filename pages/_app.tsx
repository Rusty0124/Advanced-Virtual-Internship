import { useEffect } from "react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { Provider } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { store } from "../store";
import { useAppDispatch } from "../hooks/redux";
import { setUser, clearUser } from "../store/userSlice";
import type { SubscriptionTier } from "../store/userSlice";
import { auth } from "../lib/firebase";
import Layout from "../components/layout/Layout";
import "../styles/globals.css";
import "../styles/app.css";

function AuthListener({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        dispatch(clearUser());
        return;
      }
      const tokenResult = await firebaseUser.getIdTokenResult();
      const stripeRole = (tokenResult.claims.stripeRole as SubscriptionTier | undefined) ?? "basic";
      dispatch(
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          subscription: stripeRole,
        })
      );
    });
    return unsubscribe;
  }, [dispatch]);

  // Custom claims only land on the ID token after a forced refresh, so a
  // user redirected back from a successful Stripe Checkout won't otherwise
  // see their new subscription tier until their token naturally rotates.
  useEffect(() => {
    if (router.query.checkout !== "success" || !auth.currentUser) return;
    auth.currentUser.getIdTokenResult(true).then((tokenResult) => {
      const stripeRole = (tokenResult.claims.stripeRole as SubscriptionTier | undefined) ?? "basic";
      if (!auth.currentUser) return;
      dispatch(
        setUser({
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          subscription: stripeRole,
        })
      );
    });
    const { checkout, ...rest } = router.query;
    void checkout;
    router.replace({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.checkout]);

  return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <AuthListener>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthListener>
    </Provider>
  );
}
