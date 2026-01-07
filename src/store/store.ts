import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import wordTypeReducer from "./wordType/wordTypeSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wordTypes: wordTypeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
