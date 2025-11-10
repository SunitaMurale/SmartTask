import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [], 
  filterText: '',
  sortMode: 'createdAt',
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks(state, action) { state.list = action.payload; },
    addTaskLocal(state, action) { state.list.unshift(action.payload); },
    updateTaskLocal(state, action) {
      const idx = state.list.findIndex(t => t.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
    },
    deleteTaskLocal(state, action) {
      state.list = state.list.filter(t => t.id !== action.payload);
    },
    setFilterText(state, action) { state.filterText = action.payload; },
    setSortMode(state, action) { state.sortMode = action.payload; },
  }
});

export const {
  setTasks, addTaskLocal, updateTaskLocal, deleteTaskLocal, setFilterText, setSortMode
} = tasksSlice.actions;

export default tasksSlice.reducer;
