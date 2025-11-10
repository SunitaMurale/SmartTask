import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auth, firestore } from '../api/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchUserRole = createAsyncThunk('auth/fetchUserRole', async (uid) => {
  const doc = await firestore().collection('users').doc(uid).get();
  return doc.exists ? doc.data().role : 'user';
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, role: null, loading: false },
  reducers: {
    setUser(state, action) { state.user = action.payload; },
    clearUser(state) { state.user = null; state.role = null; },
    setRole(state, action) { state.role = action.payload; },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUserRole.fulfilled, (state, action) => {
      state.role = action.payload;
    });
  },
});

export const { setUser, clearUser, setRole } = authSlice.actions;


export const persistSession = async (user) => {
  try { await AsyncStorage.setItem('userEmail', user.email || ''); } catch(e){/*noop*/ }
};

export default authSlice.reducer;
