import { useFirebaseVocabulary } from "./useFirebaseVocabulary"; // File cũ của bạn (đổi tên export)
import { useGuestVocabulary } from "./useGuestVocabulary";       // File mới tạo ở trên

export const useVocabulary = (userId: string | null) => {
  const firebaseData = useFirebaseVocabulary(userId);
  const guestData = useGuestVocabulary();

  if (userId) {
    return firebaseData;
  } else {
    return guestData;
  }
};