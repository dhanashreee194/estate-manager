import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface ProjectState {
  currentProjectId: string | null;
}

const initialState: ProjectState = {
  currentProjectId: null,
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setCurrentProjectId: (state, action: PayloadAction<string>) => {
      state.currentProjectId = action.payload;
    },
    clearCurrentProjectId: (state) => {
      state.currentProjectId = null;
    },
  },
});

export const { setCurrentProjectId, clearCurrentProjectId } =
  projectSlice.actions;
export default projectSlice.reducer;
