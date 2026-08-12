import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ModalMode = "login" | "signup";

interface ModalState {
  isOpen: boolean;
  mode: ModalMode;
}

const initialState: ModalState = { isOpen: false, mode: "login" };

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<ModalMode>) => {
      state.isOpen = true;
      state.mode = action.payload;
    },
    closeModal: (state) => {
      state.isOpen = false;
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;
