export interface NoteModel {
  id: string;
  title: string;
  content: string;
  normalizedTitle: string;
  updatedAt: number; // Timestamp
  createdAt: number; // Timestamp
  userId: string;
}
