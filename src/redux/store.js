import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./reducer/cartReducer";

export const store = configureStore({
  reducer: {
    cartReducer: cartReducer,
  },
});