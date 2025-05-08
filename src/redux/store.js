import { configureStore } from "@reduxjs/toolkit";
import { learningSlice } from "./learningSlice";

export const store = configureStore({
  reducer: {
    learning: learningSlice,
  },
});
