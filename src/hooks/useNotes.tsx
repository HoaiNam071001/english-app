import { FirebaseNoteService } from "@/services/note/firebase.adapter";
import { GuestNoteService } from "@/services/note/guest.adapter";
import { INoteService } from "@/services/note/types";
import { NoteModel } from "@/types";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "./useAuth"; // Hook auth của bạn
import { useToast } from "./useToast"; // Hook toast của bạn

const PAGE_SIZE = 10;

export const useNotes = () => {
  const { userProfile } = useAuth();
  const toast = useToast();

  // State Data
  const [notes, setNotes] = useState<NoteModel[]>([]);
  const [loading, setLoading] = useState(false);

  // State Pagination
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Factory Service: Chọn Adapter dựa trên user
  const service: INoteService = useMemo(() => {
    return userProfile?.id
      ? new FirebaseNoteService(userProfile.id)
      : new GuestNoteService();
  }, [userProfile]);

  // Reset state khi đổi user
  useEffect(() => {
    setNotes([]);
    setLastDoc(null);
    setHasMore(true);
    // Có thể gọi fetchNotes() ngay ở đây nếu muốn tự động load
  }, [userProfile]);

  // --- FETCH / LOAD MORE ---
  const fetchNotes = useCallback(
    async (searchKey = "", isLoadMore = false) => {
      setLoading(true);
      try {
        const currentLastDoc = isLoadMore ? lastDoc : null;
        const currentOffset = isLoadMore ? notes.length : 0;

        const response = await service.fetchNotes(
          PAGE_SIZE,
          currentLastDoc,
          searchKey,
          currentOffset
        );

        if (isLoadMore) {
          setNotes((prev) => [...prev, ...response.data]);
        } else {
          setNotes(response.data);
        }

        setLastDoc(response.lastVisible);
        setHasMore(response.hasMore);
      } catch (error) {
        console.error("Fetch notes failed", error);
        toast.error("Failed to load notes");
      } finally {
        setLoading(false);
      }
    },
    [service, lastDoc]
  );

  // --- ACTIONS ---

  const createNote = async (data: Partial<NoteModel>) => {
    try {
      const newNote = await service.add(data);
      setNotes((prev) => [newNote, ...prev]);
      toast.success("Note created!");
      return newNote;
    } catch (e) {
      console.error(e);
      toast.error("Failed to create note");
    }
  };

  const updateNote = async (id: string, updates: Partial<NoteModel>) => {
    const now = Date.now();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: now } : n))
    );

    try {
      await service.update(id, updates);
      toast.success("Note saved!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save note");
    }
  };

  const deleteNote = async (id: string) => {
    const backup = [...notes];
    setNotes((prev) => prev.filter((n) => n.id !== id));

    try {
      await service.delete(id);
      toast.success("Note deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete note");
      setNotes(backup); // Revert
    }
  };

  return {
    notes,
    loading,
    hasMore,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
  };
};
