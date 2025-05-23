import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthAPI from "../services/authApi";

const initialState = {
  currentLearning: [],
  finished: [],
  totalScore: 0,
  lastSync: null,
  isLoading: false,
  error: null,
};

export const loadLearningFromStorage = createAsyncThunk(
  "learning/loadLearningFromStorage",
  async (userId, { rejectWithValue }) => {
    try {
      console.log("📱 Loading learning data from storage for user:", userId);

      if (!userId) {
        return null;
      }

      const [currentLearningString, finishedString, totalScoreString] =
        await Promise.all([
          AsyncStorage.getItem(`currentLearning_${userId}`),
          AsyncStorage.getItem(`finished_${userId}`),
          AsyncStorage.getItem(`totalScore_${userId}`),
        ]);

      const currentLearning = currentLearningString
        ? JSON.parse(currentLearningString)
        : [];
      const finished = finishedString ? JSON.parse(finishedString) : [];
      const totalScore = totalScoreString ? parseInt(totalScoreString, 10) : 0;

      console.log("📱 Loaded learning data:", {
        currentLearning: currentLearning.length,
        finished: finished.length,
        totalScore,
      });

      return { currentLearning, finished, totalScore };
    } catch (error) {
      console.error("❌ Failed to load learning data from storage:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const saveLearningToStorage = createAsyncThunk(
  "learning/saveLearningToStorage",
  async (
    { userId, currentLearning, finished, totalScore },
    { rejectWithValue }
  ) => {
    try {
      if (!userId) {
        return;
      }

      await Promise.all([
        AsyncStorage.setItem(
          `currentLearning_${userId}`,
          JSON.stringify(currentLearning || [])
        ),
        AsyncStorage.setItem(
          `finished_${userId}`,
          JSON.stringify(finished || [])
        ),
        AsyncStorage.setItem(
          `totalScore_${userId}`,
          totalScore?.toString() || "0"
        ),
      ]);

      console.log("💾 Saved learning data to storage for user:", userId);
    } catch (error) {
      console.error("❌ Failed to save learning data to storage:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const addToLearningList = createAsyncThunk(
  "learning/addToLearningList",
  async (drug, { getState, rejectWithValue, dispatch }) => {
    try {
      const { auth, learning } = getState();

      // Check if drug is already in current learning or finished
      const isLearning = learning.currentLearning.some(
        (item) => item.id === drug.id
      );
      const isFinished = learning.finished.some((item) => item.id === drug.id);

      if (isLearning || isFinished) {
        throw new Error("Drug is already in learning list");
      }

      // Add score property if not present
      const drugWithScore = { ...drug, score: drug.score || 0 };

      // Try to sync with backend if user is logged in (don't fail if it doesn't work)
      if (auth.user?.token) {
        try {
          await AuthAPI.createLearningRecord(auth.user.token, {
            drugId: drug.id,
            drugName: drug.name,
            status: "current",
            score: drugWithScore.score,
            startedAt: new Date().toISOString(),
          });
          console.log("✅ Backend sync successful for addToLearningList");
        } catch (syncError) {
          console.log(
            "⚠️ Backend sync failed for addToLearningList:",
            syncError
          );
          // Continue anyway - local state is more important than backend sync
        }
      }

      // Save to storage after adding
      if (auth.user?.id) {
        const updatedCurrentLearning = [
          ...learning.currentLearning,
          drugWithScore,
        ];
        dispatch(
          saveLearningToStorage({
            userId: auth.user.id,
            currentLearning: updatedCurrentLearning,
            finished: learning.finished,
            totalScore: learning.totalScore,
          })
        );
      }

      return drugWithScore;
    } catch (error) {
      console.error("Failed to add drug to learning list:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const finishLearning = createAsyncThunk(
  "learning/finishLearning",
  async (drugId, { getState, rejectWithValue, dispatch }) => {
    try {
      const { auth, learning } = getState();

      const drugIndex = learning.currentLearning.findIndex(
        (drug) => drug.id === drugId
      );
      if (drugIndex === -1) {
        throw new Error("Drug not found in current learning");
      }

      const drug = learning.currentLearning[drugIndex];

      // Try to sync with backend if user is logged in (don't fail if it doesn't work)
      if (auth.user?.token) {
        try {
          await AuthAPI.updateLearningRecord(auth.user.token, drugId, {
            status: "finished",
            completedAt: new Date().toISOString(),
            score: drug.score || 0,
          });
          console.log("✅ Backend sync successful for finishLearning");
        } catch (syncError) {
          console.log("⚠️ Backend sync failed for finishLearning:", syncError);
          // Continue anyway - local state is more important than backend sync
        }
      }

      // Save to storage after finishing
      if (auth.user?.id) {
        const updatedCurrentLearning = learning.currentLearning.filter(
          (item) => item.id !== drugId
        );
        const updatedFinished = [...learning.finished, drug];
        dispatch(
          saveLearningToStorage({
            userId: auth.user.id,
            currentLearning: updatedCurrentLearning,
            finished: updatedFinished,
            totalScore: learning.totalScore,
          })
        );
      }

      return drug;
    } catch (error) {
      console.error("Failed to finish learning:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const removeDrug = createAsyncThunk(
  "learning/removeDrug",
  async (drugId, { getState, rejectWithValue, dispatch }) => {
    try {
      const { auth, learning } = getState();

      // Try to sync with backend if user is logged in (don't fail if it doesn't work)
      if (auth.user?.token) {
        try {
          await AuthAPI.deleteLearningRecord(auth.user.token, drugId);
          console.log("✅ Backend sync successful for removeDrug");
        } catch (syncError) {
          console.log("⚠️ Backend sync failed for removeDrug:", syncError);
          // Continue anyway - local state is more important than backend sync
        }
      }

      // Save to storage after removing
      if (auth.user?.id) {
        const updatedCurrentLearning = learning.currentLearning.filter(
          (item) => item.id !== drugId
        );
        const updatedFinished = learning.finished.filter(
          (item) => item.id !== drugId
        );
        const newTotalScore = [
          ...updatedCurrentLearning,
          ...updatedFinished,
        ].reduce((total, drug) => total + (drug.score || 0), 0);
        dispatch(
          saveLearningToStorage({
            userId: auth.user.id,
            currentLearning: updatedCurrentLearning,
            finished: updatedFinished,
            totalScore: newTotalScore,
          })
        );
      }

      return drugId;
    } catch (error) {
      console.error("Failed to remove drug:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateDrugScore = createAsyncThunk(
  "learning/updateDrugScore",
  async ({ drugId, score }, { getState, rejectWithValue, dispatch }) => {
    try {
      const { auth, learning } = getState();

      // Try to sync with backend if user is logged in (don't fail if it doesn't work)
      if (auth.user?.token) {
        try {
          await AuthAPI.updateUserScore(auth.user.token, {
            drugId,
            score,
            evaluatedAt: new Date().toISOString(),
          });
          console.log("✅ Backend sync successful for updateDrugScore");
        } catch (syncError) {
          console.log("⚠️ Backend sync failed for updateDrugScore:", syncError);
          // Continue anyway - local state is more important than backend sync
        }
      }

      // Calculate new total score and save to storage
      if (auth.user?.id) {
        // Update the score in the arrays
        const updatedCurrentLearning = learning.currentLearning.map((drug) =>
          drug.id === drugId ? { ...drug, score } : drug
        );
        const updatedFinished = learning.finished.map((drug) =>
          drug.id === drugId ? { ...drug, score } : drug
        );
        const newTotalScore = [
          ...updatedCurrentLearning,
          ...updatedFinished,
        ].reduce((total, drug) => total + (drug.score || 0), 0);

        dispatch(
          saveLearningToStorage({
            userId: auth.user.id,
            currentLearning: updatedCurrentLearning,
            finished: updatedFinished,
            totalScore: newTotalScore,
          })
        );
      }

      return { drugId, score };
    } catch (error) {
      console.error("Failed to update drug score:", error);
      // Don't reject - we want the local update to succeed even if backend fails
      return { drugId, score };
    }
  }
);

export const syncWithBackend = createAsyncThunk(
  "learning/syncWithBackend",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth, learning } = getState();

      if (!auth.user?.token) {
        throw new Error("No authentication token available");
      }

      const response = await AuthAPI.syncLearningState(auth.user.token, {
        currentLearning: learning.currentLearning,
        finished: learning.finished,
        totalScore: learning.totalScore,
      });

      return response;
    } catch (error) {
      console.error("Failed to sync with backend:", error);
      return rejectWithValue(error.message);
    }
  }
);

const learningSlice = createSlice({
  name: "learning",
  initialState,
  reducers: {
    setTotalScore: (state, action) => {
      state.totalScore = action.payload;
    },
    clearLearningData: (state) => {
      state.currentLearning = [];
      state.finished = [];
      state.totalScore = 0;
      state.lastSync = null;
    },
    // ADDED: Set learning data from storage
    setLearningData: (state, action) => {
      const { currentLearning, finished, totalScore } = action.payload;
      state.currentLearning = currentLearning || [];
      state.finished = finished || [];
      state.totalScore = totalScore || 0;
    },
    // Local-only actions for immediate UI updates
    addDrugLocal: (state, action) => {
      const drug = action.payload;
      const isLearning = state.currentLearning.some(
        (item) => item.id === drug.id
      );
      const isFinished = state.finished.some((item) => item.id === drug.id);

      if (!isLearning && !isFinished) {
        state.currentLearning.push({ ...drug, score: drug.score || 0 });
      }
    },
    updateScoreLocal: (state, action) => {
      const { drugId, score } = action.payload;

      // Update score in current learning
      const currentIndex = state.currentLearning.findIndex(
        (drug) => drug.id === drugId
      );
      if (currentIndex !== -1) {
        state.currentLearning[currentIndex].score = score;
      }

      // Update score in finished learning
      const finishedIndex = state.finished.findIndex(
        (drug) => drug.id === drugId
      );
      if (finishedIndex !== -1) {
        state.finished[finishedIndex].score = score;
      }

      // Update total score
      state.totalScore = [...state.currentLearning, ...state.finished].reduce(
        (total, drug) => total + (drug.score || 0),
        0
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // ADDED: Load learning data from storage
      .addCase(loadLearningFromStorage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadLearningFromStorage.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.currentLearning = action.payload.currentLearning || [];
          state.finished = action.payload.finished || [];
          state.totalScore = action.payload.totalScore || 0;
        }
      })
      .addCase(loadLearningFromStorage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Save learning data to storage (no state changes needed)
      .addCase(saveLearningToStorage.rejected, (state, action) => {
        console.error("Failed to save learning data:", action.payload);
      })

      // Add to learning list
      .addCase(addToLearningList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToLearningList.fulfilled, (state, action) => {
        state.isLoading = false;
        const drug = action.payload;
        const isLearning = state.currentLearning.some(
          (item) => item.id === drug.id
        );
        const isFinished = state.finished.some((item) => item.id === drug.id);

        if (!isLearning && !isFinished) {
          state.currentLearning.push(drug);
        }
      })
      .addCase(addToLearningList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Finish learning
      .addCase(finishLearning.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(finishLearning.fulfilled, (state, action) => {
        state.isLoading = false;
        const drug = action.payload;

        // Remove from current learning
        state.currentLearning = state.currentLearning.filter(
          (item) => item.id !== drug.id
        );

        // Add to finished if not already there
        const isFinished = state.finished.some((item) => item.id === drug.id);
        if (!isFinished) {
          state.finished.push(drug);
        }
      })
      .addCase(finishLearning.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Remove drug
      .addCase(removeDrug.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeDrug.fulfilled, (state, action) => {
        state.isLoading = false;
        const drugId = action.payload;

        // Remove from both lists
        state.currentLearning = state.currentLearning.filter(
          (item) => item.id !== drugId
        );
        state.finished = state.finished.filter((item) => item.id !== drugId);

        // Update total score
        state.totalScore = [...state.currentLearning, ...state.finished].reduce(
          (total, drug) => total + (drug.score || 0),
          0
        );
      })
      .addCase(removeDrug.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update drug score
      .addCase(updateDrugScore.pending, (state) => {
        state.error = null;
      })
      .addCase(updateDrugScore.fulfilled, (state, action) => {
        const { drugId, score } = action.payload;

        // Update score in current learning
        const currentIndex = state.currentLearning.findIndex(
          (drug) => drug.id === drugId
        );
        if (currentIndex !== -1) {
          state.currentLearning[currentIndex].score = score;
        }

        // Update score in finished learning
        const finishedIndex = state.finished.findIndex(
          (drug) => drug.id === drugId
        );
        if (finishedIndex !== -1) {
          state.finished[finishedIndex].score = score;
        }

        // Update total score
        state.totalScore = [...state.currentLearning, ...state.finished].reduce(
          (total, drug) => total + (drug.score || 0),
          0
        );
      })
      .addCase(updateDrugScore.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Sync with backend
      .addCase(syncWithBackend.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(syncWithBackend.fulfilled, (state, action) => {
        state.isLoading = false;
        const { currentLearning, finished, totalScore } = action.payload;

        if (currentLearning) {
          state.currentLearning = currentLearning;
        }
        if (finished) {
          state.finished = finished;
        }
        if (totalScore !== undefined) {
          state.totalScore = totalScore;
        }

        state.lastSync = new Date().toISOString();
      })
      .addCase(syncWithBackend.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setTotalScore,
  clearLearningData,
  setLearningData,
  addDrugLocal,
  updateScoreLocal,
} = learningSlice.actions;

export default learningSlice.reducer;
