import { createAsyncThunk, createSlice, isAnyOf, PayloadAction } from "@reduxjs/toolkit";
import { setAccessToken } from "./tokenStore";

const API_URL = import.meta.env.VITE_API_URL;

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  mobileNumber?: string | number;
  role: "user" | "admin" | "employer";
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  status: "idle" | "loading" | "authenticated" | "guest";
  initialized: boolean;
  error: string | null;
}

interface AuthResponse {
  success: boolean;
  token?: string;
  accessToken?: string;
  user?: AuthUser;
  message?: string;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  status: "idle",
  initialized: false,
  error: null,
};

const clearLegacyAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const applyAuthResponse = (data: AuthResponse) => {
  const token = data.accessToken || data.token || null;
  setAccessToken(token);
  clearLegacyAuth();
  return {
    accessToken: token,
    user: data.user || null,
  };
};

const postJson = async (path: string, body?: unknown) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Authentication failed");
  }

  return data as AuthResponse;
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }) => {
    const data = await postJson("/api/auth/login", payload);
    return applyAuthResponse(data);
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (payload: {
    email: string;
    fullName: string;
    mobileNumber: string;
    password: string;
  }) => {
    const data = await postJson("/api/auth/register", payload);
    return applyAuthResponse(data);
  }
);

export const googleLoginUser = createAsyncThunk(
  "auth/googleLogin",
  async (credential: string | undefined) => {
    const data = await postJson("/api/auth/google-login", { credential });
    return applyAuthResponse(data);
  }
);

export const refreshSession = createAsyncThunk("auth/refresh", async () => {
  const data = await postJson("/api/auth/refresh");
  return applyAuthResponse(data);
});

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => undefined);

  setAccessToken(null);
  clearLegacyAuth();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ accessToken: string | null; user: AuthUser | null }>
    ) {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.status = action.payload.accessToken ? "authenticated" : "guest";
      state.initialized = true;
      setAccessToken(action.payload.accessToken);
      clearLegacyAuth();
    },
    clearCredentials(state) {
      state.accessToken = null;
      state.user = null;
      state.status = "guest";
      state.initialized = true;
      setAccessToken(null);
      clearLegacyAuth();
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginUser.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });

    builder.addCase(registerUser.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });

    builder.addCase(googleLoginUser.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });

    builder.addCase(refreshSession.pending, (state) => {
      state.status = state.initialized ? state.status : "loading";
      state.error = null;
    });

    builder.addCase(refreshSession.rejected, (state) => {
      state.accessToken = null;
      state.user = null;
      state.status = "guest";
      state.initialized = true;
      setAccessToken(null);
      clearLegacyAuth();
    });

    builder.addCase(logoutUser.fulfilled, (state) => {
      state.accessToken = null;
      state.user = null;
      state.status = "guest";
      state.initialized = true;
      state.error = null;
    });

    builder.addMatcher(
      isAnyOf(
        loginUser.fulfilled,
        registerUser.fulfilled,
        googleLoginUser.fulfilled,
        refreshSession.fulfilled
      ),
      (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.status = action.payload.accessToken ? "authenticated" : "guest";
        state.initialized = true;
        state.error = null;
      }
    );

    builder.addMatcher(
      isAnyOf(loginUser.rejected, registerUser.rejected, googleLoginUser.rejected),
      (state, action) => {
        state.accessToken = null;
        state.user = null;
        state.status = "guest";
        state.initialized = true;
        state.error = action.error.message || "Authentication failed";
        setAccessToken(null);
      }
    );
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
