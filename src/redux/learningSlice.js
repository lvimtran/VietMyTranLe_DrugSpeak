import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentLearning: [],
  finished: [],
};

const learningSlice = createSlice({
  name: "learning",
  initialState,
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
  },
});

export const { addToLearningList } = learningSlice.actions;
export default learningSlice.reducer;
