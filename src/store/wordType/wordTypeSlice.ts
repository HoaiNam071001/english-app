import { GUEST_INFO } from "@/constants";
import { FirebaseWordTypeService } from "@/services/wordType/firebase.adapter";
import { GuestWordTypeService } from "@/services/wordType/guest.adapter";
import { WordType } from "@/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// --- HELPER: Lấy Service dựa trên UserId ---
const getService = (userId?: string) => {
  return userId
    ? new FirebaseWordTypeService(userId)
    : new GuestWordTypeService();
};

// --- TYPES ---
interface WordTypeState {
  items: WordType[];
  loading: boolean;
  error: string | null;
  isLoaded: boolean; // Flag đánh dấu đã fetch lần đầu chưa
  currentUserId: string | null; // Để check nếu đổi user thì fetch lại
}

const initialState: WordTypeState = {
  items: [],
  loading: false,
  error: null,
  isLoaded: false,
  currentUserId: null,
};

// --- ASYNC THUNKS ---

export const fetchWordTypes = createAsyncThunk(
  "wordTypes/fetchAll",
  async (userId: string | undefined, { rejectWithValue }) => {
    try {
      const service = getService(userId);
      const data = await service.fetchAll();
      return { data, userId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addWordType = createAsyncThunk(
  "wordTypes/add",
  async (
    {
      userId,
      entry,
    }: {
      userId: string | undefined;
      entry: Omit<WordType, "id" | "userId" | "createdAt">;
    },
    { rejectWithValue }
  ) => {
    try {
      const service = getService(userId);
      const newItem = await service.add(entry);
      return newItem;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateWordType = createAsyncThunk(
  "wordTypes/update",
  async (
    {
      userId,
      id,
      updates,
    }: { userId: string | undefined; id: string; updates: Partial<WordType> },
    { rejectWithValue }
  ) => {
    try {
      const service = getService(userId);
      await service.update(id, updates);
      return { id, updates };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteWordType = createAsyncThunk(
  "wordTypes/delete",
  async (
    { userId, id }: { userId: string | undefined; id: string },
    { rejectWithValue }
  ) => {
    try {
      const service = getService(userId);
      await service.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// --- SLICE ---
const wordTypeSlice = createSlice({
  name: "wordTypes",
  initialState,
  reducers: {
    // Action để reset store khi logout nếu cần
    clearWordTypes: (state) => {
      state.items = [];
      state.isLoaded = false;
      state.currentUserId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchWordTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWordTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.isLoaded = true;
        state.currentUserId = action.payload.userId || GUEST_INFO.id;
      })
      .addCase(fetchWordTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Add
      .addCase(addWordType.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })

      // Update
      .addCase(updateWordType.fulfilled, (state, action) => {
        const { id, updates } = action.payload;
        const index = state.items.findIndex((item) => item.id === id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...updates };
        }
      })

      // Delete
      .addCase(deleteWordType.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { clearWordTypes } = wordTypeSlice.actions;
export default wordTypeSlice.reducer;
