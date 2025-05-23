import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import learningReducer, {
  clearLearningData,
  loadLearningFromStorage,
} from "./learningSlice";

const clearLearningOnLogout = (store) => (next) => (action) => {
  const result = next(action);

  if (action.type === "auth/logout") {
    console.log(
      "🔄 Clearing learning data from Redux state after logout (preserving in storage)"
    );
    store.dispatch(clearLearningData());
  }

  return result;
};

const loadLearningAfterAuth = (store) => (next) => (action) => {
  const result = next(action);

  const authSuccessActions = [
    "auth/signInUser/fulfilled",
    "auth/signUpUser/fulfilled",
    "auth/loadUserFromStorage/fulfilled",
  ];

  if (authSuccessActions.includes(action.type)) {
    const state = store.getState();
    const userId = state.auth.user?.id;

    if (userId) {
      console.log(
        "🔄 Loading learning data after successful authentication for user:",
        userId
      );

      setTimeout(() => {
        store.dispatch(loadLearningFromStorage(userId));
      }, 100);
    } else {
      console.log("⚠️ No user ID found after authentication");
    }
  }

  return result;
};

const syncTotalScore = (store) => (next) => (action) => {
  const result = next(action);

  const scoreAffectingActions = [
    "learning/addToLearningList/fulfilled",
    "learning/finishLearning/fulfilled",
    "learning/removeDrug/fulfilled",
    "learning/updateDrugScore/fulfilled",
    "learning/addDrugLocal",
    "learning/updateScoreLocal",
  ];

  if (scoreAffectingActions.includes(action.type)) {
    const state = store.getState();
    const currentLearning = state.learning.currentLearning || [];
    const finished = state.learning.finished || [];

    const calculatedTotal = [...currentLearning, ...finished].reduce(
      (total, drug) => total + (drug.score || 0),
      0
    );

    if (calculatedTotal !== state.learning.totalScore) {
      console.log(
        `📊 Syncing total score: ${state.learning.totalScore} → ${calculatedTotal}`
      );
    }
  }

  return result;
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    learning: learningReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(clearLearningOnLogout, loadLearningAfterAuth, syncTotalScore),
  devTools: process.env.NODE_ENV !== "production",
});
