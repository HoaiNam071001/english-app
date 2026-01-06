import { STORAGE_KEY } from "@/constants";
import { auth, db, googleProvider } from "@/firebaseConfig";
import { RootState } from "@/store/store";
import {
  DataTable,
  SavedAccount,
  UserProfile,
  UserRole,
  UserStatus,
} from "@/types";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

// --- TYPES ---
export interface SerializableUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: SerializableUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isGuest: boolean;
}

// --- HELPER ---
const saveAccountToStorage = (user: SerializableUser) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY.SAVED_ACCOUNTS);
    let accounts: SavedAccount[] = stored ? JSON.parse(stored) : [];
    if (user.email) {
      accounts = accounts.filter((acc) => acc.email !== user.email);
      accounts.unshift({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: Date.now(),
      });
      if (accounts.length > 5) accounts.pop();
      localStorage.setItem(
        STORAGE_KEY.SAVED_ACCOUNTS,
        JSON.stringify(accounts)
      );
    }
  } catch (e) {
    console.error("Failed to save account", e);
  }
};

// --- THUNKS ---

// 1. Sync User (Fix TS4094: Explicit Types)
export const syncUserToFirestore = createAsyncThunk<
  UserProfile, // Return Type
  SerializableUser, // Argument Type
  { rejectValue: string } // Config
>("auth/syncUserToFirestore", async (currentUser, { rejectWithValue }) => {
  try {
    const userRef = doc(db, DataTable.USER, currentUser.uid);
    const userSnap = await getDoc(userRef);
    let profile: UserProfile;

    if (userSnap.exists()) {
      profile = { ...userSnap.data() } as UserProfile;
      await setDoc(
        userRef,
        { lastLoginAt: Date.now(), photoURL: currentUser.photoURL },
        { merge: true }
      );
    } else {
      profile = {
        id: currentUser.uid,
        email: currentUser.email,
        role: UserRole.USER,
        status: UserStatus.PENDING,
        photoURL: currentUser.photoURL,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
      };
      await setDoc(userRef, profile);
    }
    return profile;
  } catch (err) {
    return rejectWithValue(err.message || "Lỗi đồng bộ thông tin.");
  }
});

// 2. Login Google (Fix TS4094: Explicit Types)
export const loginWithGoogle = createAsyncThunk<
  void, // Return Type
  string | undefined, // Argument Type (emailHint)
  { state: RootState; rejectValue: string } // Config
>("auth/loginWithGoogle", async (emailHint, { dispatch, rejectWithValue }) => {
  try {
    const currentUser = auth.currentUser;

    // Case 1: Re-login chính account đó
    if (currentUser?.email && emailHint === currentUser.email) {
      const serializedUser: SerializableUser = {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
      };
      await dispatch(syncUserToFirestore(serializedUser));
      return;
    }

    // Case 2: Logout cũ
    if (currentUser) {
      await signOut(auth);
    }

    // Case 3: Popup
    if (emailHint) {
      googleProvider.setCustomParameters({ login_hint: emailHint });
    } else {
      googleProvider.setCustomParameters({ prompt: "select_account" });
    }

    await signInWithPopup(auth, googleProvider);
    // AuthInitializer sẽ lắng nghe tiếp
  } catch (err) {
    if (err.code === "auth/popup-closed-by-user") {
      return rejectWithValue("Đã đóng cửa sổ đăng nhập.");
    }
    return rejectWithValue("Đăng nhập thất bại.");
  }
});

// 3. Logout (Fix TS4094)
export const logout = createAsyncThunk<
  { isGuestLogout: boolean },
  void,
  { state: RootState }
>("auth/logout", async (_, { getState }) => {
  const state = getState();
  if (state.auth.isGuest) {
    localStorage.removeItem(STORAGE_KEY.IS_GUEST);
    return { isGuestLogout: true };
  }
  await signOut(auth);
  return { isGuestLogout: false };
});

// --- SLICE ---
const initialState: AuthState = {
  user: null,
  userProfile: null,
  loading: true,
  error: null,
  isGuest: localStorage.getItem(STORAGE_KEY.IS_GUEST) === "true",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<SerializableUser | null>) => {
      state.user = action.payload;
      if (action.payload) saveAccountToStorage(action.payload);
      else state.userProfile = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setIsGuest: (state, action: PayloadAction<boolean>) => {
      state.isGuest = action.payload;
      localStorage.setItem(STORAGE_KEY.IS_GUEST, String(action.payload));
    },
    switchAccount: (state) => {
      state.userProfile = null;
    },
    removeSavedAccount: (state, action: PayloadAction<string>) => {
      const stored = localStorage.getItem(STORAGE_KEY.SAVED_ACCOUNTS);
      if (stored) {
        let accounts: SavedAccount[] = JSON.parse(stored);
        accounts = accounts.filter((acc) => acc.email !== action.payload);
        localStorage.setItem(
          STORAGE_KEY.SAVED_ACCOUNTS,
          JSON.stringify(accounts)
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncUserToFirestore.fulfilled, (state, action) => {
        state.userProfile = action.payload;
        state.error = null;
      })
      .addCase(syncUserToFirestore.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state, action) => {
        if (action.payload.isGuestLogout) state.isGuest = false;
        else {
          state.user = null;
          state.userProfile = null;
        }
      });
  },
});

export const {
  setUser,
  setLoading,
  setIsGuest,
  switchAccount,
  removeSavedAccount,
} = authSlice.actions;
export default authSlice.reducer;
