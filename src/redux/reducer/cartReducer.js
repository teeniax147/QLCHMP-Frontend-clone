import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  countItem: 0,
};

const cartReducer = createSlice({
  name: "cartReducer",
  initialState: initialState,
  reducers: {
    setCountItem: (state, action) => {
      state.countItem = action.payload;
    },
  },
});

export const { setCountItem } = cartReducer.actions;

export default cartReducer.reducer;