import { useState } from "react";
import { useRouter } from "next/router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  AuthError,
} from "firebase/auth";
import { auth } from "../../lib/firebase";
import { GUEST_EMAIL, GUEST_PASSWORD } from "../../constants/auth";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { closeModal, openModal } from "../../store/modalSlice";

const ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "auth/user-not-found": "No account found with that email and password.",
  "auth/wrong-password": "No account found with that email and password.",
  "auth/invalid-credential": "No account found with that email and password.",
};

export default function AuthModal() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isOpen, mode } = useAppSelector((state) => state.modal);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setError("");
    setResetSent(false);
  };

  const handleClose = () => {
    resetForm();
    dispatch(closeModal());
  };

  const handleSuccess = () => {
    resetForm();
    dispatch(closeModal());
    router.push("/for-you");
  };

  const handleError = (err: unknown) => {
    const code = (err as AuthError).code;
    setError(ERROR_MESSAGES[code] ?? "Something went wrong. Please try again.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      handleSuccess();
    } catch (err) {
      handleError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    setError("");
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, GUEST_EMAIL, GUEST_PASSWORD);
      handleSuccess();
    } catch (err) {
      handleError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setSubmitting(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      handleSuccess();
    } catch (err) {
      handleError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Enter your email above, then click Forgot your password? again.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError("");
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="modal__overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={handleClose} aria-label="Close">
          &times;
        </button>
        <div className="modal__body">
        <h2 className="modal__title">
          {mode === "signup" ? "Sign up to Summarist" : "Log in to Summarist"}
        </h2>

        {mode === "login" && (
          <>
            <button className="btn btn--guest" onClick={handleGuestLogin} disabled={submitting}>
              <span className="btn__icon--mask">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12Zm0 2.5c-3.3 0-9.8 1.6-9.8 4.9v2.4h19.6v-2.4c0-3.3-6.5-4.9-9.8-4.9Z" />
                </svg>
              </span>
              Login as a Guest
            </button>
            <div className="modal__divider">or</div>
          </>
        )}

        <button className="btn btn--google" onClick={handleGoogleLogin} disabled={submitting}>
          <span className="btn__icon--mask">
            <img src="/assets/google.png" alt="" aria-hidden="true" />
          </span>
          {mode === "signup" ? "Sign up with Google" : "Login with Google"}
        </button>

        <div className="modal__divider">or</div>

        <form onSubmit={handleSubmit} className="modal__form">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="modal__error">{error}</div>}
          {resetSent && (
            <div className="modal__success">Password reset email sent — check your inbox.</div>
          )}
          <button type="submit" className="btn" disabled={submitting}>
            {mode === "signup" ? "Sign up" : "Login"}
          </button>
        </form>

        {mode === "login" && (
          <button className="modal__link" onClick={handleForgotPassword}>
            Forgot your password?
          </button>
        )}
        </div>

        <button
          className="modal__switch"
          onClick={() => {
            resetForm();
            dispatch(openModal(mode === "signup" ? "login" : "signup"));
          }}
        >
          {mode === "signup" ? "Already have an account?" : "Don't have an account?"}
        </button>
      </div>
    </div>
  );
}