import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type SubscriptionTier = "basic" | "premium" | "premium-plus";

interface UserState {
  uid: string | null;
  email: string | null;
  subscription: SubscriptionTier;
  authLoaded: boolean;
}

const initialState: UserState = {
  uid: null,
  email: null,
  subscription: "basic",
  authLoaded: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ uid: string; email: string | null; subscription: SubscriptionTier }>
    ) => {
      state.uid = action.payload.uid;
      state.email = action.payload.email;
      state.subscription = action.payload.subscription;
      state.authLoaded = true;
    },
    clearUser: (state) => {
      state.uid = null;
      state.email = null;
      state.subscription = "basic";
      state.authLoaded = true;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;