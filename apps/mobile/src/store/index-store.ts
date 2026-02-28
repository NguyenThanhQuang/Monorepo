import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import { store } from "./store";

export { store };
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Re-export auth types
export type { User, AuthState } from "./authSlice";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
