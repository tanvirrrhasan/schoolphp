import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  QuerySnapshot,
} from "firebase/firestore";
import { db } from "./config";

// Helper to convert Firestore timestamps
export const convertTimestamp = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp);
};

// Helper to convert Date to Firestore timestamp
export const toFirestoreTimestamp = (date: Date | string): Timestamp => {
  if (typeof date === "string") {
    return Timestamp.fromDate(new Date(date));
  }
  return Timestamp.fromDate(date);
};

// Generic CRUD operations
export const createDocument = async (collectionName: string, data: any) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || "ডকুমেন্ট তৈরি ব্যর্থ হয়েছে");
  }
};

export const updateDocument = async (
  collectionName: string,
  id: string,
  data: any
) => {
  try {
    await updateDoc(doc(db, collectionName, id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error: any) {
    throw new Error(error.message || "ডকুমেন্ট আপডেট ব্যর্থ হয়েছে");
  }
};

export const setDocument = async (
  collectionName: string,
  id: string,
  data: any
) => {
  try {
    await setDoc(
      doc(db, collectionName, id),
      {
        ...data,
        createdAt: data?.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
  } catch (error: any) {
    throw new Error(error.message || "ডকুমেন্ট সংরক্ষণ ব্যর্থ হয়েছে");
  }
};

export const deleteDocument = async (collectionName: string, id: string) => {
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (error: any) {
    throw new Error(error.message || "ডকুমেন্ট মুছে ফেলা ব্যর্থ হয়েছে");
  }
};

export const getDocument = async (collectionName: string, id: string) => {
  try {
    const docSnap = await getDoc(doc(db, collectionName, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error: any) {
    throw new Error(error.message || "ডকুমেন্ট পাওয়া যায়নি");
  }
};

export const getDocuments = async (
  collectionName: string,
  filters?: { field: string; operator: any; value: any }[],
  orderByField?: string,
  orderDirection: "asc" | "desc" = "desc",
  limitCount?: number
) => {
  try {
    let q = query(collection(db, collectionName));

    if (filters) {
      filters.forEach((filter) => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });
    }

    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection));
    }

    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error: any) {
    throw new Error(error.message || "ডকুমেন্ট পাওয়া যায়নি");
  }
};

// Real-time subscription
export const subscribeToCollection = (
  collectionName: string,
  callback: (docs: any[]) => void,
  filters?: { field: string; operator: any; value: any }[],
  orderByField?: string,
  orderDirection: "asc" | "desc" = "desc"
) => {
  let q = query(collection(db, collectionName));

  if (filters) {
    filters.forEach((filter) => {
      q = query(q, where(filter.field, filter.operator, filter.value));
    });
  }

  if (orderByField) {
    q = query(q, orderBy(orderByField, orderDirection));
  }

  return onSnapshot(q, (snapshot: QuerySnapshot) => {
    const docs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(docs);
  });
};

