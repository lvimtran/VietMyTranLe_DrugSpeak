import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthAPI from "../services/authApi";

const initialState = {
  user: null,
  isLoggedIn: false,
  isLoading: false,
  error: null,
  profileLoading: false,
  profileError: null,
};

// Load user from storage
export const loadUserFromStorage = createAsyncThunk(
  "auth/loadUserFromStorage",
  async (_, { rejectWithValue }) => {
    try {
      const userString = await AsyncStorage.getItem("user");
      const tokenString = await AsyncStorage.getItem("authToken");

      if (userString && tokenString) {
        const user = JSON.parse(userString);
        const token = tokenString;
        try {
          const profile = await AuthAPI.getProfile(token);
          return { ...user, token };
        } catch (error) {
          await AsyncStorage.multiRemove(["user", "authToken"]);
          return null;
        }
      }
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Refresh user profile
export const refreshUserProfile = createAsyncThunk(
  "auth/refreshUserProfile",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.user?.token) {
        throw new Error("No authentication token available");
      }

      const profile = await AuthAPI.getProfile(auth.user.token);
      return profile;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update user profile
export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.user?.token) {
        throw new Error("No authentication token available");
      }

      const response = await AuthAPI.updateProfile(
        auth.user.token,
        profileData
      );
      return response.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
      state.isLoggedIn = true;
      state.error = null;

      const { token, ...userWithoutToken } = action.payload;
      AsyncStorage.setItem("user", JSON.stringify(userWithoutToken));
      if (token) {
        AsyncStorage.setItem("authToken", token);
      }
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.error = null;
      state.profileError = null;

      AsyncStorage.multiRemove(["user", "authToken"]);
    },
    clearError: (state) => {
      state.error = null;
      state.profileError = null;
    },
    updateUserData: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        const { token, ...userWithoutToken } = state.user;
        AsyncStorage.setItem("user", JSON.stringify(userWithoutToken));
      }
    },
    setAuthState: (state, action) => {
      state.isLoggedIn = action.payload;
    },
  },
});

export const { login, logout, clearError, updateUserData, setAuthState } =
  authSlice.actions;
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectIsAuthenticated = (state) => state.auth.isLoggedIn;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectProfileLoading = (state) => state.auth.profileLoading;
export const selectProfileError = (state) => state.auth.profileError;

export default authSlice.reducer;
