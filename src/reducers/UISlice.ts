import { createSlice } from '@reduxjs/toolkit';
import { IUIState } from '../Types/types';
import { RootState } from '../store';

const initialState: IUIState = {
  isLoading: false,
};

const UISlice = createSlice({
  name: 'UIState',
  initialState,
  reducers: {
    startLoading: (state) => {
      state.isLoading = true;
    },
    stopLoading: (state) => {
      state.isLoading = false;
    },
  },
});

export const { startLoading, stopLoading } = UISlice.actions;

export const selectUIState = (state: RootState) => state.UIState;

export default UISlice.reducer;
