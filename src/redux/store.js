import { configureStore } from "@reduxjs/toolkit";
import learningReducer from "./learningSlice";

export const store = configureStore({
  reducer: {
    learning: learningReducer,
  },
});
