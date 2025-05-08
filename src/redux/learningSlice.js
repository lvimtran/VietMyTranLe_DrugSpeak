import { createSlice } from "@reduxjs/toolkit";

export const learningSlice = createSlice({
  name: "learning",
  initialState: {
    currentLearning: [],
    finished: [],
  },
  reducers: {
    addToLearningList: (state, action) => {
      const drug = action.payload;
      const isLearning = state.currentLearning.some(
        (item) => item.id === drug.id
      );
      const isFinished = state.finished.some((item) => item.id === drug.id);

      if (!isLearning && !isFinished) {
        state.currentLearning.push(drug);
      }
    },
    finishLearning: (state, action) => {
      const drugId = action.payload;
      const drugIndex = state.currentLearning.findIndex(
        (drug) => drug.id === drugId
      );

      if (drugIndex !== -1) {
        const drug = state.currentLearning[drugIndex];
        state.currentLearning.splice(drugIndex, 1);
        state.finished.push(drug);
      }
    },
    removeDrug: (state, action) => {
      const drugId = action.payload;
      state.currentLearning = state.currentLearning.filter(
        (drug) => drug.id !== drugId
      );
      state.finished = state.finished.filter((drug) => drug.id !== drugId);
    },
  },
});

export const { addToLearningList, finishLearning, removeDrug } =
  learningSlice.actions;
export default learningSlice.reducer;
