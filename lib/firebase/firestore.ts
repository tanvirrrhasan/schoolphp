// Re-export from API client (PHP/MySQL backend)
export {
  createDocument,
  updateDocument,
  setDocument,
  deleteDocument,
  getDocument,
  getDocuments,
  subscribeToCollection,
  subscribeToDocument,
  convertTimestamp,
  toFirestoreTimestamp,
} from "@/lib/api/client";

