import {
  loginWithGoogle,
  logout,
  removeSavedAccount,
  setIsGuest,
  switchAccount,
} from "@/store/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useCallback } from "react";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);

  const handleLoginWithGoogle = useCallback(
    async (emailHint?: string) => {
      return dispatch(loginWithGoogle(emailHint)).unwrap();
    },
    [dispatch]
  );

  const handleLogout = useCallback(async () => {
    return dispatch(logout()).unwrap();
  }, [dispatch]);

  const handleSwitchAccount = useCallback(() => {
    dispatch(switchAccount());
  }, [dispatch]);

  const handleSetIsGuest = useCallback(
    (val: boolean) => {
      dispatch(setIsGuest(val));
    },
    [dispatch]
  );

  const handleRemoveSavedAccount = useCallback(
    (email: string) => {
      dispatch(removeSavedAccount(email));
    },
    [dispatch]
  );

  return {
    ...authState,
    loginWithGoogle: handleLoginWithGoogle,
    logout: handleLogout,
    switchAccount: handleSwitchAccount,
    setIsGuest: handleSetIsGuest,
    removeSavedAccount: handleRemoveSavedAccount,
  };
};
