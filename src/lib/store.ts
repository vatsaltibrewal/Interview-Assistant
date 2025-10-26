'use client';
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import localForage from "localforage";

import candidate from "./slices/candidateSlice";
import interview from "./slices/interviewSlice";
import roster from "./slices/rosterSlice";

const createNoopStorage = () => ({
  getItem: async () => null,
  setItem: async (_k: string, v: unknown) => v as never,
  removeItem: async () => {},
});

const storage = typeof window !== "undefined" ? localForage : createNoopStorage();

const rootReducer = combineReducers({ candidate, interview, roster });

const persistedReducer = persistReducer(
  { key: "root", version: 1, storage },
  rootReducer
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (gDM) =>
    gDM({
      serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// (Optional) expose for engine helper if you prefer:
if (typeof window !== "undefined") (window as any).__STORE__ = store;
