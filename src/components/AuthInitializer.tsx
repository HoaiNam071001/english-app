/* eslint-disable react-hooks/exhaustive-deps */
import { auth, db } from "@/firebaseConfig";
import {
  setFirebaseReady,
  setLoading,
  setUser,
  syncUserToFirestore,
} from "@/store/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { DataTable } from "@/types";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useEffect } from "react";

export const AuthInitializer = () => {
  const dispatch = useAppDispatch();
  const { user, isGuest, isFirebaseReady } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      dispatch(setLoading(true));
      if (!isFirebaseReady) {
        dispatch(setFirebaseReady(true));
      }
      if (currentUser && currentUser.email) {
        const serializableUser = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        };
        dispatch(setUser(serializableUser));

        if (!isGuest) {
          dispatch(syncUserToFirestore(serializableUser));
        }
      } else {
        dispatch(setUser(null));
      }
      dispatch(setLoading(false));
    });
    return () => unsubscribe();
  }, [dispatch, isGuest]);

  // Heartbeat
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (user && user.email) {
      intervalId = setInterval(async () => {
        try {
          const userRef = doc(db, DataTable.USER, user.uid);
          await setDoc(userRef, { lastLoginAt: Date.now() }, { merge: true });
        } catch (err) {
          console.error("Heartbeat failed:", err);
        }
      }, 10 * 60000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user]);

  return null;
};
