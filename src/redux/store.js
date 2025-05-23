import { configureStore } from "@reduxjs/toolkit";
import learningReducer from "./learningSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    learning: learningReducer,
    auth: authReducer,
  },
});
