import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });

export const adminDb = getFirestore(app);

// firebase-admin/auth pulls in jwks-rsa -> jose, which ships ESM-only and
// breaks under Vercel's production build (require() of an ESM-only module).
// getUser/setCustomUserClaims don't need JWT verification, so we call the
// Identity Toolkit REST API directly instead of importing firebase-admin/auth.
const IDENTITY_TOOLKIT_URL = "https://identitytoolkit.googleapis.com/v1/accounts";

async function getAccessToken(): Promise<string> {
  const { access_token } = await app.options.credential!.getAccessToken();
  return access_token;
}

export async function adminGetCustomClaims(uid: string): Promise<Record<string, unknown>> {
  const token = await getAccessToken();
  const res = await fetch(`${IDENTITY_TOOLKIT_URL}:lookup`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ localId: [uid] }),
  });
  const data = await res.json();
  const customAttributes = data.users?.[0]?.customAttributes;
  return customAttributes ? JSON.parse(customAttributes) : {};
}

export async function adminSetCustomClaims(uid: string, claims: Record<string, unknown>): Promise<void> {
  const token = await getAccessToken();
  await fetch(`${IDENTITY_TOOLKIT_URL}:update`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ localId: uid, customAttributes: JSON.stringify(claims) }),
  });
}
