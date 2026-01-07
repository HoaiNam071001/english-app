import { GUEST_INFO } from "@/constants";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addWordType,
  deleteWordType,
  fetchWordTypes,
  updateWordType,
} from "@/store/wordType/wordTypeSlice";
import { WordType } from "@/types";
import { useCallback } from "react";
import { useAuth } from "./useAuth";
import { useToast } from "./useToast";

export const useWordTypes = () => {
  const { userProfile } = useAuth();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const currentUserId = userProfile?.id || GUEST_INFO.id;
  const {
    items: types,
    loading,
    isLoaded,
    currentUserId: storedUserId,
  } = useAppSelector((state) => state.wordTypes);

  const addType = async (
    entry: Omit<WordType, "id" | "userId" | "createdAt">
  ) => {
    try {
      await dispatch(addWordType({ userId: userProfile?.id, entry })).unwrap();
      toast.success("Type created successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create type");
    }
  };

  const updateType = async (id: string, updates: Partial<WordType>) => {
    try {
      await dispatch(
        updateWordType({ userId: userProfile?.id, id, updates })
      ).unwrap();
      toast.success("Type updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update type");
    }
  };

  const deleteType = async (id: string) => {
    try {
      await dispatch(deleteWordType({ userId: userProfile?.id, id })).unwrap();
      toast.success("Type deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete type");
    }
  };

  const getTypesByIds = useCallback(
    (ids?: string[]) => {
      if (!ids || ids.length === 0) return [];
      return types.filter((t) => ids.includes(t.id));
    },
    [types]
  );

  const fetch = () => {
    const shouldFetch = !isLoaded || storedUserId !== currentUserId;
    if (shouldFetch && !loading) {
      dispatch(fetchWordTypes(userProfile?.id));
    }
  };

  return {
    types,
    loading,
    isLoaded,
    addType,
    updateType,
    deleteType,
    getTypesByIds,
    fetch,
  };
};
